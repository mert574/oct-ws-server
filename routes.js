const Conversations = require('./ConversationManager.js');
const uuid = require('uuid/v4');
const agentId = "agent1";

module.exports = function(router) {
    router.post("/init", (ctx) => {
        const accountId = uuid();

        console.log("\n\n\n\nctx.request.body", ctx.request.body, "\n\n\n\n");
        const conversation = Conversations.initConversation([agentId, accountId], ctx.request.body.name);

        ctx.status = 200;
        ctx.body = conversation;
    });

    return router.routes();
};
