Vue.component('alerts-component', VueSimpleNotify.VueSimpleNotify);
var app = new Vue({
    el: '#v-app',
    data: {
        TO_SERVER_EVENTS: {
            SEND_MESSAGE_TO_SERVER: 'CHAT/SEND_MESSAGE_TO_SERVER',
            CLIENT_JOIN_ROOM: 'CHAT/CLIENT_JOIN_ROOM',
            CLIENT_LEAVE_ROOM: 'CHAT/CLIENT_LEAVE_ROOM',
        },
        TO_CLIENT_EVENTS: {
            SEND_MESSAGE_TO_CLIENT: 'CHAT/SEND_MESSAGE_TO_CLIENT',
            CLIENT_JOINED_ROOM: 'CHAT/CLIENT_JOINED_ROOM',
            CLIENT_LEAVED_ROOM: 'CHAT/CLIENT_LEAVED_ROOM',
        },
        user: {},
        text: '',
        messages: {
            1: [],
        },
        rooms: [],
        activeRoomId: '1',
        socket: { chat: null },
        alerts: [],
    },
    methods: {
        sendChatMessage() {
            if (this.text) {
                this.socket.chat.emit(this.TO_SERVER_EVENTS.SEND_MESSAGE_TO_SERVER, {
                    content: this.text,
                    roomId: Number(this.activeRoomId),
                    authorId: this.user.id,
                });
                this.text = '';
            } else {
                alert('Empty message');
            }
        },
        receiveChatMessage(message) {
            this.messages[message.chatRoomEntityId].push(message);
        },
    },
    computed: {
        isMemberOfActiveRoom() {
            return !!this.rooms.find((room) => room.id === Number(this.activeRoomId));
        },
        activeRoom() {
            return this.rooms.find((room) => room.id === Number(this.activeRoomId));
        },
    },
    async created() {
        this.socket.chat = io('http://localhost:3003/chat');

        const username = prompt('admin or regular');

        this.user = await fetch('http://localhost:3003/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username,
                password: username === 'admin' ? 'admin' : 'regular',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((data) => data.json());

        this.rooms = await fetch('http://localhost:3003/chat/self-rooms').then((data) => data.json());

        this.activeRoomId = this.rooms[0]?.id;

        const { id, messages } = await fetch(`http://localhost:3003/chat/room/${this.activeRoomId}`).then((data) =>
            data.json(),
        );
        this.messages[id] = messages;

        this.socket.chat.on(this.TO_CLIENT_EVENTS.SEND_MESSAGE_TO_CLIENT, (msg) => {
            console.log({ msg });
            this.receiveChatMessage(msg);
        });

        this.socket.chat.on(this.TO_CLIENT_EVENTS.CLIENT_JOINED_ROOM, (room) => {
            console.log({ room });
            this.rooms[room] = true;
        });

        this.socket.chat.on(this.TO_CLIENT_EVENTS.CLIENT_LEAVED_ROOM, (room) => {
            console.log({ room });
            this.rooms[room] = false;
        });

        this.socket.chat.emit(this.TO_SERVER_EVENTS.CLIENT_JOIN_ROOM, {
            userId: this.user.id,
            roomId: this.activeRoomId,
        });

        this.socket.chat.on('exception', (error) => {
            console.error(error);
            alert(JSON.stringify(error));
        });
    },
});
