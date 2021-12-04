// @ts-ignore
import util from 'util'
import { METHODS } from 'http'

/** @typedef {import('express').Application} Application */
/** @typedef {import('express').Router} Router */
/** @typedef {import('express').ErrorRequestHandler} ErrorRequestHandler */
/** @typedef {import('express').Handler} Handler */

const { isAsyncFunction } = util.types

/**
 * @internal
 * @param {Function} promFn async function
 * @returns {Handler}
 */
const wrapAsync = (promFn) => (req, res, next) =>
  promFn(req, res)
    .then(() => {
      // @ts-ignore
      if (!req.writableEnded) next()
    })
    .catch((/** @type {any} */ err) => next(err))

/**
 * @internal
 * @param {Function} promFn async function
 * @returns {ErrorRequestHandler}
 */
const wrapAsyncErr = (promFn) => (err, req, res, next) =>
  promFn(err, req, res)
    .then(() => {
      // @ts-ignore
      if (!req.writableEnded) next()
    })
    .catch((/** @type {any} */ err) => next(err))

/**
 * promisify middlewares
 * @param  {...any} mws
 * @returns {any[]} promisified middlewares
 */
export function promid (...mws) {
  return mws.map(fn => {
    if (typeof fn !== 'function') {
      return fn
    }
    switch (fn.length) {
      case 2:
        return (isAsyncFunction(fn))
          ? wrapAsync(fn)
          : fn
      case 4:
        return fn
      default: { // case 3:
        return (isAsyncFunction(fn))
          ? wrapAsyncErr(fn)
          : fn
      }
    }
  })
}

/**
 * promisify
 * @param {Application|Router} app express application or router
 */
export function promisify (app) {
  ;['use', ...METHODS]
    .map(method => method.toLowerCase())
    .forEach(method => {
      // @ts-ignore
      if (typeof app[method] === 'function') {
        // @ts-ignore
        const wrapper = app[method]
        const wrapped = function (/** @type {Handler[]} */...mws) {
          return wrapper.apply(app, promid(...mws))
        }
        // @ts-ignore
        app[method] = wrapped
      }
    })
}
