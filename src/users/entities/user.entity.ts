import { Message } from "src/messages/entities/message.entity";
import { Room } from "src/room/entities/room.entity";
import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column()
    userName: string;

    @Column()
    password: string;

    @OneToMany(() => Message, (fromMessage) => fromMessage.fromUser)
    fromMessage: Message[];

    @OneToMany(() => Message, (toMessage) => toMessage.toUser)
    toMessage: Message[];

    @OneToMany(() => Room, (roomCreated) => roomCreated.createBy)
    roomCreated: Room[];

    @ManyToMany(() => Room)
    @JoinTable()
    joinedRoom: Room[]
}
