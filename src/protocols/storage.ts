import { result } from '../utils'
import { Protocols } from '@airswap/constants'
import { Protocol } from './protocol'

export class Storage extends Protocol {
  private store: any

  constructor(config: any, store: any) {
    super(config, Protocols.Storage)
    this.store = store;
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'addOrder':
        const order = params[0]
        await this.store.write(order);
        respond(result(id, order))
        break
      case 'getOrders':
//      const { filter, offset, limit } = params[0]
        const filter = params[0]
        const offset = 0
        const limit = 100
        const { orders, pagination } = await this.store.read(filter, offset, limit);
        respond(result(id, {
          orders,
          pagination,
        }));
        break
    }
  }
}
