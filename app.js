const Koa = require('koa');
const websockify = require('koa-websocket');
const app = websockify(new Koa());

const Router = require('koa-router');
const RestRouter = new Router();
const restRoutes = require('./routes.js');

const WebsocketRouter = new Router();
const websocketRoutes = require('./wsHandler.js');
const bodyParser = require('koa-bodyparser');

const cors = require('@koa/cors');

app.use(cors());
app.use(bodyParser());

app.use(restRoutes(RestRouter));
app.ws.use(websocketRoutes(WebsocketRouter));

app.listen(3000);
