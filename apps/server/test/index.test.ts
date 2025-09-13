import { Hono } from 'hono'
import { testClient } from 'hono/testing'

describe('index', () => {
  it('foo bar', async () => {
    const app = new Hono().get('/search', c =>
      c.json({ hello: 'world' }))
    const res = await testClient(app).search.$get()

    expect(await res.json()).toEqual({ hello: 'world' })

    // expect(await res.json()).toEqual({ hello: 'world' })
  })
})
