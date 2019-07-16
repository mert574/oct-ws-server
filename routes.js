const Conversations = require('./ConversationManager.js');
const uuid = require('uuid/v4');
const agentId = "orema_agent";

module.exports = function(router) {
    // router.get("*", ctx => {
    //     ctx.status = 200;
    //     ctx.body = ":(";
    // });

    router.get("/ping", (ctx) => {
        ctx.body = "pong";
    });

    router.get("/conversations", (ctx) => {
        ctx.body = Conversations.conversations;
    });

    router.get("/agents", (ctx) => {
        ctx.body = Conversations.agents;
    });

    router.post("/octopus/checkIn", (ctx) => {
        console.log("New checkIn:", ctx.request.body);
        
        const accountId = uuid();
        const conversation = Conversations.initConversation([agentId, accountId], ctx.request.body.name);
        Conversations.message("EVENT", conversation.conversationId, agentId, { text: "Agent joined the conversation" });

        ctx.status = 200;
        ctx.body = conversation;
    });

    return router.routes();
};
