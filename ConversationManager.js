const { send, _dialog, _message } = require("./util.js");

class ConversationManager {
    constructor() {
        this.listeners = [];
        this.conversations = {};
        this.agents = [];
    };

    initConversation(participants, guestName) {
        const conversationId = participants.reduce((acc, curr) => acc + "-" + curr, "");
        const agentAccountId = participants[0];
        const guestAccountId = participants[1];

        if (this.conversations.hasOwnProperty('conversationId')) {
            console.warn("conversation already exists!");
            return this.conversations[conversationId];
        }

        const conversation = {
            conversationId,
            participants,
            messages: [],
            agent: { accountId: agentAccountId, name: "Agent Smith" },
            guest: { accountId: guestAccountId, name: guestName },
            lastMessage: null,
            status: "ACTIVE",
            channel: "OCTOPUS",
        };

        this.conversations[conversationId] = conversation;

        this.agents.forEach(agent => {
            if (agent.ws.readyState === 1) {
                send(agent.ws, _message(conversation.conversationId, { type: "CONVERSATION", ...conversation }));

                this.addListener(agentAccountId, conversationId, (conversation, message) => {
                    send(agent.ws, _message(conversation.conversationId, message));
                });
            }
        });

        return conversation;
    }

    setAgentHandler(accountId, ws) {
        const isExists = this.agents.filter(agent => agent === accountId).length;

        if (!isExists) {
            this.agents.push({ accountId, ws });
        }
    }

    setConversationStatus(conversationId, status) {
        if (!["ACTIVE", "PASSIVE"].includes(status)) {
            throw new Error("Not allowed status! " + status);    
        }
        
        const conversation = this.conversations[conversationId];
        conversation.status = status;

        this.$notifyListeners(conversation, { type: "CONVERSATION", ...conversation });
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

    message(type, conversationId, senderAccountId, content) {
        if (!this.conversations.hasOwnProperty(conversationId)) {
            console.warn("conversation not found!");
            return;
        }
        
        const message = {
            type,
            content,
            sender: { accountId: senderAccountId },
            sentOn: Date.now(),
        };

        const conversation = this.conversations[conversationId];
        conversation.messages.push(message);

        this.$notifyListeners(conversation, message);

        return conversation;
    }

    addListener(accountId, conversationId, callback) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function!");
        }

        this.listeners.push({ accountId, conversationId, callback });
    }

    removeListener(accountId, conversationId) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function!");
        }

        this.listeners = this.listeners
            .filter(it => it.accountId !== accountId && it.conversationId === conversationId);
    }

    removeListeners(accountId) {
        this.listeners = this.listeners.filter(it => it.accountId !== accountId);
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

    findConversationsByAccountId(accountId) {
        const list = [];
        for(const conversationId in this.conversations) {
            const conversation = this.conversations[conversationId];
            if (conversation.participants.filter(it => it === accountId).length) {
                list.push(conversation);
            }
        }
        return list;
    }

    $notifyListeners(conversation, payload) {
        this.listeners
            .filter(({ conversationId }) => conversation.conversationId === conversationId)
            .forEach(({ callback }) => callback(conversation, payload));
    }
}

module.exports = (function singletonConversationManager() {
    return new ConversationManager();
})();
