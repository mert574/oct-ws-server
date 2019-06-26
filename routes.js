const Conversations = require('./ConversationManager.js');
const uuid = require('uuid/v4');

const agentId = "agent1";

module.exports = function(router) {
    router.get("/init", (ctx) => {
        const accountId = uuid();
        const conversation = Conversations.initConversation([agentId, ctx.params.accountId]);

        ctx.status = 200;
        ctx.body = conversation;
    });

    return router.routes();
};
