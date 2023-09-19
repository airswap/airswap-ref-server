import { result } from '../utils'
import { Protocols } from '@airswap/constants'
import { OrderERC20 } from '@airswap/types'

import { Protocol } from './protocol'

export class StorageERC20 extends Protocol {
  public orders: OrderERC20[] = []

  constructor(config: any) {
    super(config, Protocols.StorageERC20)
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'addOrderERC20':
        this.orders.push(params)
        respond(result(id, true))
        break
      case 'getOrdersERC20':
        respond(result(id, this.orders))
        break
    }
  }
}
