import { Asset, PriceQuote, ProviderSlug, ChainNativeSymbols } from '@yasp/models'
import { createSafeWretch } from '@yasp/requests'

import { UniswapTokenQueryResponse } from './types'
import { PriceProvider } from '../../core/provider'
import { THE_GRAPH_QUERY_API } from './constants'
import { getTokensQuery } from './utils'
import { v4 } from 'uuid'
import { AssetAmount } from '@yasp/asset-amount'
import ms from 'ms'

export class TheGraphProvider implements PriceProvider {
  chain = ChainNativeSymbols.Ethereum
  providerSlug = `thegraph-ETH` as ProviderSlug
  cachedQuotes: PriceQuote[] = []
  assetsSupported: Asset[]
  cacheTTL = ms('15s')
  lastUpdateAt = 0

  constructor() {
    this.assetsSupported = []
  }

  get requester() {
    return createSafeWretch(THE_GRAPH_QUERY_API)
  }

  async #fetchUniswapQuotes(): Promise<PriceQuote[]> {
    const { data } = await this.requester
      .url('/subgraphs/name/uniswap/uniswap-v3')
      .body(JSON.stringify({ query: getTokensQuery() }))
      .post()
      .json<UniswapTokenQueryResponse>()
    if (!data) {
      throw new Error('unable to fetch thegraph api')
    }
    const { tokens, bundle } = data
    const ethToUsd = new AssetAmount(18, bundle.ethPriceUSD)
    const slippage = new AssetAmount(18, '0.99')

    return tokens.map((token) => {
      const derivedETH = new AssetAmount(18, token.derivedETH)
      const price = derivedETH.mul(ethToUsd).mul(slippage).toFixed(6)

      return new PriceQuote({
        id: v4().toString(),
        value: price,
        symbol: token.symbol,
        contractAddress: token.id,
        providerSlug: this.providerSlug,
        priceQuoteType: 'crypto',
      })
    })
  }

  async fetchUniswapQuotes(): Promise<PriceQuote[]> {
    const diff = Date.now() - this.lastUpdateAt
    if (diff > this.cacheTTL) {
      this.cachedQuotes = await this.#fetchUniswapQuotes()
      this.lastUpdateAt = Date.now()
    }
    return this.cachedQuotes
  }

  async forAllQuotes(): Promise<PriceQuote[]> {
    return await this.fetchUniswapQuotes()
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    await this.fetchUniswapQuotes()
    const tasks = addressList.map((address) => this.forPriceByAddress(address))
    return Promise.all(tasks)
  }

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    const quotes = await this.fetchUniswapQuotes()
    const quote = quotes.find((quote) => {
      return address === quote.contractAddress
    })
    if (!quote) {
      throw new Error()
    }
    return quote as PriceQuote
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    await this.fetchUniswapQuotes()
    const tasks = tickerSymbols.map((symbol) => this.forPriceBySymbol(symbol))
    return Promise.all(tasks)
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    const quotes = await this.fetchUniswapQuotes()
    const quote = quotes.find((quote) => {
      const sameSymbol = tickerSymbol === quote.symbol
      const sameUnwrapped = tickerSymbol === quote.symbol.slice(1)
      return sameSymbol || sameUnwrapped
    })
    if (!quote) {
      throw new Error()
    }
    return quote as PriceQuote
  }
}
