/**
 * promisify connect middlewares
 * @param  {...any} mws
 * @returns {any[]} promisified middlewares
 */
export function promex(...mws: any[]): any[];
/**
 * promisify for express app or router
 * @param {Application|Router} app express application or router
 */
export function promexify(app: Application | Router): void;
export type Application = import('express').Application;
export type Router = import('express').Router;
export type ErrorRequestHandler = import('express').ErrorRequestHandler;
export type Handler = import('express').Handler;
