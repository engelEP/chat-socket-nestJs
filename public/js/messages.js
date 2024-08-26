const divChat = document.querySelector('#chat');
const iconGeneral = document.querySelector('#chatIcon');
const userName = document.querySelector('#userName');

export const renderMessage = (payload) => {
    const { message, id, name, isPrivateMessage } = payload;

    const divMessage = document.createElement('div');
    const nameUser = document.createElement('span');

    divMessage.innerHTML = message;
    divMessage.classList.add('message');
    
    nameUser.className = 'd-inline-block font-italic w-100 p-3';
    nameUser.innerHTML = isPrivateMessage ? `${name} 📲` : `${name} 🌎`;
    
    if( parseInt(userName.getAttribute('data-user-id')) !== id) {
        divMessage.classList.add('incoming');
        nameUser.classList.add('text-right');
    }

    divChat.appendChild(nameUser);
    divChat.appendChild(divMessage);

    divChat.scrollTo({ top: divChat.scrollHeight });
}

export const filterMessage = ({ isPrivateMessage, messages, roomId = null }) => {
    if(roomId) {
        messages
        .filter((msg) => msg.room && msg.room.id === roomId)
        .forEach(({ fromUser, ...rest }) => {
            renderMessage({
                id: fromUser.id,
                message: rest.message,
                isPrivateMessage: rest.isPrivateMessage,
                name: `${fromUser.name} ${fromUser.lastName}`
            });
    
        });
    } else {
        messages
        .filter((msg) => msg.isPrivateMessage === isPrivateMessage && msg.room === null)
        .forEach(({ fromUser, ...rest }) => {
    
            renderMessage({
                id: fromUser.id,
                message: rest.message,
                isPrivateMessage: rest.isPrivateMessage,
                name: `${fromUser.name} ${fromUser.lastName}`
            });
    
        });
    }
}

export const onPrivateMessage = (payload) => {
    const { name, lastName, socketId, email } = payload;
    route.innerHTML = `${name} ${lastName}`;

    iconGeneral.classList.remove('global');
    iconGeneral.classList.add('user');

    formChat.dataset.socket = socketId;
    formChat.dataset.socketEmail = email;
}