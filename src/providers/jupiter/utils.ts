import { ErrorResponse, PriceResponseData } from './types'

export function isErrorResponseJupiter(e: unknown): e is ErrorResponse {
  return typeof e === 'object' && e !== null && 'error' in e
}

export function isPriceResponseData(e: unknown): e is PriceResponseData {
  return (
    typeof e === 'object' && e !== null && 'price' in e && 'mintSymbol' in e
  )
}
