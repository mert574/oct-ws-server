const Conversations = require('./ConversationManager.js');
const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
const { send, _dialog, _message } = require("./util.js");

module.exports = function(router) {
    const messageActions = {
        "DIALOG": ({ conversationId, content }, ws, ctx) => {
            Conversations.message("DIALOG", conversationId, ctx.params.accountId, content);
        }
    };

    function messageHandlerFactory(ws, ctx) {
        return (message) => {
            try {
                const { type, ...payload } = JSON.parse(message);
                try {
                    messageActions[type](payload, ws, ctx);
                } catch(e) {
                    console.warn("Couldn't act to the message!", type, payload, "\n\n", e);    
                }
            } catch(e) {
                console.warn("Couldn't parse the message!", message, "\n\n", e);
            }
        };
    };

    router.get("/ws/messaging/:accountId", ({websocket: ws, ...ctx}) => {
        const accountId = ctx.params.accountId;
        const conversations = Conversations.findConversationsByAccountId(accountId);
        const isAgent = accountId.endsWith("agent");

        conversations.forEach((conversation) => {
            Conversations.addListener(accountId, conversation.conversationId, (conversation, message) => {
                send(ws, _message(conversation.conversationId, message));
            });

            send(ws, { type: "CONVERSATION", ...conversation });
        });

        if (isAgent) {
            Conversations.setAgentHandler(accountId, ws);
        }

        ws.on('message', messageHandlerFactory(ws, ctx));

        ws.on('close', () => {
            if (isAgent) {
                Conversations.removeAgentHandler(accountId);
            }

            Conversations.removeListeners(accountId);

            conversations.forEach(({ conversationId }) => {

                if (!isAgent) {
                    Conversations.message("EVENT", conversationId, accountId, { text: "User left the conversation" });
                    Conversations.setConversationStatus(conversationId, "PASSIVE");
                }
            });
        });
    });
    
    return router.routes();
};
