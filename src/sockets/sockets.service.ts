import { Injectable } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';

interface Client {
  id: number,
  name: string,
  lastName: string,
  email: string,
  socketId: string
}

@Injectable()
export class SocketsService {
    private clients: Record<number, Client> = {};

  onClientConnected( user: User, socketId: string ) {
    this.clients[ user.id ] = {
      id: user.id,
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      socketId
    };
  }

  onClientDisconnected( id: number ) {
    delete this.clients[id];
  }
  
  getClients() {
    return Object.values( this.clients );
  }
}
