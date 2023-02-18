import { WsException } from '@nestjs/websockets';

export class NotPermittedWsException extends WsException {
    constructor() {
        super('Not permitted for action');
    }
}
