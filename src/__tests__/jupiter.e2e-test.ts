import { Asset, PriceQuote, SupportedChains } from '@yasp/models'
import { solAssets } from './fixtures/assets'
import { JupiterProvider } from '../providers/jupiter'

type JupiterTestCase = {
  chain: SupportedChains
  assetsSupportedByChain: Asset[]
  address: string
  addressList: string[]
  symbol: string
  symbolList: string[]
}

jest.setTimeout(5000000)

const jupiterTestCases: JupiterTestCase[] = [
  {
    chain: SupportedChains.Solana,
    assetsSupportedByChain: solAssets,
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    addressList: [
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    ],
    symbol: 'SOL',
    symbolList: ['SOL', 'USDC', 'USDT', 'ORCA'],
  },
]

describe('jupiter e2e testing', () => {
  test.each(jupiterTestCases)(
    'all methods of parent interface',
    async ({
      chain,
      assetsSupportedByChain,
      address,
      addressList,
      symbol,
      symbolList,
    }) => {
      const ctxJupiter = new JupiterProvider({
        chain,
        assetsSupported: assetsSupportedByChain,
      })

      const priceQuoteByAddress = await ctxJupiter.forPriceByAddress(address)
      expect(PriceQuote.isPriceQuote(priceQuoteByAddress)).toBeTruthy()

      const priceQuotesByAddressList = await ctxJupiter.forPricesByAddressList(
        addressList
      )

      ctxJupiter._resetIntervals()

      for (const quote of priceQuotesByAddressList) {
        expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
      }

      const priceQuoteBySymbol = await ctxJupiter.forPriceBySymbol(symbol)

      expect(PriceQuote.isPriceQuote(priceQuoteBySymbol)).toBeTruthy()

      const priceQuotesBySymbolList = await ctxJupiter.forPricesBySymbols(
        symbolList
      )

      for (const quote of priceQuotesBySymbolList) {
        expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
      }
    }
  )
})
