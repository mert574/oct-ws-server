class ConversationManager {
    constructor() {
        this.listeners = [];
        this.conversations = {};
    };

    initConversation(participants) {
        const conversationId = participants.reduce((acc, curr) => acc + "-" + curr, "");

        if (this.conversations.hasOwnProperty('conversationId')) {
            console.warn("conversation already exists!");
            return this.conversations[conversationId];
        }

        const conversation = {
            conversationId,
            participants,
            messages: [],
            lastMessage: null,
        };

        this.conversations[conversationId] = conversation;
        return conversation;
    }

    dialog(conversationId, sender, text) {
        if (!this.conversations.hasOwnProperty(conversationId)) {
            console.warn("conversation not found!");
            return;
        }

        const conversation = this.conversations[conversationId];
        const newMessage = {
            text,
            sender,
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

    $notifyListeners(conversation, newMessage) {
        this.listeners
            .filter(({ conversationId }) => conversation.conversationId === conversationId)
            .forEach(({ callback }) => callback(conversation, newMessage));
    }
}

module.exports = (function singletonConversationManager() {
    return new ConversationManager();
})();
