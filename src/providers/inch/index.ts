import {
  Asset,
  Chain,
  ChainIds,
  PriceQuote,
  ProviderSlug,
  ChainNativeSymbols,
} from '@yasp/models'
import { PriceProvider } from '../../core/provider'
import { InchOracle, InchQuoteParams } from '@yasp/evm-lib'
import { v4 } from 'uuid'

export type InchProviderProps = {
  chain: ChainNativeSymbols
  assetsSupported: Asset[]
}

export class InchProvider implements PriceProvider {
  chain: ChainNativeSymbols
  chainId: ChainIds
  providerSlug: ProviderSlug
  inchContract: InchOracle
  assetsSupported: Asset[]

  constructor(props: InchProviderProps) {
    this.chain = props.chain
    this.chainId = Chain.mapNativeSymbolToId(props.chain)
    this.providerSlug = `1inch-network`
    this.inchContract = new InchOracle(this.chainId)
    this.assetsSupported = props.assetsSupported
  }

  async forAllQuotes(): Promise<PriceQuote[]> {
    const usdcAsset = this.assetsSupported.find((asset) => {
      return asset.symbol === 'USDC'
    })
    if (!usdcAsset) {
      throw new Error('USDC asset is not included to supported asset list')
    }
    const quotePayloads: InchQuoteParams[] = this.assetsSupported.map(
      (asset) => ({ fromAsset: asset, toAsset: usdcAsset })
    )

    const prices = await this.inchContract.getDEXQuotes(quotePayloads)

    return this.assetsSupported.map((asset, i) => {
      return new PriceQuote({
        id: v4().toString(),
        value: prices[i].toExact(),
        symbol: asset.symbol,
        providerSlug: this.providerSlug,
        priceQuoteType: 'crypto',
        contractAddress: Asset.onChainAddress(asset, this.chain),
      })
    })
  }

  async forPricesByAddressList(addressList: string[]): Promise<PriceQuote[]> {
    throw new Error()
  }

  async forPriceByAddress(address: string): Promise<PriceQuote> {
    throw new Error()
  }

  async forPricesBySymbols(tickerSymbols: string[]): Promise<PriceQuote[]> {
    throw new Error()
  }

  async forPriceBySymbol(tickerSymbol: string): Promise<PriceQuote> {
    throw new Error()
  }
}
