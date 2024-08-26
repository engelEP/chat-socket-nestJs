import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { Module } from '@nestjs/common';
import { SocketsModule } from './sockets/sockets.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MessagesModule } from './messages/messages.module';
import { RoomModule } from './room/room.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname,'..','public'),
    }),
    TypeOrmModule.forRoot({
      type: "mysql",
      host: "localhost",
      port: 3307,
      username: "root",
      password: "admin",
      database: "nestChats",
      autoLoadEntities: true,
      synchronize: true,
    }),
    SocketsModule,
    UsersModule,
    MessagesModule,
    RoomModule,
  ],
})
export class AppModule {}
