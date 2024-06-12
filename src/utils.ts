import { chainLabels, apiUrls } from '@airswap/utils'

export const decimals: any = {
  '0x20aaebad8c7c6ffb6fdaa5a622c399561562beea': 6,
  '0xf450ef4f268eaf2d3d8f9ed0354852e255a5eaef': 6,
  '0xf56dc6695cf1f5c364edebc7dc7077ac9b586068': 6,
  '0x1990bc6dfe2ef605bfc08f5a23564db75642ad73': 6,
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 6,
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 6,
  '0x176211869ca2b568f2a7d4ee941e073a821ee1ff': 6
}

export function getNodeURL(chainId: number, INFURA_ID: string) {
  if (INFURA_ID)
    return chainLabels[chainId]
      ? `https://${chainLabels[
          chainId
        ].toLowerCase()}.infura.io/v3/${INFURA_ID}`
      : undefined
  return apiUrls[chainId]
}

export function result(id: string, result: any) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    result,
  })
}

export function error(id: string, code: any, message: any) {
  return JSON.stringify({
    jsonrpc: '2.0',
    id,
    error: { code, message },
  })
}
