import { ethers } from 'ethers'
import { chainNames } from '@airswap/constants'

export const decimals: any = {
  '0x5592ec0cfb4dbc12d3ab100b257153436a1f0fea': 18,
  '0xc778417e063141139fce010982780140aa0cd5ab': 18,
}

export function getNodeURL(chainId: number, INFURA_ID: string) {
  const selectedChain = chainNames[chainId].toLowerCase()
  switch(chainId) {
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