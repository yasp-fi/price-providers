import { ChainIds } from '@yasp/models'
import { ChainlinkProvider } from '../providers/chainlink'

jest.setTimeout(5000000)

describe('chainlink e2e testing', () => {
  test('forPriceBySymbol', async () => {
    const chainlink = new ChainlinkProvider({
      chainId: ChainIds.ETH,
    })

    const quotes = await chainlink.forPriceBySymbol('AVAX')
    console.info(quotes)
  })

  test('forPricesBySymbols', async () => {})
})
