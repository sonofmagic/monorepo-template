import type { Document, Request } from 'openapi-backend'
import express from 'express'
import fs from 'fs-extra'
import { OpenAPIBackend } from 'openapi-backend'

const app = express()
app.use(express.json())

const apiMap = new Map<string, OpenAPIBackend<Document>>()
const project = 'test'

// const definition = (await $RefParser.dereference(
//   fs.readJSONSync('./openapi.json'), { continueOnError: true })) as Document
const api = new OpenAPIBackend({ definition: fs.readJSONSync('./openapi.json') as Document })

// eslint-disable-next-line antfu/no-top-level-await
await api.init()
const operations = api.router.getOperations()
// console.log(operations, api.document.paths)

for (const operation of operations) {
  if (operation.operationId) {
    api.register(operation.operationId!, async (c, _req: express.Request, res: express.Response) => {
      const { mock, status } = c.api.mockResponseForOperation(c.operation.operationId!)
      return res.status(status).json(mock)
    })
  }
  else {
    console.log('no operationId', operation)
  }
}

// return 400 when request validation fails
api.register('validationFail', (c, _req: express.Request, res: express.Response) => {
  res.status(400).json({ err: c.validation.errors })
})
// return 404 when route doesn't match any operation in openapi.yml
api.register('notFound', (_c, _req: express.Request, res: express.Response) => {
  res.status(404).json({ message: 'not found' })
})
apiMap.set(project, api)

app.use('/mock/:project', (req, res) => {
  const { project } = req.params
  const api = apiMap.get(project)
  if (api) {
    return api.handleRequest(req as Request, req, res)
  }
  return res.status(404).json({ message: 'not found' })
})

app.listen(9001)
