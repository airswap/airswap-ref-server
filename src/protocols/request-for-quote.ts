#!/usr/bin/env ts-node-script

'use strict'
import {
  toDecimalString,
  createOrderERC20,
  createOrderERC20Signature,
  toAtomicString,
  calculateCostFromLevels,
} from '@airswap/utils'
import bodyParser from 'body-parser'
import Cors from 'cors'
import { decimals } from '../utils'
import { ChainIds } from '@airswap/constants'

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
        chainId: config.chainId,
        pricing: config.levels.RFQLevels,
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

    if (req.body.method === 'getPricingERC20') {
      res.statusCode = 200
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        result: config.levels.RFQLevels,
      })
      return
    }

    if (Number(req.body.params.chainId) !== config.chainId) {
      res.statusCode = 200
      res.json({
        jsonrpc: '2.0',
        id: req.body.id,
        error: {
          code: -33601,
          message: 'Not serving chain'
        },
      })
      return
    }

    let { signerToken, senderWallet, senderToken, swapContract } = req.body.params
    let signerAmount
    let senderAmount

    const senderDecimals: any = decimals[senderToken.toLowerCase()]
    const signerDecimals: any = decimals[signerToken.toLowerCase()]
    let found = false

    for (const i in config.levels.RFQLevels) {
      if (config.levels.RFQLevels[i].baseToken.toLowerCase() === senderToken.toLowerCase()) {
        if (config.levels.RFQLevels[i].quoteToken.toLowerCase() === signerToken.toLowerCase()) {
          found = true
          if (req.body.method === 'getSignerSideOrderERC20') {
            senderAmount = req.body.params.senderAmount
            try {
              signerAmount = calculateCostFromLevels(
                toDecimalString(senderAmount, senderDecimals),
                config.levels.RFQLevels[i].bid
              )
            } catch (e: any) {
              if (Number(req.body.params.chainId) === ChainIds.LINEAGOERLI) {
                signerAmount = '100'
              } else {
                res.statusCode = 200
                res.json({
                  jsonrpc: '2.0',
                  id: req.body.id,
                  error: {
                    code: -33601,
                    message: e.message
                  },
                })
                return
              }
            }
            signerAmount = toAtomicString(signerAmount, signerDecimals)
          } else {
            signerAmount = req.body.params.signerAmount
            try {
              senderAmount = calculateCostFromLevels(
                toDecimalString(signerAmount, signerDecimals),
                config.levels.RFQLevels[i].ask
              )
            } catch (e: any) {
              if (Number(req.body.params.chainId) === ChainIds.LINEAGOERLI) {
                senderAmount = '100'
              } else {
                res.statusCode = 200
                res.json({
                  jsonrpc: '2.0',
                  id: req.body.id,
                  error: {
                    code: -33601,
                    message: e.message
                  },
                })
                return
              }
            }
            senderAmount = toAtomicString(senderAmount, senderDecimals)
          }
        }
      }
    }

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

      const order = createOrderERC20({
        nonce: String(Date.now()),
        expiry: String(
          Math.floor(Date.now() / 1000) + Number(process.env.EXPIRY)
        ),
        protocolFee: String(process.env.PROTOCOL_FEE),
        signerWallet: config.wallet.address,
        signerToken,
        signerAmount,
        senderWallet,
        senderToken,
        senderAmount,
      })

      const signature = await createOrderERC20Signature(
        order,
        `0x${process.env.PRIVATE_KEY}`,
        swapContract,
        config.chainId
      )

      console.log('Making...', {
        ...order,
        ...signature,
      })

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
