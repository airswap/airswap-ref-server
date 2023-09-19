'use strict'
import WebSocket from 'ws'

export class Protocol {
  public interfaceId: string
  public config: any

  constructor(config: any, interfaceId: string) {
    this.config = config
    this.interfaceId = interfaceId
  }

  closed(ws: WebSocket) {
    // noop
  }

  toString() {
    return `${this.constructor.name} (${this.interfaceId})`
  }
}
