import { result } from '../utils'
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'
import { Protocols } from '@airswap/constants'
import { Protocol } from './protocol'

export class Discovery extends Protocol {
  public protocols: any

  constructor(config: any, protocols: any) {
    super(config, Protocols.Discovery)
    this.protocols = protocols.slice()
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'getProtocols':
        const res = [
          {
            interfaceId: this.interfaceId,
            params: {},
          },
        ]
        for (let idx in this.protocols) {
          res.push({
            interfaceId: this.protocols[idx].interfaceId,
            params: {
              chainId: this.config.chainId,
              swapContractAddress: swapDeploys[this.config.chainId],
              walletAddress: this.config.wallet.address,
            },
          })
        }
        respond(result(id, res))
        break
    }
  }
}
