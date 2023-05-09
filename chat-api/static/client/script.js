const sleep = (ms) => new Promise((res) => setTimeout(() => res(undefined), ms));

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
     * Recieve request to delete PRIVATE chat room
     */
    CLIENT_LEAVE_PRIVATE_ROOM: 'CHAT/CLIENT_LEAVE_PRIVATE_ROOM',
    /**
     * Recieve request to create new GROUP chat room
     */
    NEW_GROUP_ROOM_CREATE: 'CHAT/NEW_GROUP_ROOM_CREATE',
    /**
     * Recieve request to create new PRIVATE chat room
     */
    NEW_PRIVATE_ROOM_CREATE: 'CHAT/NEW_PRIVATE_ROOM_CREATE',
    /**
     * Recieve request to update chat room info
     */
    UPDATE_ROOM_ENTITY: 'CHAT/UPDATE_ROOM_ENTITY',
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

const ChatRoomType = {
    PRIVATE: 'PRIVATE',
    GROUP: 'GROUP',
};

class UrlHelper {
    tokenNames = Object.freeze({
        confirmEmail: 'confirmEmailToken',
        forgotPassword: 'forgotPasswordToken',
    });

    getUrlParameter(name) {
        return new URLSearchParams(window.location.search).get(name);
    }

    deleteUrlParameter(name) {
        try {
            const url = new URL(window.location);
            url.searchParams.delete(name);
            return history.replaceState(history.state, '', url.toString());
        } catch (error) {
            console.error(error);
        }
    }
}

const urlHelper = new UrlHelper();

class Fetcher {
    static AUTH_FILED_NAME = 'Authorization';
    static constructAuthHeaders = () => ({
        [Fetcher.AUTH_FILED_NAME]: `Bearer ${localStorage.getItem(Fetcher.AUTH_FILED_NAME)}`,
    });

    _send(url, method, body) {
        return fetch(url, {
            method,
            body: body ? JSON.stringify(body) : undefined,
            headers: {
                'Content-Type': 'application/json',
                ...Fetcher.constructAuthHeaders(),
            },
        })
            .then((response) => {
                if (response.headers.has(Fetcher.AUTH_FILED_NAME)) {
                    localStorage.setItem(
                        Fetcher.AUTH_FILED_NAME,
                        response.headers.get(Fetcher.AUTH_FILED_NAME).replace('Bearer ', ''),
                    );
                }
                return response;
            })
            .then((response) => {
                const contentType = response.headers.get('content-type');

                if (contentType?.toLowerCase().indexOf('application/json') !== -1) {
                    return response.json().then((data) => ({ status: response.status, data }));
                } else {
                    return response.text().then((data) => ({ status: response.status, data }));
                }
            })
            .then(({ status, data }) => {
                if (status < 200 || status >= 300) {
                    throw data;
                } else {
                    return data;
                }
            })
            .catch((error) => {
                console.error(`Error when fetching ${url}`, error);
                throw error;
            });
    }

    get(url) {
        return this._send(url, 'GET');
    }

    post(url, body) {
        return this._send(url, 'POST', body);
    }
}

const fetcher = new Fetcher();

const createApiUrl = (url) => `${window.location.protocol.replace(':', '')}://${window.location.host}/chat-api/${url}`;
const createSocketIOUrl = (url) => `${window.location.protocol.replace(':', '')}://${window.location.host}/${url}`;

Vue.use(Buefy);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var app = new Vue({
    el: '#v-app',
    data: {
        user: {},
        text: '',

        isPrivateRoom: false,
        newRoomName: '',
        newRoomDescription: '',
        newRoomUsers: [],

        messages: {},
        activeMessages: [],
        rooms: [],
        activeRoomId: 0,
        socket: { chat: null },

        isLoginModalOpened: false,
        isRegisterModalOpened: false,
        isNewRoomModalOpened: false,
        username: '',
        password: '',
        email: '',
        name: '',

        searchString: '',
        searchResultData: [],
        autocompleteOptions: [],
    },
    methods: {
        getChatContainer() {
            return document.querySelector('section.chat');
        },
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
            this.rooms = this.rooms.map((room) =>
                room.id === message.chatRoomEntityId ? Object.assign(room, { lastMessage: message }) : room,
            );
            this.messages[message.chatRoomEntityId].push(message);
            // ? sleep because new message element not inserted in dom yet
            sleep(500).then(() => {
                this.getChatContainer().scrollTo(0, this.getChatContainer().scrollHeight);
            });
        },
        handleRoomChange(roomId) {
            this.activeRoomId = roomId;
            this.activeMessages = this.messages[this.activeRoomId] ?? [];
        },
        createNewGroupRoom() {
            if (this.newRoomName && this.newRoomDescription && this.newRoomUsers?.length) {
                this.socket.chat.emit(TO_SERVER_EVENTS.NEW_GROUP_ROOM_CREATE, {
                    members: Array.from(new Set([...this.newRoomUsers.map(({ id }) => id), this.user.id])),
                    name: this.newRoomName,
                    description: this.newRoomDescription,
                });
                this.newRoomName = '';
                this.newRoomDescription = '';
                this.closeNewRoomModal();
            } else {
                this.handleErrorAlert('Validation Error');
            }
        },
        createNewPrivateRoom() {
            if (this.newRoomName && this.newRoomDescription && this.newRoomUsers?.length) {
                this.socket.chat.emit(TO_SERVER_EVENTS.NEW_PRIVATE_ROOM_CREATE, {
                    secondMemberId: this.newRoomUsers[0].id,
                    name: this.newRoomName,
                    description: this.newRoomDescription,
                });
                this.newRoomName = '';
                this.newRoomDescription = '';
                this.closeNewRoomModal();
            } else {
                this.handleErrorAlert('Validation Error');
            }
        },
        createNewRoom() {
            if (this.isPrivateRoom) {
                return this.createNewPrivateRoom();
            }
            return this.createNewGroupRoom();
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
        leaveRoom(room) {
            this.$buefy.dialog.confirm({
                message: 'Continue on this task?',
                onConfirm: () => {
                    const event =
                        room.type === ChatRoomType.PRIVATE
                            ? TO_SERVER_EVENTS.CLIENT_LEAVE_PRIVATE_ROOM
                            : TO_SERVER_EVENTS.CLIENT_LEAVE_GROUP_ROOM;

                    this.socket.chat.emit(event, {
                        roomId: room.id,
                        userId: this.user.id,
                    });

                    this.$buefy.toast.open(`You have leaved room ${room.name || room.id}`);
                },
            });
        },
        openNewRoomModal() {
            this.isNewRoomModalOpened = true;
        },
        closeNewRoomModal() {
            this.isNewRoomModalOpened = false;
        },
        // ? Auth
        openLogin() {
            this.isLoginModalOpened = true;
        },
        closeLogin() {
            this.isLoginModalOpened = false;
        },
        openRegister() {
            this.isRegisterModalOpened = true;
        },
        closeRegister() {
            this.isRegisterModalOpened = false;
        },
        fetchUser(username, password) {
            return fetcher
                .post(createApiUrl('auth/login'), {
                    username,
                    password,
                })
                .catch(console.error);
        },
        async loginAndInit() {
            this.user = await fetcher
                .post(createApiUrl('auth/login'), {
                    username: this.username,
                    password: this.password,
                })
                .catch(console.error);

            this.rooms = await fetcher.get(createApiUrl('chat/self-rooms'));

            this.activeRoomId = this.rooms[0]?.id;

            this.closeLogin();

            this.initSockets();
        },
        async registerAndInit() {
            this.user = await fetcher
                .post(createApiUrl('auth/register'), {
                    username: this.username,
                    password: this.password,
                    name: this.name,
                    email: this.email,
                })
                .catch(console.error);

            this.rooms = await fetcher.get(createApiUrl('chat/self-rooms'));

            this.activeRoomId = this.rooms[0]?.id;

            this.closeRegister();

            this.initSockets();
        },
        logout() {
            this.messages = {};
            this.activeMessages = [];
            this.rooms = [];
            this.activeRoomId = 0;
            this.user = {};
            localStorage.removeItem(Fetcher.AUTH_FILED_NAME);
            return fetcher.post(createApiUrl('auth/logout'));
        },
        // ? Confirm Email
        async confirmEmail(token) {
            try {
                this.user = await fetcher.post(createApiUrl('email/confirm'), { token });
                this.displayInfoDialog('Done', 'Your email was confirmed!');
            } catch (error) {
                this.displayErrorDialog('Error', `Confirmation went wrong <p>${error.message}</p>`);
            }
        },
        resendConfirmation() {
            if (this.user.isEmailConfirmed) {
                return this.displayErrorDialog('Error', `Email <b>${this.user.email}</b> already confirmed`);
            }
            return fetcher
                .post(createApiUrl('email/resend-confirmation'))
                .then(() => {
                    this.displayInfoDialog('Email sent', `We have sent you an email to <b>${this.user.email}</b>`);
                })
                .catch((error) => this.displayErrorDialog('Error', `Email sent went wrong: ${error.message}`));
        },
        // ? Forgot Password
        forgotPassword() {
            this.$buefy.dialog.prompt({
                message: `Enter Your email`,
                inputAttrs: {
                    placeholder: 'email@email.com',
                    type: 'email',
                },
                trapFocus: true,
                onConfirm: (email) =>
                    fetcher
                        .post(createApiUrl('email/forgot-password'), { email })
                        .then(() =>
                            this.displayInfoDialog('Email sent', `We have sent you an email to <b>${email}</b>`),
                        )
                        .catch((error) => this.displayErrorDialog('Error', `Email sent went wrong: ${error.message}`)),
            });
        },
        changePasswordByToken(token) {
            try {
                this.$buefy.dialog.prompt({
                    message: `Enter Your new password`,
                    inputAttrs: {
                        placeholder: 'New password',
                        type: 'password',
                        minLenght: 3,
                    },
                    trapFocus: true,
                    onConfirm: (newPassword) =>
                        fetcher
                            .post(createApiUrl('email/change-password'), { token, newPassword })
                            .then(() =>
                                this.displayInfoDialog(
                                    'Password changed',
                                    `Your password was changed. Now you can login`,
                                ),
                            )
                            .catch((error) =>
                                this.displayErrorDialog('Error', `Password change went wrong <p>${error.message}</p>`),
                            ),
                });
            } catch (error) {
                this.displayErrorDialog('Error', `Password change went wrong <p>${error.message}</p>`);
            }
        },
        // ? Alerts
        displayErrorDialog(title, message) {
            return this.$buefy.dialog.alert({
                title,
                message,
                type: 'is-danger',
                hasIcon: true,
                icon: 'times-circle',
                iconPack: 'fa',
                ariaRole: 'alertdialog',
                ariaModal: true,
            });
        },
        displayInfoDialog(title, message) {
            return this.$buefy.dialog.alert({
                title,
                message,
                type: 'is-info',
                ariaModal: true,
            });
        },
        // ? Notifications
        handleInfoAlert(message) {
            this.$buefy.toast.open({
                duration: 5000,
                message,
                type: 'is-link',
                pauseOnHover: true,
            });
        },
        handleErrorAlert(message) {
            this.$buefy.toast.open({
                duration: 5000,
                message,
                type: 'is-danger',
                pauseOnHover: true,
            });
        },
        // ? Init sockets
        initSockets() {
            if (this.socket.chat) {
                this.socket.chat = null;
            }

            this.socket.chat = io(createSocketIOUrl('chat'), {
                extraHeaders: Fetcher.constructAuthHeaders(),
            });

            this.socket.chat.on(TO_CLIENT_EVENTS.CLIENT_CONNECTED, ({ rooms }) => {
                this.rooms = rooms.map((room) => Object.assign(room, { lastMessage: room.messages[0] }));
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
        getAutocompleteData: debounce(async function (searchString) {
            if (!searchString) {
                return;
            }

            try {
                const users = await fetcher.post(createApiUrl('search/users'), {
                    searchString,
                });

                this.searchResultData = users.filter(({ id }) => !this.newRoomUsers.some((user) => user.id === id));
                this.autocompleteOptions = this.searchResultData.map(({ username }) => username);
            } catch (error) {
                this.searchResultData = [];
                this.autocompleteOptions = [];
            }
        }, 500),
        onAutocompleteMemberSelect(option) {
            const newRoomUser = this.searchResultData.find(({ username }) => username === option);
            if (newRoomUser) {
                this.newRoomUsers.push(newRoomUser);
                this.searchString = '';
            }
        },
        removeMemberFromNewRoom(user) {
            this.newRoomUsers = this.newRoomUsers.filter(({ id }) => id !== user.id);
        },
    },
    computed: {
        activeRoom() {
            const room = this.rooms.find((room) => room.id === Number(this.activeRoomId)) || {};
            if (room.type === ChatRoomType.PRIVATE) {
                room.name = room.members.find(({ id }) => id !== this.user.id).username;
            }
            return room;
        },
    },
    watch: {
        async activeRoomId(activeRoomId) {
            if (activeRoomId) {
                const { id, messages } = await fetcher
                    .get(createApiUrl(`chat/room/${activeRoomId}`))
                    .catch(console.error);
                this.messages = Object.assign(this.messages, { [id]: messages });
                this.activeMessages = this.messages[this.activeRoomId] ?? [];
            }
        },
    },
    async created() {
        this.user = await fetcher.get(createApiUrl('users/self')).catch(this.openLogin);
        this.user ??= {};

        const confirmEmailToken = urlHelper.getUrlParameter(urlHelper.tokenNames.confirmEmail);

        if (confirmEmailToken && !this.user.isEmailConfirmed) {
            await this.confirmEmail(confirmEmailToken);
            urlHelper.deleteUrlParameter(urlHelper.tokenNames.confirmEmail);
        }

        const forgotPasswordToken = urlHelper.getUrlParameter(urlHelper.tokenNames.forgotPassword);

        if (forgotPasswordToken) {
            await this.changePasswordByToken(forgotPasswordToken);
            urlHelper.deleteUrlParameter(urlHelper.tokenNames.forgotPassword);
        }

        // ? sockets
        this.initSockets();
    },
});
