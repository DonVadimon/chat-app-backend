import { WsException } from '@nestjs/websockets';

export class UnauthorizedWsException extends WsException {
    constructor() {
        super('Unauthorized');
    }
}
