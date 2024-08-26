import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { SocketsService } from './sockets.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Message } from 'src/messages/entities/message.entity';
import { Room } from 'src/room/entities/room.entity';

@Injectable()
@WebSocketGateway()
export class SocketsGateway implements OnModuleInit {
  constructor(
    private readonly socketsService: SocketsService,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,

    @InjectRepository(Room)
    private roomsRepository: Repository<Room>,
  ) {}

  @WebSocketServer()
  public server: Server;

  onModuleInit() {
    this.server.on('connection', async (socket: Socket) => {
      const { email } = socket.handshake.auth;
      const rooms = await this.roomsRepository.find();

      const user = await this.usersRepository.findOne({ 
        where: { email },
        relations: { 
          joinedRoom: true
        }
      });

      if(!user) {
        socket.disconnect();
        return;
      }

      user.joinedRoom.forEach((room) => socket.join(room.name));

      const messages = await this.messagesRepository.find();
      this.socketsService.onClientConnected(user, socket.id);

      this.server.emit('on-changed-server', Object.values(this.socketsService.getClients()));

      socket.on('disconnect', () => {
        this.socketsService.onClientDisconnected(user.id);
        this.server.emit('on-changed-server', Object.values(this.socketsService.getClients()));
      });


      socket.emit('on-connect', messages, user);
    });
  }

  @SubscribeMessage('subscribe-message')
  async getAllMessage() {
    const allMessage = await this.messagesRepository.find();

    this.server.emit('subscribe-message', allMessage)
  }

  @SubscribeMessage('public-message')
  async handleMessage(
    @MessageBody() { message, roomId },
    @ConnectedSocket() client: Socket,
  ) {
    const { newMessage, room } = await this.sendMessage(client, message, '', false, roomId);

    if(roomId) {

      client.to(room.name).emit('public-message', newMessage);

    } else {

      this.server.emit('public-message', newMessage);

    }

  }

  @SubscribeMessage('private-message')
  async handlePrivateMessage(
    @MessageBody() { message, toSocket, toEmail },
    @ConnectedSocket() socket: Socket,
  ) {
    const { newMessage } = await this.sendMessage(socket, message, toEmail, true);

    socket.to(toSocket).emit('private-message', newMessage);
  }

  @SubscribeMessage('create-room')
  async createRoom(
    @MessageBody() name: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const { email } = socket.handshake.auth;
    
    const room = await this.roomsRepository.findOneBy({ name });
    const user = await this.usersRepository.findOneBy({ email });

    if(!name || !room || !user)
      return;

    const createRoom = await this.roomsRepository.create({ name, createBy: user });
    const newRoom =  await this.roomsRepository.save(createRoom);

    socket.emit('create-room', newRoom.name, user.id);
  }

  @SubscribeMessage('join-room')
  async joinRoom(
    @MessageBody() name: string,
    @ConnectedSocket() socket: Socket,
  ) {
    const { email } = socket.handshake.auth;

    const room = await this.roomsRepository.findOneBy({ name });
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: {
        joinedRoom: true
      }
     });

    if(!name || !room || !user)
      return;
    
    const rooms = user.joinedRoom ? [ ...user.joinedRoom, room ] : [room];

    const updateRoom = this.usersRepository.create({
      ...user,
      joinedRoom: rooms
    });

    await this.usersRepository.save(updateRoom);

    socket.join(room.name);
    socket.emit('join-room', rooms)
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(
    @MessageBody() id: number,
    @ConnectedSocket() socket: Socket,
  ) {
    const { email } = socket.handshake.auth;

    const room = await this.roomsRepository.findOneBy({ id });
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: {
        joinedRoom: true
      }
     });

    if(!id || !room || !user)
      return;
    
    const rooms = user.joinedRoom.filter(room => room.id !== id);

    const deleteRoom = this.usersRepository.create({
      ...user,
      joinedRoom: rooms
    });

    await this.usersRepository.save(deleteRoom);

    socket.leave(room.name);

    socket.emit('leave-room', rooms);
  }

  async sendMessage(
    socket: Socket,
    message: string,
    toEmail: string = '',
    isPrivateMessage: boolean = false,
    roomId: number = 0
  ) {
    const { email } = socket.handshake.auth;
    const user = await this.usersRepository.findOneBy({ email });

    let room = null;
    if(roomId)
      room = await this.roomsRepository.findOneBy({ id: roomId });

    let toUser = null;
    if(toEmail)
      toUser = await this.usersRepository.findOneBy({ email: toEmail });

    if (!message)
      return;

    const createMessage = this.messagesRepository.create({
      message,
      isPrivateMessage: isPrivateMessage,
      fromUser: user,
      toUser,
      room
    });
    
    await this.messagesRepository.save(createMessage);

    const newMessage = {
      id: createMessage.fromUser.id,
      userId: createMessage.fromUser,
      message: createMessage.message,
      name: `${createMessage.fromUser.name} ${createMessage.fromUser.lastName}`,
      isPrivateMessage: createMessage.isPrivateMessage,
    }

    return { newMessage, room }
  }
}
