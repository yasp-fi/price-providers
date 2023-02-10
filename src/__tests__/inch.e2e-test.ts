import { ChainIds, ChainNativeSymbols } from '@yasp/models'
import { InchProvider } from '../providers/inch'
import { bscAssets } from './fixtures/assets'

jest.setTimeout(5000000)

const inch = new InchProvider({
  chain: ChainNativeSymbols.BinanceSmartChain,
  assetsSupported: bscAssets,
})

describe('1Inch e2e testing', () => {
  test('forAllQuotes', async () => {
    const quotes = await inch.forAllQuotes()
    expect(quotes.length).toEqual(bscAssets.length)
    // console.info(quotes)
  })
})
