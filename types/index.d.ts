/**
 * promisify middlewares
 * @param  {...any} mws
 * @returns {any[]} promisified middlewares
 */
export function promid(...mws: any[]): any[];
/**
 * promisify
 * @param {Application|Router} app express application or router
 */
export function promisify(app: Application | Router): void;
export type Application = import('express').Application;
export type Router = import('express').Router;
export type ErrorRequestHandler = import('express').ErrorRequestHandler;
export type Handler = import('express').Handler;
