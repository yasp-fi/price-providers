export type PriceResponseData = {
  id: string
  mintSymbol: string
  vsToken: string
  vsTokenSymbol: 'USDC'
  price: number
}

export type SingleTokenResponse = {
  data: PriceResponseData
  timeTaken: number
}

export type MultipleTokensResponse = {
  data: PriceResponseData[]
  timeTaken: number
}
