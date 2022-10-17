const TO_SERVER_EVENTS = {
    SEND_MESSAGE_TO_SERVER: 'CHAT/SEND_MESSAGE_TO_SERVER',
    CLIENT_JOIN_ROOM: 'CHAT/CLIENT_JOIN_ROOM',
    CLIENT_LEAVE_ROOM: 'CHAT/CLIENT_LEAVE_ROOM',
    NEW_ROOM_CREATE: 'CHAT/NEW_ROOM_CREATE',
};

const TO_CLIENT_EVENTS = {
    SEND_MESSAGE_TO_CLIENT: 'CHAT/SEND_MESSAGE_TO_CLIENT',
    CLIENT_JOINED_ROOM: 'CHAT/CLIENT_JOINED_ROOM',
    CLIENT_LEAVED_ROOM: 'CHAT/CLIENT_LEAVED_ROOM',
    NEW_ROOM_CREATED: 'CHAT/NEW_ROOM_CREATED',
};

const ChatRoomType = {
    PRIVATE: 'PRIVATE',
    GROUP: 'GROUP',
};

Vue.component('alerts-component', VueSimpleNotify.VueSimpleNotify);
var app = new Vue({
    el: '#v-app',
    data: {
        user: {},
        text: '',

        newRoomName: '',
        newRoomDescription: '',
        newRoomUsers: [1, 2],
        newRoomType: ChatRoomType.PRIVATE,

        messages: {},
        activeMessages: [],
        rooms: [],
        activeRoomId: 0,
        socket: { chat: null },
        alerts: [],
    },
    methods: {
        sendChatMessage() {
            if (this.text) {
                this.socket.chat.emit(TO_SERVER_EVENTS.SEND_MESSAGE_TO_SERVER, {
                    content: this.text,
                    roomId: Number(this.activeRoomId),
                });
                this.text = '';
            } else {
                this.handleErrorAlert('Empty message');
            }
        },
        receiveChatMessage(message) {
            this.messages[message.chatRoomEntityId] ??= [];
            this.messages[message.chatRoomEntityId].push(message);
        },
        handleRoomChange(roomId) {
            this.activeRoomId = roomId;
            this.activeMessages = this.messages[this.activeRoomId] ?? [];
        },
        createNewRoom() {
            if (this.newRoomName && this.newRoomDescription) {
                this.socket.chat.emit(TO_SERVER_EVENTS.NEW_ROOM_CREATE, {
                    type: this.newRoomType,
                    members: this.newRoomUsers,
                    name: this.newRoomName,
                    description: this.newRoomDescription,
                });
                this.newRoomName = '';
                this.newRoomDescription = '';
            } else {
                this.handleErrorAlert('Validation Error');
            }
        },
        addOrUpdateRoom(room) {
            const existingRoomIndex = this.rooms.findIndex(({ id }) => id === room.id);
            if (existingRoomIndex >= 0) {
                this.rooms[existingRoomIndex] = room;
            } else {
                this.handleInfoAlert(`You have joined room "${room.name ?? room.id}"`);
                this.rooms.push(room);
            }
        },
        handleAlertDismiss(index) {
            this.alerts.splice(index, 1);
        },
        handleInfoAlert(message) {
            this.alerts.push({
                type: 'Info',
                color: '#2ecc71',
                dismissable: true,
                message,
            });
        },
        handleErrorAlert(message) {
            this.alerts.push({
                message,
            });
        },
    },
    computed: {
        activeRoom() {
            return this.rooms.find((room) => room.id === Number(this.activeRoomId));
        },
    },
    watch: {
        async activeRoomId(activeRoomId) {
            const { id, messages } = await fetch(`http://localhost:3003/chat/room/${activeRoomId}`).then((data) =>
                data.json(),
            );
            this.messages = Object.assign(this.messages, { [id]: messages });
            this.activeMessages = this.messages[this.activeRoomId] ?? [];
        },
    },
    async created() {
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

        // ? sockets
        this.socket.chat = io('http://localhost:3003/chat');

        this.socket.chat.on(TO_CLIENT_EVENTS.SEND_MESSAGE_TO_CLIENT, (msg) => {
            this.receiveChatMessage(msg);
        });

        this.socket.chat.on(TO_CLIENT_EVENTS.CLIENT_JOINED_ROOM, (room) => {
            this.addOrUpdateRoom(room);
        });

        this.socket.chat.on(TO_CLIENT_EVENTS.CLIENT_LEAVED_ROOM, (room) => {
            this.rooms = this.rooms.filter(({ id }) => id !== room.id);
            this.activeRoomId = this.rooms[0]?.id;
        });

        this.socket.chat.on(TO_CLIENT_EVENTS.NEW_ROOM_CREATED, (room) => {
            this.addOrUpdateRoom(room);
            this.activeRoomId = room.id;
        });

        this.socket.chat.on('exception', (error) => {
            console.error(error);
            this.handleErrorAlert(JSON.stringify(error));
        });
    },
});
