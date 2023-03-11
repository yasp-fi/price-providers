import { PriceQuoteType } from '@yasp/models'

export type UniswapToken = {
  id: string
  symbol: string
  decimals: string
  derivedETH: string
}

export type UniswapTokenQueryResponse = {
  data: {
    bundle: {
      ethPriceUSD: string
    }
    tokens: UniswapToken[]
  }
}
