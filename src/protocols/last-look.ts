'use strict'
import WebSocket from 'ws'
const lightDeploys = require('@airswap/light/deploys.js')

const start = function (config: any) {
  const wss = new WebSocket.Server({ server: config.server })
  const subscribers: WebSocket[] = []

  function removeSubscriber(subscriber: WebSocket) {
    const idx = subscribers.findIndex((ws: WebSocket) => { if (ws === subscriber) return true })
    subscribers.splice(idx, 1)
  }

  setInterval(() => {
    for (let idx in subscribers) {
      subscribers[idx].send(JSON.stringify({
        jsonrpc: '2.0',
        method: 'updatePricing',
        params: config.levels,
      }))
    }
  }, 1000)

  wss.on('connection', (ws: any) => {
    ws.on('message', (message: any) => {
      let json
      try {
        json = JSON.parse(message)
      } catch (e) {
        console.log('Failed to parse JSON-RPC message', message)
        return
      }
      switch (json.method) {
        case 'subscribe':
        case 'subscribeAll':
          subscribers.push(ws)
          break
        case 'unsubscribe':
        case 'unsubscribeAll':
          removeSubscriber(ws)
          break
        case 'consider':
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: json.id,
            result: 'true'
          }))
          console.log('Taking...', json.params)
          break
      }
    })
    ws.on('close', () => {
      removeSubscriber(ws)
    })
    ws.send(JSON.stringify({
      jsonrpc: '2.0',
      method: 'initialize',
      params: [[{
        name: 'last-look',
        version: '1.0.0',
        params: {
          senderWallet: config.wallet.address,
          swapContract: lightDeploys[config.chainId],
        },
      }]]
    }))
  })
}

export default start
