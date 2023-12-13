import { result } from '../utils'
import { Protocols } from '@airswap/constants'
import { Order } from '@airswap/types'
import { Protocol } from './protocol'
import { Client } from 'pg'

export class Storage extends Protocol {
  public orders: Order[] = []
  private client: any

  constructor(config: any) {
    super(config, Protocols.Storage)
  }

  async received(id: any, method: any, params: any, respond: any) {
    switch (method) {
      case 'addOrder':
        const order = params[0]
        this.client = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        });
        this.client.connect();
        await this.client.query(`INSERT INTO orders (
          chainid, swapcontract, nonce, expiry, protocolfee, signerwallet,
          signertoken, signerkind, signerid, senderwallet, sendertoken,
          senderkind, senderamount, affiliatewallet, affiliateamount,
          v, r, s) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17, $18)`, [
          order.chainId, order.swapContract, order.nonce, order.expiry,
          order.protocolFee, order.signer.wallet, order.signer.token,
          order.signer.kind, order.signer.id, order.sender.wallet, order.sender.token,
          order.sender.kind, order.sender.amount, order.affiliateWallet,
          order.affiliateAmount, order.v, order.r, order.s ]
        );
        respond(result(id, order))
        break
      case 'getOrders':
        const filter = params[0]
        this.client = new Client({
          connectionString: process.env.DATABASE_URL,
          ssl: {
            rejectUnauthorized: false
          }
        });
        this.client.connect();
        this.client.query('SELECT * FROM orders', (err: any, res: any) => {
          if (err) throw err;
          const orders = []
          for (let i = 0; i < res.rows.length; i ++) {
            let row = res.rows[i]
            orders[i] = {
              addedOn: 0,
              hash: i,
              order: {
                chainId: row.chainid,
                swapContract: row.swapContract,
                nonce: row.nonce,
                expiry: row.expiry,
                protocolFee: row.protocolfee,
                signer: {
                  wallet: row.signerwallet,
                  token: row.signertoken,
                  kind: row.signerkind,
                  id: row.signerid,
                  amount: "0"
                },
                sender: {
                  wallet: row.senderwallet,
                  token: row.sendertoken,
                  kind: row.senderkind,
                  id: "0",
                  amount: row.senderamount
                },
                affiliateWallet: row.affiliatewallet,
                affiliateAmount: row.affiliateamount,
                v: row.v,
                r: row.r,
                s: row.s,
              }
            }
          }
          respond(result(id, {
            orders,
            pagination: {
                limit: 10,
                offset: 0,
                total:1
            }
        }))
          this.client.end();
        });
        break
    }
  }
}
