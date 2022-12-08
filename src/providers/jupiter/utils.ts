import { ErrorResponse } from './types'

export function isErrorResponseJupiter(e: unknown): e is ErrorResponse {
  return typeof e === 'object' && e !== null && 'error' in e
}
