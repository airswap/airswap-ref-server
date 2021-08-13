#!/usr/bin/env ts-node-script

'use strict'
import dotenv from 'dotenv'
import * as ethers from 'ethers'
import express from 'express'
import { createServer } from 'http'

import LastLook from './protocols/last-look'
import RFQ from './protocols/request-for-quote'
import levels from './levels'

dotenv.config()

const port = parseInt(String(process.env.PORT), 10) || 3000
const wallet = new ethers.Wallet(String(process.env.PRIVATE_KEY))
const chainId = Number(process.env.CHAIN_ID)
const app = express()
const server = createServer(app)
const config = {
  app,
  server,
  levels,
  wallet,
  chainId,
}

LastLook(config)
console.log(`Last-look protocol started`)

RFQ(config)
console.log(`Request-for-quote started`)

server.listen(port)
console.log(`Listening on port ${port}`)
