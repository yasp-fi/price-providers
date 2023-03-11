// import { ChainIds, ChainNativeSymbols } from '@yasp/models'
// import { ChainlinkProvider } from '../providers/chainlink'

// jest.setTimeout(5000000)

// const chainlink = new ChainlinkProvider({
//   chainId: ChainIds.OPTIMISM,
//   chain: ChainNativeSymbols.Optimism,
// })

// describe('chainlink e2e testing', () => {
//   test('forPriceBySymbol', async () => {
//     const quotes = await chainlink.forPriceBySymbol('BTC')
//     console.info(quotes)
//   })

//   test('forPricesBySymbols', async () => {
//     const quotes = await chainlink.forPricesBySymbols(['BTC', 'ETH', 'DAI'])
//     console.info(quotes)
//   })
// })
