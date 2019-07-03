const Conversations = require('./ConversationManager.js');

module.exports = function(router) {

    function _d(data) {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        return data;
    }

    function _dialog(conversation, newMessage) {
        return _d({
            type: "DIALOG",
            conversationId: conversation.conversationId,
            content: newMessage.content,
            sender: newMessage.sender,
        });
    }

    const messageActions = {
        "DIALOG": ({ conversationId, content }, ws, ctx) => {
            Conversations.dialog(conversationId, ctx.params.accountId, content);
        }
    };

    function messageHandlerFactory(ws, ctx) {
        return (message) => {
            try {
                const { type, ...payload } = JSON.parse(message);
                messageActions[type](payload, ws, ctx);
            } catch(e) {
                console.warn("Couldn't act to the message!", message, e);
            }
        };
    };

    router.get("/conversation/agent/:accountId", ({websocket: ws, ...ctx}) => {
        const conversations = Conversations.findAgentConversationsByAccountId(ctx.params.accountId);

        conversations.forEach((conversation) => {
            Conversations.addListener(conversation.conversationId, (conversation, newMessage) => {
                const msg = _dialog(conversation, newMessage);
                ws.send(msg);
            });

            ws.send(_d({ type: "CONVERSATION", ...conversation }));
        });

        Conversations.setAgentHandler(ctx.params.accountId, ws);

        ws.on('message', messageHandlerFactory(ws, ctx));

        ws.on('close', () => {
            Conversations.removeAgentHandler(ctx.params.accountId);
        })
    });

    router.get("/conversation/:accountId", ({ websocket: ws, ...ctx }) => {
        const conversation = Conversations.findConversationByAccountId(ctx.params.accountId);
        
        console.log("new connection!", conversation);

        if (conversation.conversationId) {
            Conversations.addListener(conversation.conversationId, (conversation, newMessage) => {
                const msg = _dialog(conversation, newMessage);
                ws.send(msg);
            });

            ws.send(_d({ type: "CONVERSATION", ...conversation }));
        }

        ws.on('message', messageHandlerFactory(ws, ctx));
    });

    return router.routes();
};
