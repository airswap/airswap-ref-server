'use strict'
import {
  toDecimalString,
  createOrderERC20,
  createOrderERC20Signature,
  toAtomicString,
  getCostFromPricing,
} from '@airswap/utils'
import { Protocols } from '@airswap/constants'

import { Protocol } from './protocol'
import { decimals, result, error } from '../utils'

export class RequestForQuoteERC20 extends Protocol {
  constructor(config: any) {
    super(config, Protocols.RequestForQuoteERC20)
  }

  async received(
    id: any,
    method: any,
    params: any,
    respond: any,
    ws: WebSocket
  ) {
    if (
      method === 'getSignerSideOrderERC20' ||
      method === 'getSenderSideOrderERC20'
    ) {
      if (Number(params.chainId) !== this.config.chainId) {
        respond(
          error(id, {
            code: -33601,
            message: 'Not serving chain',
          })
        )
        return
      }

      let { signerToken, senderWallet, senderToken, swapContract } = params
      let signerAmount
      let senderAmount

      const signerDecimals = decimals[signerToken.toLowerCase()]
      const senderDecimals = decimals[senderToken.toLowerCase()]

      switch (method) {
        case 'getSignerSideOrderERC20':
          senderAmount = toDecimalString(
            params.senderAmount,
            decimals[senderToken.toLowerCase()]
          )
          signerAmount = getCostFromPricing(
            'buy',
            senderAmount,
            senderToken,
            signerToken,
            this.config.levels
          )
          break
        case 'getSenderSideOrderERC20':
          signerAmount = toDecimalString(
            params.signerAmount,
            decimals[signerToken.toLowerCase()]
          )
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
          swapContract,
          this.config.chainId
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
        respond(
          error(id, {
            code: -33601,
            message: 'Not serving pair',
          })
        )
      }
    }
  }
}
