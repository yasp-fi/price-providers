import { PriceProvider } from '../../core/provider'
import { Asset, PriceQuote, ProviderSlug, SupportedChains } from '@yasp/models'
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
    return new PriceQuote({
      id: v4().toString(),
      value: String(responseData.price),
      symbol: responseData.mintSymbol,
      contractAddress: responseData.id,
      providerSlug: this.providerSlug,
      priceQuoteType: 'crypto',
    })
  }

  _assetSymbolToAssets(assetSymbol: string): Asset | null {
    const symbolCompareFn = (modelAssetSymbol: string, symbol: string) =>
      modelAssetSymbol === symbol

    const asset =
      this.assetsSupported.find((asset) =>
        symbolCompareFn(asset.symbol, assetSymbol)
      ) &&
      this.assetsSupported.find((asset) =>
        symbolCompareFn(asset.symbol.toLowerCase(), assetSymbol.toLowerCase())
      )

    if (!asset) {
      return null
    }

    return asset
  }

  async _updateCacheByList(list: string[]): Promise<void> {
    if (!this._shouldRefreshPriceQuotes() || list.length === 0) {
      return
    }

    const asyncLimit = pLimit(2)
    const chunks = chunk(list, 10)
    const promises: Promise<PriceResponseData[]>[] = []

    for (const chunk of chunks) {
      const id = chunk.map((symbol) => symbol.toLowerCase()).join(',')
      promises.push(
        asyncLimit(async () => {
          const { data } = await this.requester
            .query({ id })
            .get()
            .json<MultipleTokensResponse>()

          return data
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
      const ticker = this._priceResponseDataToTicker(quote)
      this.cachedPriceQuotes[ticker.symbol] = ticker
    }

    this.priceQuotesUpdatedAt = Date.now()
  }

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    const { data: priceResponseData } = await this.requester
      .query({ id: address })
      .get()
      .json<SingleTokenResponse>()

    return this._priceResponseDataToTicker(priceResponseData)
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    const { data: priceResponseData } = await this.requester
      .query({ id: tickerSymbol })
      .get()
      .json<SingleTokenResponse>()

    return this._priceResponseDataToTicker(priceResponseData)
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    await this._updateCacheByList(addressList)
    return Object.values(this.cachedPriceQuotes)
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    await this._updateCacheByList(tickerSymbols)
    return Object.values(this.cachedPriceQuotes)
  }
}
