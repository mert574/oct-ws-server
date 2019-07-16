function send(ws, data) {
    if (ws.readyState !== 1)
        return;
 
    if (typeof data === "object") {
        data = JSON.stringify(data);
    }

    ws.send(data);
}

function _message(conversationId, message) {
    return {
        conversationId,
        ...message,
    };
}

function _dialog(conversation, newMessage) {
    return {
        type: "DIALOG",
        conversationId: conversation.conversationId,
        content: newMessage.content,
        sender: newMessage.sender,
    };
}

module.exports = {
    send,
    _dialog,
    _message,
};
