export const getTokensQuery = (max = 1000, skip = 0) => {
  return `
    {
      bundle(id: 1) {
        ethPriceUSD
      }
      tokens(orderBy: feesUSD, orderDirection: desc, first: ${max}, skip: ${skip}) {
        id
        symbol
        decimals
        derivedETH
      }
    }
  `
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}
