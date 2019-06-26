const Conversations = require('./ConversationManager.js');


module.exports = function(router) {

    function _d(data) {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        return data;
    }

    function _conversation(conversation, newMessage) {
        const sender = conversation.participants.filter(it => it === newMessage.sender.id)[0];

        return _d({
            type: "DIALOG",
            conversationId: conversation.conversationId,
            content: {
                text: newMessage.text,
            },
            sender,
        });
    }

    const messageActions = {
        "DIALOG": ({ conversationId, message }, ws, ctx) => {
            const conversation = Conversations.dialog(conversationId, ctx.params.accountId, message);
        }
    };

    function messageHandlerFactory(ws, ctx) {
        return (message) => {
            try {
                const { type, payload } = JSON.parse(message);
                messageActions[type](payload, ws, ctx);
            } catch(e) {
                console.warn("Couldn't act to the message!", message, e);
            }
        };
    };

    router.get("/conversation/:accountId", ({ websocket: ws, ...ctx }) => {
        const conversation = Conversations.findConversationByAccountId(ctx.params.accountId);
        
        console.log("new connection!", conversation);

        Conversations.addListener(conversation.conversationId, (conversation, newMessage) => {
            const msg = _conversation(conversation, newMessage);
            console.log("final", msg);
            ws.send(msg);
        });

        ws.send(_d(conversation));

        ws.on('message', messageHandlerFactory(ws, ctx));
    });

    return router.routes();
};

/*
module.exports = function(ctx) {

    const messageActions = {
        "CONVERSATION": ({ me, other }) => {
            const conversation = Conversations.initConversation([me, other]);
            console.log("CONV:START", conversation);
            send(conversation.participants, conversation);
        },
        "DIALOG": ({ conversationId, message }, { socketId }) => {
            const conversation = Conversations.dialog(conversationId, socketId, message);
            console.log("CONV:DIALOG", conversation);
            send(conversation.participants, conversation);
        }
    };

    function broadcast(data) {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        ws.clients.forEach((client) => {
            if (client.readyState === 1) {
              client.send(data);
            }
        });
    };

    function send(recipients, data) {
        if (typeof data === "object") {
            data = JSON.stringify(data);
        }

        ws.clients.forEach(client => {
           if (recipients.includes(client.socketId)) {
               client.send(data);
           }
        });
    }

    function messageHandlerFactory(connection) {
        return (message) => {
            try {
                const { type, payload } = JSON.parse(message);
                messageActions[type](payload, connection);
            } catch(e) {
                console.warn("Couldn't act to the message!", message, e);
            }
        };
    };

    let counter = 0;

    console.log("ctx", ctx);

    return function(conn) {

        console.log("inside handler!", conn)
        conn.socketId = (++counter).toString();
        conn.on('message', messageHandlerFactory(conn));
        conn.send('welcome onboard');
        broadcast({newUser: conn.socketId});
    }
};
*/
