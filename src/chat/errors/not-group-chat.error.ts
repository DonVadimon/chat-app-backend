export class NotGroupChatError extends Error {
    constructor(message = '') {
        super('ChatRoomType should be ChatRoomType.GROUP ' + message);
    }
}
