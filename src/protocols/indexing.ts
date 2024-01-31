import { BigNumber, Contract } from 'ethers'
import { ProtocolIds } from '@airswap/utils'
import { FullOrder } from '@airswap/utils'
import * as SwapContract from '@airswap/swap/build/contracts/Swap.sol/Swap.json'
import * as swapDeploys from '@airswap/swap/deploys.js'

import { result, error } from '../utils'
import { Protocol } from './protocol'

export class Indexing extends Protocol {
  private store: any

  constructor(config: any, store: any) {
    super(config, ProtocolIds.Indexing)
    this.store = store
    if (swapDeploys[String(config.chainId)]) {
      const contract = new Contract(
        swapDeploys[String(config.chainId)],
        SwapContract.abi,
        config.wallet.provider
      )
      contract.on('Swap', this.takenOrCancelled.bind(this))
      contract.on('Cancel', this.takenOrCancelled.bind(this))
    }
  }

  async takenOrCancelled(nonce: BigNumber, signerWallet: string) {
    await this.store.delete(signerWallet, nonce.toString())
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'addOrder':
        try {
          await this.store.write(params[0], params[1])
          respond(result(id, { message: 'OK' }))
        } catch (e: any) {
          respond(error(id, -32605, `unable to add: ${e.message}`))
        }
        break
      case 'getTags':
        respond(result(id, await this.store.tags(params[0])))
        break
      case 'getOrders':
        const filter = params[0]
        try {
          const { documents, total } = await this.store.read.apply(
            this.store,
            params
          )
          respond(
            result(id, {
              orders: documents.map((order: FullOrder) => order),
              offset: filter.offset,
              total: total,
            })
          )
        } catch (e: any) {
          respond(error(id, -32605, `unable to get: ${e.message}`))
        }
        break
    }
  }
}
