# AirSwap Demo Maker

Runs RFQ and Last Look protocol servers for AirSwap.
Connect and debug using the AirSwap CLI: `yarn global add airswap`

**Install packages**

```
$ yarn
```

**Run on Rinkeby**

Copy `.env.example` to `.env` and update values:

```
PRIVATE_KEY= …
CHAIN_ID=4
GAS_PRICE=10
```

Then start the server (with both RFQ and streaming):

```
$ yarn dev
```

Now you can query the server from the AirSwap CLI:

```
$ yarn global add airswap
$ airswap chain
  → set to 4
$ airswap account:import (or account:generate)
$ airswap gas
  → set to 10
$ airswap token:approve
  → weth, dai
$ airswap stream:open
  → ws://localhost:3000
$ airswap rfq:get
  → http://localhost:3000
```

**Build and run for production**

```
$ yarn build
$ yarn start
```
