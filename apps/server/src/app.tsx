import type { FC } from 'hono/jsx'
import { Hono } from 'hono'

const app = new Hono()

const Layout: FC = (props) => {
  return (
    <html lang="en">
      <body>{props.children}</body>
    </html>
  )
}

const Top: FC<{ messages: string[] }> = (props: {
  messages: string[]
}) => {
  return (
    <Layout>
      <h1>Hello Hono!</h1>
      <ul>
        {props.messages.map((message) => {
          return (
            <li>
              {message}
              !!
            </li>
          )
        })}
      </ul>
    </Layout>
  )
}

app.get('/', (c) => {
  const messages = ['Good Morning', 'Good Evening', 'Good Night']
  return c.html(<Top messages={messages} />)
})

export {
  app,
}
