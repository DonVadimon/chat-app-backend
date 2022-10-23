const TO_SERVER_EVENTS = {
    /**
     * Receive new chat message data
     */
    SEND_MESSAGE_TO_SERVER: 'CHAT/SEND_MESSAGE_TO_SERVER',
    /**
     * Recieve request to add new member to GROUP chat room
     */
    CLIENT_JOIN_GROUP_ROOM: 'CHAT/CLIENT_JOIN_GROUP_ROOM',
    /**
     * Recieve request to exclude member from GROUP chat room
     */
    CLIENT_LEAVE_GROUP_ROOM: 'CHAT/CLIENT_LEAVE_GROUP_ROOM',
    /**
     * Recieve request to create new GROUP chat room
     */
    NEW_GROUP_ROOM_CREATE: 'CHAT/NEW_GROUP_ROOM_CREATE',
    /**
     * Recieve request to create new PRIVATE chat room
     */
    NEW_PRIVATE_ROOM_CREATE: 'CHAT/NEW_PRIVATE_ROOM_CREATE',
};

const TO_CLIENT_EVENTS = {
    /**
     * Send initial data to connected client
     */
    CLIENT_CONNECTED: 'CHAT/CLIENT_CONNECTED',
    /**
     * Send new chat message in room
     */
    SEND_MESSAGE_TO_CLIENT: 'CHAT/SEND_MESSAGE_TO_CLIENT',
    /**
     * Send room data that user joined and that was already configured
     */
    CLIENT_JOINED_ROOM: 'CHAT/CLIENT_JOINED_ROOM',
    /**
     * Send notification that user was excluded from chat room
     */
    CLIENT_LEAVED_ROOM: 'CHAT/CLIENT_LEAVED_ROOM',
    /**
     * Send GROUP chat room where member was excluded from
     */
    MEMBER_EXCLUDED_FROM_GROUP_ROOM: 'CHAT/MEMBER_EXCLUDED_FROM_GROUP_ROOM',
    /**
     * Send GROUP chat room where new member was added to
     */
    NEW_MEMBER_ADDED_TO_GROUP_ROOM: 'CHAT/NEW_MEMBER_ADDED_TO_GROUP_ROOM',
    /**
     * Send cew chat room
     */
    NEW_ROOM_CREATED: 'CHAT/NEW_ROOM_CREATED',
};

// const ChatRoomType = {
//     PRIVATE: 'PRIVATE',
//     GROUP: 'GROUP',
// };

const createApiUrl = (url) => `${window.location.protocol.replace(':', '')}://${window.location.host}/${url}`;

Vue.component('alerts-component', VueSimpleNotify.VueSimpleNotify);
var app = new Vue({
    el: '#v-app',
    data: {
        user: {},
        text: '',

        newRoomName: '',
        newRoomDescription: '',
        newRoomUsers: [1, 2],

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
                this.socket.chat.emit(TO_SERVER_EVENTS.NEW_GROUP_ROOM_CREATE, {
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
            const { id, messages } = await fetch(createApiUrl(`chat/room/${activeRoomId}`))
                .then((data) => data.json())
                .catch(console.error);
            this.messages = Object.assign(this.messages, { [id]: messages });
            this.activeMessages = this.messages[this.activeRoomId] ?? [];
        },
    },
    async created() {
        const username = prompt('admin or regular');

        this.user = await fetch(createApiUrl('auth/login'), {
            method: 'POST',
            body: JSON.stringify({
                username,
                password: username === 'admin' ? 'admin' : 'regular',
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((data) => data.json())
            .catch(console.error);

        // ? sockets
        this.socket.chat = io('/chat');

        this.socket.chat.on(TO_CLIENT_EVENTS.CLIENT_CONNECTED, ({ rooms }) => {
            this.rooms = rooms;
            this.activeRoomId = this.rooms[0]?.id;
        });

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
