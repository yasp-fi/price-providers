import { ChainlinkPriceData } from '@yasp/evm-lib'
import { PriceQuote, ProviderSlug } from '@yasp/models'
import ms from 'ms'
import { v4 } from 'uuid'

export const convertChainlinkQuoteToPriceQuote = (
  data: ChainlinkPriceData,
  symbol: string,
  quoteSymbol: string,
  providerSlug: ProviderSlug
): PriceQuote => {
  return {
    id: v4().toString(),
    value: data.answer,
    symbol,
    providerSlug,
    priceQuoteType: quoteSymbol === 'USD' ? 'fiat' : 'crypto',
    expiry: ms('1m'),
  }
}
