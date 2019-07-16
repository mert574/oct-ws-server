const WS = require("ws");

const ws = new WS("ws://localhost:8080/ws-test");

ws.on("open",  (...args)=>console.log("connected", args));
ws.on("close", (...args)=>console.log("closed", args));
ws.on("error", (...args)=>console.log("closed", args));
ws.on("message", (...args)=>console.log("message", args));
