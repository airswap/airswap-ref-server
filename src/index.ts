import dotenv from 'dotenv'
import * as ethers from 'ethers'
import express from 'express'
import { createServer } from 'http'

import LastLook from './protocols/last-look'
import RFQ from './protocols/request-for-quote'
import { RFQLevels, LLLevels } from './levels'
import { getNodeURL } from './utils'
import { chainNames } from '@airswap/constants'

// @ts-ignore
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'

dotenv.config()

async function start () {
  const port = parseInt(String(process.env.PORT), 10) || 3000
  const chainId = Number(process.env.CHAIN_ID)
  const provider = new ethers.providers.JsonRpcProvider(getNodeURL(chainId, String(process.env.INFURA_API_KEY)))
  await provider.getNetwork()

  const wallet = new ethers.Wallet(String(process.env.PRIVATE_KEY), provider)
  const app = express()
  const server = createServer(app)
  const config = {
    app,
    server,
    levels: {
      RFQLevels: (RFQLevels as any)[chainId],
      LLLevels: (LLLevels as any)[chainId]
    },
    wallet,
    chainId,
    confirmations: String(process.env.CONFIRMATIONS || '2')
  }

  console.log(`Loaded signer`, wallet.address)
  console.log(`Serving for ${chainNames[chainId]} (Swap: ${swapDeploys[chainId]})`)

  LastLook(config)
  console.log(`Last-look protocol started`)

  RFQ(config)
  console.log(`Request-for-quote started`)

  server.listen(port)
  console.log(`Listening on port ${port}`)
}

start()
