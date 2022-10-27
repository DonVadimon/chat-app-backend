import { WsException } from '@nestjs/websockets';

export class PrivateRoomAlreadyExistWsException extends WsException {
    constructor(message = '') {
        super('Private room with this members already exist ' + message);
    }
}
