import { Asset, PriceQuote } from '@yasp/models'

export abstract class PriceProvider {
  public readonly assetsSupported!: Asset[]
  public readonly providerSlug!: string

  abstract forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]>
  abstract forPriceByAddress(address: string): Promise<PriceQuote>
  abstract forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]>
  abstract forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote>
  abstract forAllQuotes(): Promise<PriceQuote[]>
}
