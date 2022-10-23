export class PrivateRoomAlreadyExistError extends Error {
    constructor(message = '') {
        super('Private room with this members already exist ' + message);
    }
}
