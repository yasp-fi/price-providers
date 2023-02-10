import { ChainIds } from '@yasp/models'
import mainnetFeeds from './feeds/mainnet.json'
import arbitrumFeeds from './feeds/arbitrum.json'
import optimismFeeds from './feeds/optimism.json'
import { ChainlinkDataFeed } from './types'

export const CHAINLINK_FEEDS_BY_CHAIN: Record<ChainIds, ChainlinkDataFeed[]> = {
  '100': [],
  '1284': [],
  '1285': [],
  '1313161554': [],
  '25': [],
  [ChainIds.ETH]: mainnetFeeds,
  [ChainIds.OPTIMISM]: optimismFeeds,
  [ChainIds.ARBITRUM]: arbitrumFeeds,
  [ChainIds.BSC]: [],
  [ChainIds.AVAX]: [],
  [ChainIds.FTM]: [],
  [ChainIds.MATIC]: [],
  [ChainIds.SOLANA]: [],
  [ChainIds.ZK_SYNC]: [],
}
