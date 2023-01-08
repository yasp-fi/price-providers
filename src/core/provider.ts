import { PriceQuote, PriceQuoteType } from '@yasp/models'

export abstract class PriceProvider {
  abstract forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]>
  abstract forPriceByAddress(address: string): Promise<PriceQuote>
  abstract forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]>
  abstract forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote>
}
