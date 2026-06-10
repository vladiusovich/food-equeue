import {
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    ManyToOne,
    UpdateDateColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm";
import { Customer } from "./customer.entity";
import { Product } from "./product.entity";
import { Branch } from "./branch.entity";
import { StatusType } from "../types/status.type";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Customer, (customer) => customer.orders, { nullable: true })
    customer?: Customer | null;

    @Column()
    status: StatusType;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column({ nullable: true })
    readyAt?: Date;

    @Column({ nullable: true })
    deliveredAt?: Date;

    @Column({ nullable: true })
    hash?: string;

    @ManyToMany(() => Product, { cascade: true })
    @JoinTable()
    products: Product[];

    @ManyToOne(() => Branch, { cascade: false })
    @JoinTable()
    branch: Branch;
}
