import { Module } from '@nestjs/common';
import { SocketsService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { MessagesModule } from 'src/messages/messages.module';
import { MessagesService } from 'src/messages/messages.service';
import { RoomModule } from 'src/room/room.module';
import { RoomService } from 'src/room/room.service';

@Module({
  imports: [
    UsersModule,
    MessagesModule,
    RoomModule
  ],
  providers: [
    SocketsGateway,
    SocketsService,
    UsersService,
    MessagesService,
    RoomService
  ],
})
export class SocketsModule {}
