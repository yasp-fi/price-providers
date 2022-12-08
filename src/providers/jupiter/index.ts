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
import { chunk } from 'lodash'
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

  _chunkList(addressOrSymbolList: string[]): string[][] {
    return chunk(addressOrSymbolList, 10)
  }

  _priceResponseDataToTicker = (
    responseData: PriceResponseData
  ): PriceQuote => {
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

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    const response = await this.requester
      .query({ id: address })
      .get()
      .json<SingleTokenResponse>()

    if (isErrorResponseJupiter(response)) {
      throw new Error()
    }

    const { data: priceResponseData } = response

    return this._priceResponseDataToTicker(priceResponseData)
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    const response = await this.requester
      .query({ id: tickerSymbol })
      .get()
      .json<SingleTokenResponse>()

    if (isErrorResponseJupiter(response)) {
      throw new Error()
    }

    const { data: priceResponse } = response

    return this._priceResponseDataToTicker(priceResponse)
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    const chunkList = this._chunkList(addressList)
    const priceQuotesPromises: Promise<PriceResponseData[]>[] = []
    const promiseLimit = pLimit(1)

    for (const chunk of chunkList) {
      const commaSeparatedIds = chunk.join(',')

      priceQuotesPromises.push(
        promiseLimit(async (): Promise<PriceResponseData[]> => {
          const multipleTokensResponse = await this.requester
            .query({ id: commaSeparatedIds })
            .get()
            .json<MultipleTokensResponse>()

          if (isErrorResponseJupiter(multipleTokensResponse)) {
            return Promise.reject(new Error('Failed to get quote'))
          }

          const { data: priceResponseData } = multipleTokensResponse

          return priceResponseData.filter(
            (priceResponseData) =>
              isPriceResponseData(priceResponseData) && priceResponseData.price
          )
        })
      )
    }

    const settledPriceQuotes = await Promise.allSettled(priceQuotesPromises)

    const priceQuotes = settledPriceQuotes
      .filter(isFulfilled)
      .map(fulfilledPromiseValueSelector)
      .flat(1)
      .map(this._priceResponseDataToTicker)

    const rejectedPriceQuotes = settledPriceQuotes
      .filter(isRejected)
      .map(rejectedPromiseReasonSelector)

    if (rejectedPriceQuotes.length > 0) {
      console.warn(`Failed to fetch ${rejectedPriceQuotes.length} quotes.`)
    }

    return priceQuotes
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    const chunkList = this._chunkList(tickerSymbols)
    const priceQuotesPromises: Promise<PriceQuote[]>[] = []
    const promiseLimit = pLimit(1)

    for (const chunk of chunkList) {
      const commaSeparatedLowercaseSymbols = chunk
        .map((tickerSymbol) => tickerSymbol.toLowerCase())
        .join(',')

      priceQuotesPromises.push(
        promiseLimit(async (): Promise<PriceQuote[]> => {
          const multipleTokensResponse = await this.requester
            .query({ id: commaSeparatedLowercaseSymbols })
            .get()
            .json<MultipleTokensResponse>()

          if (isErrorResponseJupiter(multipleTokensResponse)) {
            return Promise.reject(new Error('Failed to get quote'))
          }

          const { data: priceResponseData } = multipleTokensResponse

          return priceResponseData
            .filter(
              (priceResponseData) =>
                isPriceResponseData(priceResponseData) &&
                priceResponseData.price
            )
            .map(this._priceResponseDataToTicker)
        })
      )
    }

    const settledPriceQuotes = await Promise.allSettled(priceQuotesPromises)

    const priceQuotes = settledPriceQuotes
      .filter(isFulfilled)
      .map(fulfilledPromiseValueSelector)
      .flat(1)

    const rejectedPriceQuotes = settledPriceQuotes
      .filter(isRejected)
      .map(rejectedPromiseReasonSelector)

    if (rejectedPriceQuotes.length > 0) {
      console.warn(`Failed to fetch ${rejectedPriceQuotes.length} quotes.`)
    }

    return priceQuotes
  }
}
