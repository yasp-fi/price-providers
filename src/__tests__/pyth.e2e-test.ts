// import { PythProvider } from '../providers/pyth'
// import { bscAssets } from './fixtures/assets'
// import { Asset, PriceQuote, ChainNativeSymbols } from '@yasp/models'

// type PythTestCase = {
//   chain: ChainNativeSymbols
//   assetsSupportedByChain: Asset[]
//   address: string
//   addressList: string[]
//   symbol: string
//   symbolList: string[]
// }

// const pythTestCases: PythTestCase[] = [
//   {
//     chain: ChainNativeSymbols.BinanceSmartChain,
//     assetsSupportedByChain: bscAssets,
//     address: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
//     addressList: [
//       '0x0eb3a705fc54725037cc9e008bdede697f62f335',
//       '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
//     ],
//     symbol: 'ETH',
//     symbolList: ['ETH', 'BNB', 'USDC', 'EUR', 'GBP'],
//   },
// ]

// jest.setTimeout(5000000)

// describe('pyth e2e testing', () => {
//   test.each(pythTestCases)(
//     'methods',
//     async ({
//       chain,
//       assetsSupportedByChain,
//       address,
//       addressList,
//       symbol,
//       symbolList,
//     }) => {
//       const ctxPyth = new PythProvider({
//         chain,
//         assetsSupported: assetsSupportedByChain,
//       })

//       const priceQuoteByAddress = await ctxPyth.forPriceByAddress(address)
//       expect(PriceQuote.isPriceQuote(priceQuoteByAddress)).toBeTruthy()

//       const priceQuotesByAddressList = await ctxPyth.forPricesByAddressList(
//         addressList
//       )

//       for (const quote of priceQuotesByAddressList) {
//         expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
//       }

//       const priceQuoteBySymbol = await ctxPyth.forPriceBySymbol(symbol)

//       expect(PriceQuote.isPriceQuote(priceQuoteBySymbol)).toBeTruthy()

//       const priceQuotesBySymbolList = await ctxPyth.forPricesBySymbols(
//         symbolList
//       )

//       for (const quote of priceQuotesBySymbolList) {
//         expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
//       }
//     }
//   )
// })
