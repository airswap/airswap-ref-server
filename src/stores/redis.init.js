const dotenv = require('dotenv')
const { createClient, SchemaFieldTypes } = require('redis');

dotenv.config()
const client = createClient({
  url: process.env.REDISCLOUD_URL
});
client.connect().then(async () => {
  try {
    await client.flushAll()
    await client.ft.create('index:ordersBySigner', {
      '$.nonce': {
        type: SchemaFieldTypes.TEXT,
        AS: 'nonce'
      },
      '$.expiry': {
        type: SchemaFieldTypes.TEXT,
        AS: 'expiry'
      },
      '$.signer.wallet': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerWallet'
      },
      '$.signer.token': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerToken'
      },
      '$.signer.amount': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerAmount'
      },
      '$.signer.id': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerId'
      },
      '$.sender.amount': {
        type: SchemaFieldTypes.TEXT,
        AS: 'senderAmount'
      },
      '$.sender.token': {
        type: SchemaFieldTypes.TEXT,
        AS: 'senderToken'
      },
    }, {
      ON: 'JSON',
    });
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})
