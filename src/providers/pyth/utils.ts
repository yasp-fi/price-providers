import { PriceQuoteType } from '@yasp/models'
import { PYTH_SYMBOLS_BY_PRICE_IDS } from './constants'

export function acceptableSymbolTypes(
  symbolType: string
): PriceQuoteType | null {
  if (symbolType === 'Crypto') return 'crypto'
  if (symbolType === 'FX') return 'fiat'
  return null
}

/**
 *
 * @param pythSymbol - see https://pyth.network/developers/price-feed-ids#pyth-evm-mainnet
 * @returns [AssetSymbol, PriceQuoteType]
 */
export function parsePythSymbol(
  pythSymbol: string
): [string, PriceQuoteType] | null {
  const [pythCategory, assetPair] = pythSymbol.split('.')

  const priceQuoteType = acceptableSymbolTypes(pythCategory)

  if (!priceQuoteType) {
    return null
  }

  const [symbol, to] = assetPair.split('/')

  if (to !== 'USD') {
    return null
  }

  return [symbol, priceQuoteType]
}

export function getPythSymbolById(priceFeedId: string): string | null {
  const [pythSymbol] =
    PYTH_SYMBOLS_BY_PRICE_IDS.find(([pythSymbol, id]) => priceFeedId === id) ??
    []

  return pythSymbol ?? null
}
