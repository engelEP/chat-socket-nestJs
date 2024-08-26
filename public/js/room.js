const listRoom = document.querySelector('#listRoom');


export const renderRoom = (rooms) => {
    listRoom.innerHTML = '';

    const list = [
        {
            id: 0,
            name: 'Global'
        },  
        ...rooms
    ]

    list.map((room) => {
        const opt = document.createElement('option');
        opt.value = room.id;
        opt.innerHTML = room.name;
        listRoom.appendChild(opt);
    });
}