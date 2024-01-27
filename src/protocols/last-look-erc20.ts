import WebSocket from 'ws'
import { ethers } from 'ethers'
import { parseCheckResult, orderERC20ToParams } from '@airswap/utils'
import { Protocols, explorerUrls } from '@airswap/constants'
import { SwapERC20 } from '@airswap/libraries'

import * as SwapContract from '@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json'
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'

import { Protocol } from './protocol'
import { result, error } from '../utils'

export class LastLookERC20 extends Protocol {
  public subscribers: WebSocket[] = []

  constructor(config: any) {
    super(config, Protocols.LastLookERC20)
    setInterval(() => {
      for (let idx in this.subscribers) {
        this.subscribers[idx].send(
          JSON.stringify({
            jsonrpc: '2.0',
            method: 'setPricingERC20',
            params: [config.levels],
          })
        )
      }
    }, 1000)
  }

  unsubscribe(subscriber: WebSocket) {
    const idx = this.subscribers.findIndex((ws: WebSocket) => ws === subscriber)
    this.subscribers.splice(idx, 1)
  }

  async received(
    id: any,
    method: any,
    params: any,
    respond: any,
    ws: WebSocket
  ) {
    switch (method) {
      case 'getPricingERC20':
      case 'getAllPricingERC20':
        respond(result(id, this.config.levels))
        break
      case 'subscribePricingERC20':
      case 'subscribeAllPricingERC20':
        this.subscribers.push(ws)
        respond(result(id, this.config.levels))
        break
      case 'unsubscribePricingERC20':
      case 'unsubscribeAllPricingERC20':
        this.unsubscribe(ws)
        respond(result(id, true))
        break
      case 'considerOrderERC20':
        console.log('Checking...', params)
        const [errCount, errors] = await SwapERC20.getContract(
          this.config.wallet.provider,
          this.config.chainId
        ).check(this.config.wallet.address, ...orderERC20ToParams(params))
        if (errCount.isZero()) {
          const gasPrice = await this.config.wallet.getGasPrice()
          console.log(
            'No errors; taking...',
            `(gas price ${gasPrice / 10 ** 9})`
          )
          new ethers.Contract(
            swapDeploys[this.config.chainId],
            SwapContract.abi,
            this.config.wallet
          )
            .swapLight(...orderERC20ToParams(params), { gasPrice })
            .then((tx: any) => {
              respond(result(id, true))
              console.log(
                'Submitted...',
                `${explorerUrls[tx.chainId]}/tx/${tx.hash}`
              )
              tx.wait(this.config.confirmations).then(() => {
                console.log(
                  'Mined ✨',
                  `${explorerUrls[tx.chainId]}/tx/${tx.hash}`
                )
              })
            })
            .catch((error: any) => {
              console.log(error.message)
              respond(error(id, -32603, error.message))
            })
        } else {
          console.log('Errors...', parseCheckResult(errors))
          respond(error(id, -33604, errors))
        }
    }
  }
}
