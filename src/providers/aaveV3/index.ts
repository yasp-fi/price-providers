import {
  Asset,
  ChainIds,
  PriceQuote,
  ProviderSlug,
  SupportedChains,
} from '@yasp/models'
import { PriceProvider } from '../../core/provider'
import { Aave } from '@yasp/evm-lib'
import { v4 } from 'uuid'

export type AaveProviderProps = {
  chainId: ChainIds
  chain: SupportedChains
  assetsSupported: Asset[]
}

export class AaveProvider implements PriceProvider {
  chainId: ChainIds
  chain: SupportedChains
  providerSlug: ProviderSlug
  aaveContract: Aave
  assetsSupported: Asset[] = []

  constructor(props: AaveProviderProps) {
    this.chainId = props.chainId
    this.chain = props.chain
    this.providerSlug = `aave-${this.chain}` as ProviderSlug
    this.aaveContract = new Aave(props.chainId)
    this.assetsSupported = props.assetsSupported
  }

  async forAllQuotes(): Promise<PriceQuote[]> {
    const reserveData = await this.aaveContract.getReserveAssets()
    const reserveAssets = reserveData.map((r) => r.address.toLowerCase())
    const priceMap = Object.fromEntries(
      reserveData.map((i) => [i.address.toLowerCase(), i.price.toFixed(8)])
    )

    const supportedAssets = this.assetsSupported.filter((asset) =>
      reserveAssets.includes(asset.onChainAddress.toLowerCase())
    )
    return supportedAssets.map((asset) => {
      return new PriceQuote({
        id: v4().toString(),
        value: priceMap[asset.onChainAddress.toLowerCase()],
        symbol: asset.symbol,
        providerSlug: this.providerSlug,
        priceQuoteType: 'crypto',
        contractAddress: asset.onChainAddress,
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
