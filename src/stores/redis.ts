import { createClient } from 'redis';
import { FullOrder } from '@airswap/types'

export default class Redis {
  private client: any

  constructor(connectionUrl: any) {
    this.client = createClient({
      url: connectionUrl
    })
  }

  async write(order: FullOrder) {
    await this.client.connect();
    await this.client.json.set(`orders:${order.signer.token}:${order.signer.id}`, '$', order)
    await this.client.disconnect();
    return true;
  }

  async read(filter: any, offset: number, limit: number) {
    await this.client.connect();
    const args = []
    if (filter.signerTokens?.length) args.push(`@signerToken:(${filter.signerTokens[0]})`)
    if (filter.signerIds?.length) args.push(`@signerId:(${filter.signerIds[0]})`)
    if (filter.signerWallet) args.push(`@signerWallet:(${filter.signerWallet})`)
    if (filter.nonce) args.push(`@nonce:(${filter.nonce})`)
    const { total, documents } = await this.client.ft.search(
      'index:orders',
      args.join(' ')
    );
    await this.client.disconnect();
    return {
      documents: documents.slice(offset, limit).map((res: any) => res.value),
      offset,
      total
    }
  }
}