import { Client } from 'pg'
import { FullOrder } from '@airswap/types'

export default class PG {
  private client: any

  constructor(connectionString: any) {
    this.client = new Client({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      }
    });
  }

  async write(order: FullOrder) {
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
    this.client.end();
  }

  async read(filter: any, offset: number, limit: number) {
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
    })
    this.client.end();
  }
}