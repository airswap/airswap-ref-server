import WebSocket from 'ws'
import { ethers } from 'ethers'
import { checkResultToErrors, orderERC20ToParams } from '@airswap/utils'
import { Protocols, explorerUrls } from '@airswap/constants'
import { SwapERC20 } from '@airswap/libraries'

import * as SwapContract from '@airswap/swap-erc20/build/contracts/SwapERC20.sol/SwapERC20.json'
// @ts-ignore
import * as swapDeploys from '@airswap/swap-erc20/deploys.js'

const start = function (config: any) {
  const wss = new WebSocket.Server({ server: config.server })
  const subscribers: WebSocket[] = []

  function removeSubscriber(subscriber: WebSocket) {
    const idx = subscribers.findIndex((ws: WebSocket) => {
      if (ws === subscriber) return true
    })
    subscribers.splice(idx, 1)
  }

  setInterval(() => {
    for (let idx in subscribers) {
      subscribers[idx].send(
        JSON.stringify({
          jsonrpc: '2.0',
          method: 'setPricingERC20',
          params: [config.levels.LLLevels],
        })
      )
    }
  }, 1000)

  wss.on('connection', (ws: any, req: any) => {
    ws.on('message', async (message: any) => {
      let json: any
      try {
        json = JSON.parse(message)
      } catch (e) {
        console.log('Failed to parse JSON-RPC message', message)
        return
      }
      switch (json.method) {
        case 'subscribePricingERC20':
        case 'subscribeAllPricingERC20':
          subscribers.push(ws)
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: json.id,
              result: config.levels.LLLevels,
            })
          )
          break
        case 'unsubscribePricingERC20':
        case 'unsubscribeAllPricingERC20':
          removeSubscriber(ws)
          ws.send(
            JSON.stringify({
              jsonrpc: '2.0',
              id: json.id,
              result: true,
            })
          )
          break
        case 'considerOrderERC20':
          console.log('Checking...', json.params)
          const [errCount, errors] = await SwapERC20.getContract(
            config.wallet.provider,
            config.chainId
          ).check(config.wallet.address, ...orderERC20ToParams(json.params))
          if (errCount.isZero()) {
            const gasPrice = await config.wallet.getGasPrice()
            console.log(
              'No errors; taking...',
              `(gas price ${gasPrice / 10 ** 9})`
            )
            new ethers.Contract(
              swapDeploys[config.chainId],
              SwapContract.abi,
              config.wallet
            )
              .swapLight(...orderERC20ToParams(json.params), { gasPrice })
              .then((tx: any) => {
                ws.send(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    id: json.id,
                    result: true,
                  })
                )
                console.log(
                  'Submitted...',
                  `${explorerUrls[tx.chainId]}/tx/${tx.hash}`
                )
                tx.wait(config.confirmations).then(() => {
                  console.log(
                    'Mined ✨',
                    `${explorerUrls[tx.chainId]}/tx/${tx.hash}`
                  )
                })
              })
              .catch((error: any) => {
                ws.send(
                  JSON.stringify({
                    jsonrpc: '2.0',
                    id: json.id,
                    error: error.message,
                  })
                )
                console.log(error.message)
              })
          } else {
            ws.send(
              JSON.stringify({
                jsonrpc: '2.0',
                id: json.id,
                error: errors,
              })
            )
            console.log('Errors...', checkResultToErrors(errCount, errors))
          }
          break
      }
    })
    ws.on('close', () => {
      removeSubscriber(ws)
    })
    ws.send(
      JSON.stringify({
        jsonrpc: '2.0',
        method: 'setProtocols',
        params: [
          [
            {
              name: Protocols.LastLookERC20,
              version: '1.0.0',
              params: {
                senderWallet: config.wallet.address,
                swapContract: swapDeploys[config.chainId],
              },
            },
          ],
        ],
      })
    )
    console.log('Connection', req.socket.remoteAddress)
  })
}

export default start
