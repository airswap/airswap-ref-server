import { ethers } from 'ethers'
import { checkResultToErrors, orderERC20ToParams } from '@airswap/utils'
import { Protocols, explorerUrls } from '@airswap/constants'
import { SwapERC20 } from '@airswap/libraries'

import * as SwapContract from '@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json'
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'

import { Protocol } from './protocol'
import { result, error } from '../utils'

export class LastLookERC20 extends Protocol {
  constructor(config: any) {
    super(config, Protocols.LastLookERC20)
  }

  async received(id: any, method: any, params: any, respond: any) {
    if (method === 'considerOrderERC20') {
      console.log('Checking...', params)
      const [errCount, errors] = await SwapERC20.getContract(
        this.config.wallet.provider,
        this.config.chainId
      ).check(this.config.wallet.address, ...orderERC20ToParams(params))
      if (errCount.isZero()) {
        const gasPrice = await this.config.wallet.getGasPrice()
        console.log('No errors; taking...', `(gas price ${gasPrice / 10 ** 9})`)
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
            respond(error(id, error.message))
          })
      } else {
        console.log('Errors...', checkResultToErrors(errCount, errors))
        respond(error(id, errors))
      }
    }
  }
}
