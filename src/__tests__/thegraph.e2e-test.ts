import { PriceQuote } from '@yasp/models'
import { appendFile } from 'fs/promises'
import _ from 'lodash'
import { TheGraphProvider } from '../providers/thegraph'

jest.setTimeout(5000000)

const theGraph = new TheGraphProvider()

describe('chainlink e2e testing', () => {
  // test('fetchUniswapQuotes', async () => {
  //   const quotes = await theGraph.fetchUniswapQuotes()
  //   expect(quotes.length).toBeGreaterThan(0)
  //   quotes.forEach((quote) => {
  //     expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
  //   })
  // })
  // test('forPriceBySymbol', async () => {
  //   const quote = await theGraph.forPriceBySymbol('BTC')
  //   console.log(quote)
  //   expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
  // })
  // test('forPricesBySymbols', async () => {
  //   const quotes = await theGraph.forPricesBySymbols(['BTC', 'ETH', 'DAI'])
  //   console.log(quotes)
  //   expect(quotes.length).toEqual(3)
  //   quotes.forEach((quote) => {
  //     expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
  //   })
  // })
  // test('forPriceByAddress', async () => {
  //   const quote = await theGraph.forPriceByAddress(
  //     '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'
  //   )
  //   console.log(quote)
  //   expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
  // })
  // test('forPriceByAddressList', async () => {
  //   const quotes = await theGraph.forPricesByAddressList([
  //     '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  //     '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  //     '0x6b175474e89094c44da98b954eedeac495271d0f',
  //   ])
  //   console.log(quotes)
  //   expect(quotes.length).toEqual(3)
  //   quotes.forEach((quote) => {
  //     expect(PriceQuote.isPriceQuote(quote)).toBeTruthy()
  //   })
  // })
  //   test('forAllQuotes', async () => {
  //     const file = `./records-${Date.now()}.csv`
  //     await appendFile(
  //       file,
  //       [
  //         'address',
  //         'domain',
  //         'label',
  //         'twitter',
  //         'telegram',
  //         'email',
  //         'discord',
  //         'linkedin',
  //         'reddit',
  //         'github',
  //         'url',
  //       ].join('\t') + '\n'
  //     )
  //     for (const i of _.range(0, 600)) {
  //       const records = await theGraph.fetchENSRecords(i)
  //       for (const record of records) {
  //         await appendFile(file, recordToRow(record))
  //       }
  //     }
  //   })
})
