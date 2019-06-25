const Conversations = require('./ConversationManager.js');

module.exports = function(ws) {

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

    return function(conn) {
        conn.socketId = (++counter).toString();
        conn.on('message', messageHandlerFactory(conn));
        conn.send('welcome onboard');
        broadcast({newUser: conn.socketId});
    }
};
