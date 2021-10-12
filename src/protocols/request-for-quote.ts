#!/usr/bin/env ts-node-script

'use strict'
import {
  toDecimalString,
  createLightOrder,
  createLightSignature,
  toAtomicString,
  calculateCostFromLevels,
} from '@airswap/utils'
import bodyParser from 'body-parser'
import Cors from 'cors'
import { decimals } from '../utils'

const lightDeploys = require('@airswap/light/deploys.js')

const start = function (config: any) {
  function initMiddleware(middleware: any) {
    return (req: any, res: any) =>
      new Promise((resolve, reject) => {
        middleware(req, res, (result: any) => {
          if (result instanceof Error) {
            return reject(result)
          }
          return resolve(result)
        })
      })
  }

  const cors = initMiddleware(
    Cors({
      methods: ['GET', 'POST', 'OPTIONS'],
    })
  )

  config.app.use(bodyParser.json())

  config.app.get('*', (req: any, res: any) => {
    res.statusCode = 200
    res.send(
      JSON.stringify({
        wallet: config.wallet.address,
        chainId: process.env.CHAIN_ID,
        pricing: config.levels,
      })
    )
  })

  config.app.options('*', async (req: any, res: any) => {
    await cors(req, res)
    res.statusCode = 200
    res.end()
  })

  config.app.post('*', async (req: any, res: any) => {
    await cors(req, res)

    let { signerToken, senderWallet, senderToken } = req.body.params
    let signerAmount
    let senderAmount

    const senderDecimals: any = decimals[senderToken]
    const signerDecimals: any = decimals[signerToken]
    let found = false

    for (const i in config.levels) {
      if (config.levels[i].baseToken.toLowerCase() === senderToken.toLowerCase()) {
        if (config.levels[i].quoteToken.toLowerCase() === signerToken.toLowerCase()) {
          found = true
          if (req.body.method === 'getSignerSideOrder') {
            senderAmount = req.body.params.senderAmount
            signerAmount = calculateCostFromLevels(
              toDecimalString(senderAmount, senderDecimals),
              config.levels[i].levels
            )
            signerAmount = toAtomicString(signerAmount, signerDecimals)
          } else {
            signerAmount = req.body.params.signerAmount
            senderAmount = calculateCostFromLevels(
              toDecimalString(signerAmount, signerDecimals),
              config.levels[i].levels
            )
            senderAmount = toAtomicString(senderAmount, senderDecimals)
          }
        }
      }
    }

    console.info(`Received request: ${JSON.stringify(req.body)}`)

    if (!found) {
      res.statusCode = 200
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -33601,
          message: 'Not serving pair'
        },
      })
    } else {

      const order = createLightOrder({
        nonce: String(Date.now()),
        expiry: String(
          Math.floor(Date.now() / 1000) + Number(process.env.EXPIRY)
        ),
        signerFee: String(process.env.SIGNER_FEE),
        signerWallet: config.wallet.address,
        signerToken,
        signerAmount,
        senderWallet,
        senderToken,
        senderAmount,
      })

      const signature = await createLightSignature(
        order,
        `0x${process.env.PRIVATE_KEY}`,
        lightDeploys[config.chainId],
        config.chainId
      )

      res.statusCode = 200
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: {
          ...order,
          ...signature,
        },
      })
    }
  })
}

export default start