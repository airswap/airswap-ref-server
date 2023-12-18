import { AggregateSteps, AggregateGroupByReducers, createClient, SchemaFieldTypes } from 'redis';
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
    await this.client.json.set(`order:${order.signer.wallet}:${order.nonce}`, '$', order)
    await this.client.disconnect();
    return true;
  }

  async read(filter: any, offset: number, limit: number) {
    await this.client.connect();
    const { total, documents } = await this.client.ft.search(
      'index',
      `@signerToken:(${filter.signerTokens[0]})`
    );
    await this.client.disconnect();
    return {
      orders: documents.slice(offset, limit).map((res: any) => res.value),
      pagination: {
        total,
        offset
      }
    }
  }
}