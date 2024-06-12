import dotenv from 'dotenv'
import * as ethers from 'ethers'
import express from 'express'
import { createServer } from 'http'
import { SwapERC20 } from '@airswap/libraries'
import { Redis } from '@airswap/stores'
import {
  chainNames,
  DOMAIN_VERSION_SWAP_ERC20,
  DOMAIN_NAME_SWAP_ERC20,
} from '@airswap/utils'

import HTTP from './servers/http'
import WS from './servers/ws'

import {
  Discovery,
  RequestForQuoteERC20,
  LastLookERC20,
  IndexingERC20,
  Indexing,
} from './protocols'

import { Levels } from './levels'
import { getNodeURL } from './utils'

dotenv.config()

async function start() {
  const port = parseInt(String(process.env.PORT), 10) || 3000
  const chainId = Number(process.env.CHAIN_ID)

  if (!SwapERC20.getAddress(chainId)) {
    console.log(`Chain ${chainId} not supported; update process.env.CHAIN_ID`)
    return
  }

  const rpcUrl = getNodeURL(chainId, String(process.env.INFURA_API_KEY || ''))
  if (!rpcUrl) {
    console.error(`No rpc url available for chainId ${chainId}`)
    return
  }
  console.log(`Using ${chainNames[chainId]} RPC @`, rpcUrl)
  const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
  await provider.getNetwork()

  if (process.env.REDISCLOUD_URL) {
    console.log('Using Redis @', process.env.REDISCLOUD_URL)
  }

  const wallet = new ethers.Wallet(String(process.env.PRIVATE_KEY), provider)
  console.log('\nLoaded signer', wallet.address)

  console.log(
    `\nNow serving ${chainNames[chainId]} (Swap: ${SwapERC20.getAddress(chainId)}, Name: ${DOMAIN_NAME_SWAP_ERC20}, Version: ${DOMAIN_VERSION_SWAP_ERC20})\n`
  )

  const config = {
    levels: (Levels as any)[chainId],
    wallet,
    chainId,
    swapContract: SwapERC20.getContract(wallet, chainId),
    domainName: DOMAIN_NAME_SWAP_ERC20,
    domainVersion: DOMAIN_VERSION_SWAP_ERC20,
    confirmations: String(process.env.CONFIRMATIONS || '2'),
  }

  const app = express()
  const server = createServer(app)

  const protocols = [
    new RequestForQuoteERC20(config),
//    new LastLookERC20(config),
//    new IndexingERC20(config),
//    new Indexing(config, new Redis(process.env.REDISCLOUD_URL)),
  ]
  protocols.push(new Discovery(config, protocols))

  new HTTP(config, app, protocols), new WS(config, server, protocols)
  server.listen(port)

  console.log(`Listening on port ${port} (HTTP, WS). Protocols:`)

  for (const idx in protocols) {
    console.log(`· ${protocols[idx].toString()}`)
  }
  console.log()
}

start()
