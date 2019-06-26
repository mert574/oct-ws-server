const Conversations = require('./ConversationManager.js');

const agentId = "agent1";

module.exports = function(router) {
    router.get("/:accountId/init", (ctx) => {
        const conversation = Conversations.initConversation([agentId, ctx.params.accountId]);

        ctx.status = 200;
        ctx.body = conversation;
    });

    return router.routes();
};
