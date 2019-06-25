const http = require('http');
const server = http.createServer();

const Koa = require('koa');
const app = new Koa({ server });

const Router = require('koa-router');
const router = new Router();
const routes = require('./routes.js');

const WebSocket = require('ws');
const ws = new WebSocket.Server({ server });
const wsHandler = require('./wsHandler.js')(ws);

ws.on('connection', wsHandler);
app.use(routes(router));
server.listen(3000);
