import { filterMessage, renderMessage, onPrivateMessage } from './messages.js';
import { renderRoom } from './room.js';

const email = localStorage.getItem('email');
const statusOn = document.querySelector('#status-online');
const statusOff = document.querySelector('#status-offline');
const userList = document.querySelector('#userList');
const route = document.querySelector('#route');
const formChat = document.querySelector('#formChat');
const inputChat = document.querySelector('#inputChat');
const divChat = document.querySelector('#chat');
const buttonGeneral = document.querySelector('#buttonGeneral');
const iconGeneral = document.querySelector('#chatIcon');
const userName = document.querySelector('#userName');
const btnCreateRoom = document.querySelector('#btnCreate');
const btnJoinRoom = document.querySelector('#btnJoin');
const inputRoom = document.querySelector('#inputRoom');
const listRoom = document.querySelector('#listRoom');


let listMessages = [];

route.innerHTML = 'Global';

const socket = io({
    auth: {
        email
    },
});

// Event Listeners

listRoom.addEventListener('change', ({ target }) => {
    const { value } = target;
    socket.emit('subscribe-message');
    parseInt(value) ? buttonGeneral.disabled = false : buttonGeneral.disabled = true;

    formChat.dataset.roomId = value ? value : 0;
    route.innerHTML = target.children[value].text;

    filterMessage({ isPrivateMessage: false, messages: listMessages, roomId: parseInt(value) })

})

btnCreateRoom.addEventListener('click', () => {
    const name = inputRoom.value;
    inputRoom.value = '';

    socket.emit('create-room', name);
    socket.on('create-room', (nameRoom, userId) => {

        if(parseInt(userName.getAttribute('data-user-id')) === userId)
            socket.emit('join-room', nameRoom);
    });
});

btnJoinRoom.addEventListener('click', () => {
    const name = inputRoom.value;
    inputRoom.value = '';

    socket.emit('join-room', name);
    socket.on('join-room', (rooms) => {
        renderRoom(rooms);
    });
});

buttonGeneral.addEventListener('click', () => {
    const roomId = parseInt(formChat.getAttribute('data-room-id'));
    socket.emit('leave-room', roomId);

    socket.on('leave-room', (rooms) => {
        renderRoom(rooms)
    });

});

formChat.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = inputChat.value;
    const roomId = formChat.getAttribute('data-room-id') ? parseInt(formChat.getAttribute('data-room-id')) : 0;
    inputChat.value = '';

    const sendMessage = { //render message local display
        id: parseInt(userName.getAttribute('data-user-id')),
        message,
        userId: socket.id,
        name: userName.innerHTML,
        isPrivateMessage: true
    }
    
    if (formChat.getAttribute('data-socket') && formChat.getAttribute('data-socket-email')) {
        socket.emit("private-message", {
          message,
          toSocket: formChat.getAttribute('data-socket'),
          toEmail: formChat.getAttribute('data-socket-email')
        });

        renderMessage(sendMessage);
    } else {
        socket.emit('public-message', { message, roomId });

        if(roomId) 
            renderMessage(sendMessage);
    }
});

// Event sockets

socket.on('connect', () => {
    statusOn.classList.remove('hidden');
    statusOff.classList.add('hidden');
})

socket.on('disconnect', () => {
    statusOff.classList.remove('hidden');
    statusOn.classList.add('hidden');
})

socket.on('public-message', (payload) => {
    renderMessage(payload);
});

socket.on('private-message', (payload) => {
    renderMessage(payload);
});

socket.on('on-connect', (messages, user) => {
    divChat.innerHTML = '';
    userName.dataset.userId = user.id;
    userName.innerHTML = `${user.name} ${user.lastName}`;
    listMessages = messages;

    renderRoom(user.joinedRoom);

    filterMessage({ isPrivateMessage: false, messages: listMessages });
});

socket.on('subscribe-message', (messages) => listMessages = messages);

socket.on('on-changed-server', (users) => {
    userList.innerHTML = '';
    users
    .filter(user => user.socketId !== socket.id)
    .map((user) => {
        const  text =  document.createElement('span');
        const button = document.createElement('button');
        const item = document.createElement('li');

        button.className = 'btn btn-primary';
        button.textContent = 'Send';
        button.addEventListener('click', () => {

            socket.emit('subscribe-message');
            
            const privateMessageSend = listMessages
                .filter((message) => (
                    message.toUser && message.toUser.id === user.id &&
                    message.fromUser.id === parseInt(userName.getAttribute('data-user-id'))
                ));

            const privateMessageReceived = listMessages
                .filter((message) => (
                    message.toUser && message.toUser.id === parseInt(userName.getAttribute('data-user-id')) &&
                    message.fromUser.id === user.id
                ));

            divChat.innerHTML = '';

            const allPrivateMessage =[ ...privateMessageSend, ...privateMessageReceived ].sort((a, b) => a.id - b.id);

            filterMessage({ isPrivateMessage: true, messages: allPrivateMessage });
            onPrivateMessage(user);
        });

        text.innerHTML = `${user.name} ${user.lastName}`;

        item.className = 'd-flex justify-content-between List-item'
        item.appendChild(text);
        item.appendChild(button);

        userList.append(item);
    });
});

