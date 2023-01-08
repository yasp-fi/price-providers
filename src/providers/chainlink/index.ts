import { Asset, ChainIds, PriceQuote, ProviderSlug } from '@yasp/models'
import ms from 'ms'
import { CHAINLINK_FEEDS_BY_CHAIN } from './constants'
import { PriceProvider } from '../../core/provider'
import { ChainlinkDataFeed } from './types'
import { Chainlink } from '@yasp/evm-lib'
import { convertChainlinkQuoteToPriceQuote } from './utils'

export type ChainlinkProviderProps = {
  chainId: ChainIds
}

export class ChainlinkProvider implements PriceProvider {
  chainId: ChainIds
  providerSlug: ProviderSlug
  priceFeeds: ChainlinkDataFeed[]
  chainlinkContract: Chainlink

  cachedPriceQuotes: Record<string, PriceQuote> = {}
  priceQuotesUpdatedAt = 0
  priceQuotesUpdateInterval = ms('1m')

  constructor(props: ChainlinkProviderProps) {
    this.chainId = props.chainId
    this.providerSlug = `chainlink-${this.chainId}` as ProviderSlug
    this.priceFeeds = CHAINLINK_FEEDS_BY_CHAIN[this.chainId]
    this.chainlinkContract = new Chainlink(props.chainId)
  }
	forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
		throw new Error('Method not implemented.')
	}
	forPriceByAddress(addressList: string[]): Promise<PriceQuote[]> {
		throw new Error('Method not implemented.')
	}

	#forTickerSymbol(feedAddress: string): string {
		const feed = this.priceFeeds.find(f => f.address === feedAddress);
    if (!feed) {
      throw new Error(
        `Chainlink ${feedAddress} feed doesn't exists`
      )
    }
		return feed.pair[0]
	}

  async forPricesBySymbols(
    tickerSymbols: string[],
    quoteSymbol = 'USD'
  ): Promise<PriceQuote[]> {
    const feeds = this.priceFeeds.filter(
      (feed) =>
        tickerSymbols.includes(feed.pair[0]) && feed.pair[1] === quoteSymbol
    )
    const ids = feeds.map((feed) => feed.address)
    const data = await this.chainlinkContract.latestRoundData(ids)
    return data.map((item, i) => {
      return convertChainlinkQuoteToPriceQuote(
        item,
        this.#forTickerSymbol(ids[i]),
        quoteSymbol,
        this.providerSlug
      )
    })
  }

  async forPriceBySymbol(
    tickerSymbol: string,
    quoteSymbol = 'USD'
  ): Promise<PriceQuote> {
    const feed = this.priceFeeds.find((feed) => tickerSymbol === feed.pair[0])
    if (!feed) {
      throw new Error(
        `Chainlink ${tickerSymbol}/${quoteSymbol} feed doesn't exists`
      )
    }
    const [data] = await this.chainlinkContract.latestRoundData([feed.address])
    return convertChainlinkQuoteToPriceQuote(
			data,
			tickerSymbol,
			quoteSymbol,
			this.providerSlug
		)
  }
}
