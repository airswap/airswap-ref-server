import { result, error } from '../utils'
import { Protocols } from '@airswap/constants'
import { FullOrder } from '@airswap/types'
import { Protocol } from './protocol'

export class Indexing extends Protocol {
  private store: any

  constructor(config: any, store: any) {
    super(config, Protocols.Indexing)
    this.store = store;
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'addOrder':
        const order = params[0]
        try {
          await this.store.write(order)
          respond(result(id, { message: 'OK' }))
        } catch (e) {
          respond(error(id, -32605, 'unable to add'))
        }
        break
      case 'getOrders':
        const filter = params[0]
        try {
          const { documents, total } = await this.store.read(filter, filter.offset, filter.limit);
          respond(result(id, {
            orders: documents.map((order: FullOrder) => ({ order })),
            offset: filter.offset,
            total: total
          }));
        }
        catch (e) {
          respond(error(id, -32605, 'unable to get'))
        }
        break
    }
  }
}
