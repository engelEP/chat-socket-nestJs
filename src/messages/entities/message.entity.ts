import { Room } from "src/room/entities/room.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Message {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column()
    isPrivateMessage: boolean;

    @ManyToOne(() => User, (user) => user.fromMessage, {
        eager: true,
    })
    fromUser: User

    @ManyToOne(() => User, (user) => user.toMessage, {
        eager: true,
    })
    toUser: User

    @ManyToOne(() => Room, (room) => room.messageRoom, {
        eager: true,
    })
    room: Room
}
