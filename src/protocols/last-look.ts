import WebSocket from 'ws'
import { ethers } from 'ethers'
import { orderToParams } from '@airswap/utils'
import { etherscanDomains } from '@airswap/constants'


const Swap = require('@airswap/swap/build/contracts/Swap.sol/Swap.json')
const swapDeploys = require('@airswap/swap/deploys.js')

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
        params: [config.levels.LLLevels],
      }))
    }
  }, 1000)

  wss.on('connection', (ws: any, req: any) => {
    ws.on('message', (message: any) => {
      let json: any
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
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: json.id,
            result: [config.LLLevels]
          }))
          break
        case 'unsubscribe':
        case 'unsubscribeAll':
          removeSubscriber(ws)
          ws.send(JSON.stringify({
            jsonrpc: '2.0',
            id: json.id,
            result: true
          }))
          break
        case 'consider':
          console.log('Taking...', `(gas price ${config.gasPrice})`, json.params)
          new ethers.Contract(swapDeploys[config.chainId], Swap.abi, config.wallet)
            .light(...orderToParams(json.params), { gasPrice: config.gasPrice })
            .then((tx: any) => {
              ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id: json.id,
                result: true
              }))
              console.log('Submitted...', `https://${etherscanDomains[tx.chainId]}/tx/${tx.hash}`)
              tx.wait(config.confirmations).then(() => {
                console.log('Mined ✨', `https://${etherscanDomains[tx.chainId]}/tx/${tx.hash}`)
              })
            })
            .catch((error: any) => {
              console.log(error)
              ws.send(JSON.stringify({
                jsonrpc: '2.0',
                id: json.id,
                error: error.message
              }))
              console.log(error.message)
            })
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
          swapContract: swapDeploys[config.chainId],
        },
      }]]
    }))
    console.log('Connection', req.socket.remoteAddress)
  })
}

export default start
