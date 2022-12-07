import { EVMContract } from '@yasp/evm-lib'
import { pythABI } from '../../ABI/pyth-evm'

export function createPythContract(rpcURL: string, contractAddress: string) {
  const { contract } = new EVMContract({
    rpcURL,
    abi: pythABI,
    contractAddress,
  })

  return contract
}
