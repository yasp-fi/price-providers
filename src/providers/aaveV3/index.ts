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
  }

  async forAllQuotes(): Promise<PriceQuote[]> {
    const reserveData = await this.aaveContract.getReserveAssets()
    const priceMap = Object.fromEntries(
      reserveData.map((i) => [i.address, i.price.toFixed(8)])
    )
    return this.assetsSupported.map((asset) => {
      return new PriceQuote({
        id: v4().toString(),
        value: priceMap[asset.onChainAddress] || '0',
        symbol: asset.symbol,
        providerSlug: this.providerSlug,
        priceQuoteType: 'crypto',
        contractAddress: this.aaveContract.contractAddress,
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
