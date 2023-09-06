import bodyParser from 'body-parser'
import Cors from 'cors'

function initMiddleware(middleware: any) {
  return (req: any, res: any) =>
    new Promise((resolve, reject) => {
      middleware(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result)
        }
        return resolve(result)
      })
    })
}

const cors = initMiddleware(
  Cors({
    methods: ['GET', 'POST', 'OPTIONS'],
  })
)

export default class HTTP {
  constructor(config: any, app: any, protocols: any) {
    app.use(bodyParser.json())
    app.options('*', async (req: any, res: any) => {
      await cors(req, res)
      res.statusCode = 200
      res.end()
    })

    app.get('*', (req: any, res: any) => {
      res.statusCode = 200
      res.send(
        JSON.stringify({
          wallet: config.wallet.address,
          chainId: config.chainId,
          pricing: config.levels,
        })
      )
    })

    app.post('*', async (req: any, res: any) => {
      await cors(req, res)
      for (let idx in protocols) {
        protocols[idx].received(
          req.body.id,
          req.body.method,
          req.body.params,
          (response: any) => {
            res.send(response)
          }
        )
      }
    })
  }
}
