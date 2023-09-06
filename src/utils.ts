import { ethers } from 'ethers'
import { chainNames } from '@airswap/constants'

export const decimals: any = {
  '0x07865c6e87b9f70255377e024ace6630c1eaa37f': 6,
  '0x79c950c7446b234a6ad53b908fbf342b01c4d446': 6,
  '0xf56dc6695cf1f5c364edebc7dc7077ac9b586068': 6,
  '0x1990bc6dfe2ef605bfc08f5a23564db75642ad73': 6,
}

export function getNodeURL(chainId: number, INFURA_ID: string) {
  const selectedChain = chainNames[chainId].toLowerCase()
  switch (chainId) {
    case 56:
      return 'https://bsc-dataseed.binance.org/'
    case 97:
      return 'https://data-seed-prebsc-1-s1.binance.org:8545/'
    case 43113:
      return 'https://api.avax-test.network/ext/bc/C/rpc'
    case 43114:
      return 'https://api.avax.network/ext/bc/C/rpc'
    default:
      return `https://${selectedChain}.infura.io/v3/${INFURA_ID}`
  }
}

export function result(id: string, result: any) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    result,
  })
}

export function error(id: string, error: any) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    error,
  })
}
