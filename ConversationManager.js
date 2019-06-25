class ConversationManager {
    constructor() {
        this.listeners = [];
        this.conversations = {};
    };

    initConversation(participants) {
        const conversationId = participants.reduce((acc, curr) => acc + curr, "");

        if (this.conversations.includes(conversationId)) {
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

    dialog(conversationId, sender, message) {
        if (!this.conversations.includes(conversationId)) {
            console.warn("conversation not found!");
            return;
        }

        const conversation = this.conversations[conversationId];

        conversation.messages.push({
            message,
            sentOn: new Date(),
            sentBy: sender,
        });

        this.$notifyListeners(conversation);

        return conversation;
    }

    addListener(conversationId, callback) {
        if (typeof callback !== "function") {
            throw new Error("Callback must be a function!");
        }

        this.listeners.push({ conversationId, callback });
    }

    $notifyListeners(conversation) {
        this.listeners
            .filter(({ conversationId }) => conversation.conversationId === conversationId)
            .forEach(({ callback }) => callback(conversation));
    }
}

module.exports = (function singletonConversationManager() {
    return new ConversationManager();
})();
