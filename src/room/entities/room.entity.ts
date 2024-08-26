import { Message } from "src/messages/entities/message.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToOne(() => User, (user) => user, {
        eager: true,
    })
    createBy: User
    
    @OneToMany(() => Message, (message) => message.room)
    messageRoom: Message[];
}