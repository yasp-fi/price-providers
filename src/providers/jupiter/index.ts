import { PriceProvider } from '../../core/provider'
import {
  Asset,
  PriceQuote,
  PriceQuoteProperties,
  ProviderSlug,
  SupportedChains,
} from '@yasp/models'
import ms from 'ms'
import { createSafeWretch } from '@yasp/requests'
import { JUPITER_PRICE_API_URL } from './constants'
import {
  MultipleTokensResponse,
  PriceResponseData,
  SingleTokenResponse,
} from './types'
import { v4 } from 'uuid'
import pLimit from 'p-limit'
import { chunk, has } from 'lodash'
import {
  fulfilledPromiseValueSelector,
  isFulfilled,
  isRejected,
  rejectedPromiseReasonSelector,
} from '../../core/promise'
import { isErrorResponseJupiter, isPriceResponseData } from './utils'

export type JupiterProviderProps = {
  chain: SupportedChains
  assetsSupported: Asset[]
}

export class JupiterProvider implements PriceProvider {
  cachedPriceQuotes: Record<string, PriceQuote> = {}
  priceQuotesUpdatedAt = 0
  priceQuotesUpdateInterval = ms('1m')

  chain: SupportedChains
  assetsSupported: Asset[]
  providerSlug: ProviderSlug

  constructor(props: JupiterProviderProps) {
    this.chain = props.chain
    this.providerSlug = `jupiter-${this.chain}` as ProviderSlug
    this.assetsSupported = props.assetsSupported
  }

  get requester() {
    return createSafeWretch(JUPITER_PRICE_API_URL)
  }

  _resetIntervals() {
    this.priceQuotesUpdatedAt = 0
  }

  _shouldRefreshPriceQuotes(): boolean {
    const date = Date.now()

    if (!this.priceQuotesUpdatedAt) {
      return true
    }

    return (
      Math.abs(this.priceQuotesUpdatedAt - date) >
      this.priceQuotesUpdateInterval
    )
  }

  _priceResponseDataToTicker(responseData: PriceResponseData): PriceQuote {
    if (isErrorResponseJupiter(responseData)) {
      throw new Error('Response error')
    }

    if (!isPriceResponseData(responseData)) {
      throw new Error(`Invalid pricing response data schema`)
    }

    const priceQuoteProperties: PriceQuoteProperties = {
      id: v4().toString(),
      value: responseData.price.toString(),
      symbol: responseData.mintSymbol,
      contractAddress: responseData.id,
      providerSlug: this.providerSlug,
      priceQuoteType: 'crypto',
    }
    return new PriceQuote(priceQuoteProperties)
  }

  async _updateCacheByList(
    list: string[],
    castToLowercase = false
  ): Promise<void> {
    if (!this._shouldRefreshPriceQuotes() || list.length === 0) {
      return
    }

    const asyncLimit = pLimit(1)
    const chunks = chunk(list, 10)
    const promises: Promise<PriceResponseData[]>[] = []

    for (const chunk of chunks) {
      const id = chunk
        .map((symbol) => (castToLowercase ? symbol.toLowerCase() : symbol))
        .join(',')

      promises.push(
        asyncLimit(async () => {
          const response = await this.requester
            .query({ id })
            .get()
            .json<MultipleTokensResponse>()

          if (isErrorResponseJupiter(response)) {
            return Promise.reject(new Error(`Failed to get quote`))
          }

          return response.data.filter(
            (priceResponseData) =>
              isPriceResponseData(priceResponseData) && priceResponseData.price
          )
        })
      )
    }

    const settledFeedsPromises = await Promise.allSettled(promises)

    const successFeeds = settledFeedsPromises
      .filter(isFulfilled)
      .map(fulfilledPromiseValueSelector)
      .flat(1)
    const failedFeeds = settledFeedsPromises
      .filter(isRejected)
      .map(rejectedPromiseReasonSelector)

    if (failedFeeds.length > 0) {
      console.warn(
        `Failed feeds promises. Count: ${failedFeeds.length} >`,
        failedFeeds
      )
    }

    for (const quote of successFeeds) {
      if (isErrorResponseJupiter(quote)) {
        console.info(quote)
        continue
      }

      const ticker = this._priceResponseDataToTicker(quote)
      this.cachedPriceQuotes[ticker.symbol] = ticker
    }

    this.priceQuotesUpdatedAt = Date.now()
  }

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    const response = await this.requester
      .query({ id: address })
      .get()
      .json<SingleTokenResponse>()

    if (isErrorResponseJupiter(response)) {
      throw new Error()
    }

    return this._priceResponseDataToTicker(response.data)
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    const response = await this.requester
      .query({ id: tickerSymbol })
      .get()
      .json<SingleTokenResponse>()

    if (isErrorResponseJupiter(response)) {
      throw new Error()
    }

    return this._priceResponseDataToTicker(response.data)
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    await this._updateCacheByList(addressList)
    return Object.values(this.cachedPriceQuotes)
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    await this._updateCacheByList(tickerSymbols, true)
    return Object.values(this.cachedPriceQuotes)
  }
}
