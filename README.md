# promexify

Safely use `async` `await` middlewares in express.

No need to write `next()` and deal with unresolved promise rejections.

Forget about writing this kind of middlewares...

```js
async function myAsyncMiddleware (req, res, next) {
  try {
    await timeout(30)
    res.body = 'done'
    next()
  } catch (e) {
    next(e)
  }
}
```

# usage

**NOTE**: Always use `async` functions. This will **NOT** work on functions retuning a `Promise`.

```js
import express from 'express'
import { promexify } from 'promexify'

const timeout = ms => new Promise(resolve => setTimeout(() => resolve(), ms))

const app = express()
promexify(app) // <<< enables async await middlewares

app.use(
  async (req, res) => {
    await timeout(30) // some async call
    res.body = 'done'
  },
  async (err, req, res) => { // trap errors
    res.body = err.message
  },
  (req, res) => {
    res.end(res.body)
  },
)
```

also works on `express.Router`

```js
const router = new express.Router()
promexify(router) // <<< enables async await middlewares

router.get('/',
  async (req, res) => {
    await timeout(30) // some async call
    res.body = 'done'
  }
)

const app = express()
app.use('/router', router)
app.use((req, res) => res.end(res.body))
```

Or even on a some middlewares

```js
import express from 'express'
import { promex } from 'promexify'

const app = express()
app.use(
  bodyParser.json(),
  ...promex(
    async (req, res) { res.body = await () => {...} },
    async (req, res) { ... },
  )
)
```

# license

[MIT](./LICENSE)
