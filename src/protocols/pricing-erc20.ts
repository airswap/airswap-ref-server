import WebSocket from 'ws'
import { result } from '../utils'
import { Protocols } from '@airswap/constants'
import { Protocol } from './protocol'

export class PricingERC20 extends Protocol {
  public subscribers: WebSocket[] = []

  constructor(config: any) {
    super(config, Protocols.PricingERC20)
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
    }
  }

  closed(ws: WebSocket) {
    this.unsubscribe(ws)
  }
}
