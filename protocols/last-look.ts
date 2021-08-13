#!/usr/bin/env ts-node-script

'use strict'
import WebSocket from 'ws'
const lightDeploys = require('@airswap/light/deploys.js')

const start = function (config: any) {
  const wss = new WebSocket.Server({ server: config.server })

  wss.on('connection', function connection(ws: any) {
    ws.on('message', function incoming(message: any) {
      let json
      try {
        json = JSON.parse(message)
      } catch (e) {
        console.log('Failed to parse JSON-RPC message', message)
        return
      }
      switch (json.method) {
        case 'provideOrder':
          // TODO
          break
      }
    })
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'initialize',
        params: {
          senderWallet: config.wallet.address,
          swapContract: lightDeploys[config.chainId],
        },
      })
    )
    setInterval(() => {
      ws.send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'updateLevels',
          params: config.levels,
        })
      )
    }, 1000)
  })
}

export default start
