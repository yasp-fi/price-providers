export const isFulfilled = <T>(
  p: PromiseSettledResult<T>
): p is PromiseFulfilledResult<T> => p.status === 'fulfilled'
export const fulfilledPromiseValueSelector = <T>(
  p: PromiseFulfilledResult<T>
) => p.value
export const isRejected = <T>(
  p: PromiseSettledResult<T>
): p is PromiseRejectedResult => p.status === 'rejected'

export const rejectedPromiseReasonSelector = (p: PromiseRejectedResult) =>
  p.reason
