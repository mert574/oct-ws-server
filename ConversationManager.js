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

class ConversationManager {
    constructor() {
        this.listeners = [];
        this.conversations = {};
        this.agents = [];
    };

    initConversation(participants, guestName) {
        const conversationId = participants.reduce((acc, curr) => acc + "-" + curr, "");

        if (this.conversations.hasOwnProperty('conversationId')) {
            console.warn("conversation already exists!");
            return this.conversations[conversationId];
        }

        const conversation = {
            conversationId,
            participants,
            messages: [],
            agent: { accountId: participants[0], name: participants[0] },
            guest: { accountId: participants[1], name: guestName },
            lastMessage: null,
            status: "ACTIVE",
        };

        this.conversations[conversationId] = conversation;

        const agentHandler = this.agents.filter(agent => agent.accountId === participants[0])[0];

        if (agentHandler && agentHandler.ws.readyState === 1) {
            agentHandler.ws.send(JSON.stringify({ type: "CONVERSATION", ...conversation }));

            this.addListener(conversationId, (conversation, newMessage) => {
                const msg = _dialog(conversation, newMessage);
                agentHandler.ws.send(msg);
            });
        }

        return conversation;
    }

    setAgentHandler(accountId, ws) {
        const isExists = this.agents.filter(agent => agent === accountId).length;

        if (!isExists) {
            this.agents.push({ accountId, ws });
        }
    }

    removeAgentHandler(accountId) {
        let index = -1;

        this.agents.forEach((agent, i) => {
            if (agent.accountId === accountId) {
                index = i;
            };
        })

        if (index > -1) {
            this.agents.splice(index, 1);
        }
    }

    dialog(conversationId, senderAccountId, content) {
        if (!this.conversations.hasOwnProperty(conversationId)) {
            console.warn("conversation not found!");
            return;
        }

        const conversation = this.conversations[conversationId];

        const newMessage = {
            content,
            sender: {
                accountId: senderAccountId,
            },
            sentOn: new Date(),
        };

        conversation.messages.push(newMessage);

        this.$notifyListeners(conversation, newMessage);

        return conversation;
    }

    addListener(conversationId, callback) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function!");
        }

        this.listeners.push({ conversationId, callback });
    }

    findConversationByAccountId(accountId) {
        for(const conversationId in this.conversations) {
            const conversation = this.conversations[conversationId];
            if (conversation.participants.filter(it => it === accountId).length) {
                return conversation;
            }
        }
        return {};
    }

    findAgentConversationsByAccountId(accountId) {
        const list = [];
        for(const conversationId in this.conversations) {
            const conversation = this.conversations[conversationId];
            if (conversation.participants.filter(it => it === accountId).length) {
                list.push(conversation);
            }
        }
        return list;
    }

    $notifyListeners(conversation, newMessage) {
        this.listeners
            .filter(({ conversationId }) => conversation.conversationId === conversationId)
            .forEach(({ callback }) => callback(conversation, newMessage));
    }
}

module.exports = (function singletonConversationManager() {
    return new ConversationManager();
})();
