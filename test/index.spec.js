import assert from 'node:assert'
import supertest from 'supertest'
import express from 'express'
import { METHODS } from 'http'
import { promexify } from '../src/index.js'

const LC_METHODS = METHODS
  .map(method => method.toLowerCase())
  .filter(method => !['head', 'connect'].includes(method))

const init = () => (req, res, next) => {
  req.locals = []
  req.errors = []
  next()
}

const asyncMw = (name) => async (req, res) => {
  req.locals = [...req.locals, name]
}

const mw = (name) => (req, res, next) => {
  req.locals = [...req.locals, `sync-${name}`]
  next()
}

const asyncErr = () => async (err, req, res) => {
  req.locals = [...req.locals, `err-${err.message}`]
}

const err = () => (err, req, res, next) => {
  req.locals = [...req.locals, `err-sync-${err.message}`]
  next()
}

const asyncThrowErr = (message) => async (req, res) => {
  req.errors = [...req.errors, message]
  throw new Error(message)
}

const throwErr = (message) => (req, res, next) => {
  req.errors = [...req.errors, message]
  next(new Error(message))
}

const asyncEnd = () => async (req, res) => {
  const { locals, errors } = req
  res.json({ locals, errors })
}

const end = () => (req, res) => {
  const { locals, errors } = req
  res.json({ locals, errors })
}

describe('promexify', function () {
  describe('express.app', function () {
    it('use', function () {
      const app = express()
      promexify(app)
      app.use(
        init(),
        mw('1'),
        throwErr('err2'),
        err(),
        asyncMw('3'),
        asyncThrowErr('err4'),
        asyncErr(),
        end()
      )

      return supertest(app).get('/').then(({ body }) => {
        // console.log(body)
        assert.deepStrictEqual(body, {
          locals: ['sync-1', 'err-sync-err2', '3', 'err-err4'],
          errors: ['err2', 'err4']
        })
      })
    })
    LC_METHODS.forEach(method => {
      it(method, function () {
        const app = express()
        promexify(app)
        app[method]('/',
          init(),
          mw('1'),
          throwErr('err2'),
          err(),
          asyncMw(method),
          asyncMw('3'),
          asyncThrowErr('err4'),
          asyncErr(),
          end()
        )

        return supertest(app)[method]('/').then(({ body }) => {
          // console.log(body)
          assert.deepStrictEqual(body, {
            locals: ['sync-1', 'err-sync-err2', method, '3', 'err-err4'],
            errors: ['err2', 'err4']
          })
        })
      })
    })
  })

  describe('express.Router', function () {
    it('use', function () {
      const app = express()
      const router = express.Router()
      promexify(router)
      router.use(
        mw('1'),
        throwErr('err2'),
        err(),
        asyncMw('3'),
        asyncThrowErr('err4'),
        asyncErr()
      )
      app.use(
        init(),
        router,
        end()
      )

      return supertest(app).get('/').then(({ body }) => {
        // console.log(body)
        assert.deepStrictEqual(body, {
          locals: ['sync-1', 'err-sync-err2', '3', 'err-err4'],
          errors: ['err2', 'err4']
        })
      })
    })
    LC_METHODS.forEach(method => {
      it(method, function () {
        const app = express()
        const router = express.Router()
        promexify(router)
        router[method]('/',
          mw('1'),
          throwErr('err2'),
          err(),
          asyncMw(method),
          asyncMw('3'),
          asyncThrowErr('err4'),
          asyncErr()
        )
        app[method]('/',
          init(),
          router,
          end()
        )

        return supertest(app)[method]('/').then(({ body }) => {
          // console.log(body)
          assert.deepStrictEqual(body, {
            locals: ['sync-1', 'err-sync-err2', method, '3', 'err-err4'],
            errors: ['err2', 'err4']
          })
        })
      })
    })
  })

  describe('express.app.Router', function () {
    it('use', function () {
      const app = express()
      promexify(app)
      const router = express.Router()
      promexify(router)
      router.use(
        mw('1'),
        throwErr('err2'),
        err(),
        asyncMw('3'),
        asyncThrowErr('err4'),
        asyncErr()
      )
      app.use(
        init(),
        router,
        asyncMw('5'),
        asyncEnd()
      )

      return supertest(app).get('/').then(({ body }) => {
        // console.log(body)
        assert.deepStrictEqual(body, {
          locals: ['sync-1', 'err-sync-err2', '3', 'err-err4', '5'],
          errors: ['err2', 'err4']
        })
      })
    })
    LC_METHODS.forEach(method => {
      it(method, function () {
        const app = express()
        promexify(app)
        const router = express.Router()
        promexify(router)
        router[method]('/',
          mw('1'),
          throwErr('err2'),
          err(),
          asyncMw(method),
          asyncMw('3'),
          asyncThrowErr('err4'),
          asyncErr()
        )
        app[method]('/',
          init(),
          router,
          asyncMw('5'),
          asyncEnd()
        )

        return supertest(app)[method]('/').then(({ body }) => {
          // console.log(body)
          assert.deepStrictEqual(body, {
            locals: ['sync-1', 'err-sync-err2', method, '3', 'err-err4', '5'],
            errors: ['err2', 'err4']
          })
        })
      })
    })
  })
})
