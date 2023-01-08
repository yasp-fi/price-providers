import { ChainIds, PriceQuote, ProviderSlug, SupportedChains } from '@yasp/models'
import ms from 'ms'
import { CHAINLINK_FEEDS_BY_CHAIN } from './constants'
import { PriceProvider } from '../../core/provider'
import { ChainlinkDataFeed } from './types'
import { Chainlink } from '@yasp/evm-lib'
import { convertChainlinkQuoteToPriceQuote } from './utils'

export type ChainlinkProviderProps = {
  chainId: ChainIds
	chain: SupportedChains
	quoteSymbol?: string
}

export class ChainlinkProvider implements PriceProvider {
  chainId: ChainIds
	chain: SupportedChains
  providerSlug: ProviderSlug
  priceFeeds: ChainlinkDataFeed[]
  chainlinkContract: Chainlink
	quoteSymbol: string

  cachedPriceQuotes: Record<string, PriceQuote> = {}
  priceQuotesUpdatedAt = 0
  priceQuotesUpdateInterval = ms('1m')

  constructor(props: ChainlinkProviderProps) {
    this.chainId = props.chainId
		this.chain = props.chain
    this.providerSlug = `chainlink-${this.chain}` as ProviderSlug
    this.priceFeeds = CHAINLINK_FEEDS_BY_CHAIN[this.chainId]
    this.chainlinkContract = new Chainlink(props.chainId)
		this.quoteSymbol = props.quoteSymbol || 'USD'
  }

  forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    throw new Error('Method not implemented.')
  }

  forPriceByAddress(address: string): Promise<PriceQuote> {
    throw new Error('Method not implemented.')
  }

  #forTickerSymbol(feedAddress: string): string {
    const feed = this.priceFeeds.find((f) => f.address === feedAddress)
    if (!feed) {
      throw new Error(`Chainlink ${feedAddress} feed doesn't exists`)
    }
    return feed.pair[0]
  }

  async forPricesBySymbols(
    tickerSymbols: string[],
  ): Promise<PriceQuote[]> {
    const feeds = this.priceFeeds.filter(
      (feed) =>
        tickerSymbols.includes(feed.pair[0]) && feed.pair[1] === this.quoteSymbol
    )
    const ids = feeds.map((feed) => feed.address)
    const data = await this.chainlinkContract.getFeedsResult(ids)
    return data.map((item, i) => {
      return convertChainlinkQuoteToPriceQuote(
        item,
        this.#forTickerSymbol(ids[i]),
        this.quoteSymbol,
				ids[i],
        this.providerSlug
      )
    })
  }

  async forPriceBySymbol(
    tickerSymbol: string,
  ): Promise<PriceQuote> {
    const feed = this.priceFeeds.find((feed) => tickerSymbol === feed.pair[0])
    if (!feed) {
      throw new Error(
        `Chainlink ${tickerSymbol}/${this.quoteSymbol} feed doesn't exists`
      )
    }
    const data = await this.chainlinkContract.getFeedResult(feed.address)
    return convertChainlinkQuoteToPriceQuote(
      data,
      tickerSymbol,
      this.quoteSymbol,
			feed.address,
      this.providerSlug
    )
  }
}
