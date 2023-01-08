import {
  Asset,
  PriceQuote,
  ProviderSlug,
  QuoteNotFoundError,
  SupportedChains,
} from '@yasp/models'
import { createSafeWretch } from '@yasp/requests'
import ms from 'ms'
import pLimit from 'p-limit'
import { v4 } from 'uuid'
import { chunk, keyBy } from 'lodash'

import { getPythSymbolById, parsePythSymbol } from './utils'
import { PYTH_ENDPOINT, PYTH_ADDRESSES_BY_CHAIN } from './constants'
import { ParsedPriceFeed, PriceFeed } from './types'
import { PriceProvider } from '../../core/provider'
import {
  fulfilledPromiseValueSelector,
  isFulfilled,
  isRejected,
  rejectedPromiseReasonSelector,
} from '../../core/promise'

export type PythProviderProps = {
  chain: SupportedChains
  assetsSupported: Asset[]
}

export class PythProvider implements PriceProvider {
  chain: SupportedChains
  assetsSupported: Asset[]
  pythContractAddress: string
  providerSlug: ProviderSlug
  cachedPriceQuotes: Record<string, PriceQuote> = {}
  priceQuotesUpdatedAt = 0
  priceQuotesUpdateInterval = ms('1m')

  constructor(props: PythProviderProps) {
    this.chain = props.chain
    this.providerSlug = `pyth-${this.chain}` as ProviderSlug
    this.assetsSupported = props.assetsSupported
    this.pythContractAddress = PYTH_ADDRESSES_BY_CHAIN[this.chain]
  }

  get requester() {
    return createSafeWretch(PYTH_ENDPOINT)
  }

  _symbolToAsset(assetSymbol: string): Asset | null {
    const symbolCompareFn = (modelAssetSymbol: string, symbol: string) =>
      modelAssetSymbol === symbol

    const asset =
      this.assetsSupported.find((asset) =>
        symbolCompareFn(asset.symbol, assetSymbol)
      ) &&
      this.assetsSupported.find((asset) =>
        symbolCompareFn(asset.symbol.toUpperCase(), assetSymbol)
      )

    if (!asset) {
      return null
    }

    return asset
  }

  _priceFeedToQuote(priceFeed: ParsedPriceFeed): PriceQuote {
    const { price: notFormattedPrice, expo } = priceFeed.priceFeedUsed.price
    const value = parseInt(notFormattedPrice) / 10 ** Math.abs(expo)
    const asset = this._symbolToAsset(priceFeed.assetSymbol)
    const symbol = asset?.symbol ?? priceFeed.assetSymbol
    const contractAddress = asset?.onChainAddress

    return new PriceQuote({
      id: v4().toString(),
      value: String(value),
      priceQuoteType: priceFeed.priceQuoteType,
      providerSlug: this.providerSlug,
      contractAddress,
      symbol,
    })
  }

  _shouldRefreshPriceFeeds(): boolean {
    const date = Date.now()

    if (!this.priceQuotesUpdatedAt) {
      return true
    }

    return (
      Math.abs(this.priceQuotesUpdatedAt - date) >
      this.priceQuotesUpdateInterval
    )
  }

  async _getPriceFeedIds(): Promise<string[]> {
    return this.requester.url('/api/price_feed_ids').get().json<string[]>()
  }

  async _getLatestPriceFeeds(priceIds: string[]): Promise<ParsedPriceFeed[]> {
    if (priceIds.length === 0) {
      return []
    }

    const priceFeeds = await this.requester
      .url('/api/latest_price_feeds')
      .query({
        ids: priceIds,
        verbose: true,
      })
      .get()
      .json<PriceFeed[]>()

    const latestPriceFeeds: ParsedPriceFeed[] = []
    for (const priceFeed of priceFeeds) {
      const { id } = priceFeed

      const pythSymbol = getPythSymbolById(`0x${id}`)

      if (!pythSymbol) {
        continue
      }

      const parsedPythSymbolResult = parsePythSymbol(pythSymbol)

      if (!parsedPythSymbolResult) {
        continue
      }

      const [assetSymbol, priceQuoteType] = parsedPythSymbolResult

      latestPriceFeeds.push({
        assetSymbol,
        priceQuoteType,
        priceFeedUsed: priceFeed,
        toAssetSymbol: 'USD',
      })
    }

    return latestPriceFeeds
  }

  async _getAllQuotesPromiseLimited(): Promise<Record<string, PriceQuote>> {
    const priceIds = await this._getPriceFeedIds()

    if (!this._shouldRefreshPriceFeeds() || priceIds.length === 0) {
      return this.cachedPriceQuotes
    }

    const asyncLimit = pLimit(1)
    const promises: Promise<ParsedPriceFeed[]>[] = []
    const idChunks = chunk(priceIds, 10)

    for (const idChunk of idChunks) {
      promises.push(
        asyncLimit(async () => {
          return this._getLatestPriceFeeds(idChunk)
        })
      )
    }

    const settledFeedsPromises = await Promise.allSettled(promises)

    const successFeeds = settledFeedsPromises
      .filter(isFulfilled)
      .map(fulfilledPromiseValueSelector)
    const failedFeeds = settledFeedsPromises
      .filter(isRejected)
      .map(rejectedPromiseReasonSelector)

    if (failedFeeds.length > 0) {
      console.warn(
        `Failed feeds promises. Count: ${failedFeeds.length} >`,
        failedFeeds
      )
    }

    const allParsedFeeds = successFeeds.flat(1)

    for (const parsedPriceFeed of allParsedFeeds) {
      this.cachedPriceQuotes[parsedPriceFeed.assetSymbol] =
        this._priceFeedToQuote(parsedPriceFeed)
    }

    this.priceQuotesUpdatedAt = Date.now()

    return this.cachedPriceQuotes
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    const priceQuotes = await this._getAllQuotesPromiseLimited()

    const quote = priceQuotes[tickerSymbol]

    if (!quote) {
      throw new QuoteNotFoundError('PriceQuote', tickerSymbol)
    }

    return quote
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    const priceQuote = await this._getAllQuotesPromiseLimited()

    return Object.values(priceQuote).filter((quote) =>
      tickerSymbols.includes(quote.symbol)
    )
  }

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    const priceQuotes = await this._getAllQuotesPromiseLimited()

    const priceQuotesByAddress = keyBy(
      Object.values(priceQuotes),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (quote) => quote.contractAddress!
    )

    const quote = priceQuotesByAddress[address]

    if (!quote) {
      throw new QuoteNotFoundError('PriceQuote', address)
    }

    return quote
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    const priceQuotes = await this._getAllQuotesPromiseLimited()

    const priceQuotesByAddress = keyBy(
      Object.values(priceQuotes),
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (quote) => quote.contractAddress!
    )

    return Object.values(priceQuotesByAddress).filter((quote) =>
      addressList.includes(quote.contractAddress!)
    )
  }
}
