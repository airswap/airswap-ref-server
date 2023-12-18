const dotenv = require('dotenv')
const { createClient, SchemaFieldTypes } = require('redis');

dotenv.config()
const client = createClient({
  url: process.env.REDISCLOUD_URL
});
client.connect().then(async () => {
  try {
    await client.ft.dropIndex('index')
    await client.ft.create('index', {
      '$.signer.token': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerToken'
      },
      '$.signer.wallet': {
        type: SchemaFieldTypes.TEXT,
        AS: 'signerWallet'
      },
    }, {
      ON: 'JSON',
    });
    process.exit(0);
  } catch (e) {
    if (e.message === 'Index already exists') {
        console.log('Index exists already, skipped creation.');
    } else {
        console.error(e);
        process.exit(1);
    }
  }
})
