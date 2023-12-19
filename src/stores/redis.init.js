const dotenv = require('dotenv')
const { createClient, SchemaFieldTypes } = require('redis');

dotenv.config()
const client = createClient({
  url: process.env.REDISCLOUD_URL
});
client.connect().then(async () => {
  try {
    await client.flushAll()
    await client.ft.create('index:orders', {
      '$.signer.wallet': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerWallet'
      },
      '$.signer.token': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerToken'
      },
      '$.signer.id': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerId'
      },
      '$.nonce': {
        type: SchemaFieldTypes.TEXT,
        AS: 'nonce'
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
