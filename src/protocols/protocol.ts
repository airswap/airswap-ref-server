'use strict'

export class Protocol {
  public interfaceId: string
  public config: any

  constructor(config: any, interfaceId: string) {
    this.config = config
    this.interfaceId = interfaceId
  }

  toString() {
    return `${this.constructor.name} (${this.interfaceId})`
  }
}
