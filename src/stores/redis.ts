import { createClient } from 'redis'
import { FullOrder } from '@airswap/types'

function tokenKey(token: string, id: string) {
  return `ordersByToken:${token.toLowerCase()}:${id}`
}

function signerKey(signer: string, nonce: string) {
  return `ordersBySigner:${signer.toLowerCase()}:${nonce}`
}

export default class Redis {
  private client: any

  constructor(connectionUrl: any) {
    this.client = createClient({
      url: connectionUrl,
    })
  }

  async write(order: FullOrder) {
    if (!this.client.isOpen) {
      await this.client.connect()
    }

    const existing = await this.client.json.get(
      tokenKey(order.signer.token, order.signer.id)
    )
    if (existing) {
      const existingOrder = await this.client.json.get(
        signerKey(existing.signerWallet, existing.nonce)
      )
      await this.client.json.del(
        signerKey(existing.signerWallet, existing.nonce)
      )
      await this.client.json.del(
        tokenKey(existingOrder.signer.token, existingOrder.signer.id)
      )
    }

    await this.client.json.set(
      signerKey(order.signer.wallet, order.nonce),
      '$',
      order
    )
    await this.client.json.set(
      tokenKey(order.signer.token, order.signer.id),
      '$',
      { nonce: order.nonce, signerWallet: order.signer.wallet.toLowerCase() }
    )

    return true
  }

  async read(filter: any, offset: number, limit: number) {
    if (!this.client.isOpen) {
      await this.client.connect()
    }

    const args = []
    if (filter.senderToken) args.push(`@senderToken:(${filter.senderToken})`)
    if (filter.signerToken) args.push(`@signerToken:(${filter.signerToken})`)
    if (filter.signerId) args.push(`@signerId:(${filter.signerId})`)
    if (filter.signerWallet) args.push(`@signerWallet:(${filter.signerWallet})`)
    const { total, documents } = await this.client.ft.search(
      'index:ordersBySigner',
      args.join(' ')
    )
    return {
      documents: documents.slice(offset, limit).map((res: any) => res.value),
      offset,
      total,
    }
  }

  async delete(signerWallet: string, nonce: string) {
    if (!this.client.isOpen) {
      await this.client.connect()
    }

    const order = await this.client.json.get(signerKey(signerWallet, nonce))
    if (order) {
      await this.client.json.del(signerKey(order.signer.wallet, order.nonce))
      await this.client.json.del(tokenKey(order.signer.token, order.signer.id))
      return true
    }
    return false
  }
}
