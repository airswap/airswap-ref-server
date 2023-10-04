'use strict'
import {
  toDecimalString,
  createOrderERC20,
  createOrderERC20Signature,
  toAtomicString,
  getCostFromPricing,
} from '@airswap/utils'
import { Protocols } from '@airswap/constants'

import * as swapDeploys from '@airswap/swap-erc20/deploys.js'

import { Protocol } from './protocol'
import { decimals, result, error } from '../utils'

export class RequestForQuoteERC20 extends Protocol {
  constructor(config: any) {
    super(config, Protocols.RequestForQuoteERC20)
  }

  async received(id: any, method: any, params: any, respond: any) {
    if (
      method === 'getSignerSideOrderERC20' ||
      method === 'getSenderSideOrderERC20'
    ) {
      let { signerToken, senderWallet, senderToken, swapContract } = params
      if (!signerToken || !senderToken || !senderWallet || !swapContract) {
        respond(error(id, -33604, 'Invalid request params'))
        return
      }
      if (Number(params.chainId) !== this.config.chainId) {
        respond(error(id, -33601, 'Not serving chain'))
        return
      }
      if (swapContract !== this.config.swapContract) {
        respond(
          error(id, -33604, `Using swap contract ${this.config.swapContract}`)
        )
        return
      }

      const signerDecimals = decimals[signerToken.toLowerCase()]
      const senderDecimals = decimals[senderToken.toLowerCase()]

      let signerAmount
      let senderAmount

      switch (method) {
        case 'getSignerSideOrderERC20':
          senderAmount = toDecimalString(params.senderAmount, senderDecimals)
          signerAmount = getCostFromPricing(
            'buy',
            senderAmount,
            senderToken,
            signerToken,
            this.config.levels
          )
          break
        case 'getSenderSideOrderERC20':
          signerAmount = toDecimalString(params.signerAmount, signerDecimals)
          senderAmount = getCostFromPricing(
            'sell',
            signerAmount,
            signerToken,
            senderToken,
            this.config.levels
          )
          break
      }

      if (signerAmount && senderAmount) {
        const order = createOrderERC20({
          nonce: String(Date.now()),
          expiry: String(
            Math.floor(Date.now() / 1000) + Number(process.env.EXPIRY)
          ),
          protocolFee: String(process.env.PROTOCOL_FEE),
          signerWallet: this.config.wallet.address,
          signerToken,
          signerAmount: toAtomicString(signerAmount, signerDecimals),
          senderWallet,
          senderToken,
          senderAmount: toAtomicString(senderAmount, senderDecimals),
        })

        const signature = await createOrderERC20Signature(
          order,
          `0x${process.env.PRIVATE_KEY}`,
          this.config.swapContract,
          this.config.chainId,
          this.config.domainVersion,
          this.config.domainName
        )

        console.log('Making...', {
          ...order,
          ...signature,
        })

        respond(
          result(id, {
            ...order,
            ...signature,
          })
        )
      } else {
        respond(error(id, -33601, 'Not serving pair'))
      }
    }
  }
}
