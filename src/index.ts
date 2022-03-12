import dotenv from 'dotenv'
import * as ethers from 'ethers'
import express from 'express'
import { createServer } from 'http'

import LastLook from './protocols/last-look'
import RFQ from './protocols/request-for-quote'
import { RFQLevels, LLLevels } from './levels'
import { getProvider } from './utils'
import { chainNames } from '@airswap/constants'

dotenv.config()

async function start () {
  const port = parseInt(String(process.env.PORT), 10) || 3000
  const wallet = new ethers.Wallet(String(process.env.PRIVATE_KEY), await getProvider(String(process.env.INFURA_API_KEY)))
  const chainId = Number(process.env.CHAIN_ID)
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
    gasPrice: `${process.env.GAS_PRICE || 20}000000000`,
    confirmations: String(process.env.CONFIRMATIONS || '2')
  }

  console.log(`Loaded account`, wallet.address)
  console.log(`Serving for ${chainNames[chainId]}`)

  LastLook(config)
  console.log(`Last-look protocol started`)

  RFQ(config)
  console.log(`Request-for-quote started`)

  server.listen(port)
  console.log(`Listening on port ${port}`)
}

start()
