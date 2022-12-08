export type ErrorResponse = {
  code: number
  error: string
}

export type PriceResponseData = {
  id: string
  mintSymbol: string
  vsToken: string
  vsTokenSymbol: 'USDC'
  price: number
}

export type SingleTokenResponse =
  | {
      data: PriceResponseData
      timeTaken: number
    }
  | ErrorResponse

export type MultipleTokensResponse =
  | {
      data: PriceResponseData[]
      timeTaken: number
    }
  | ErrorResponse
