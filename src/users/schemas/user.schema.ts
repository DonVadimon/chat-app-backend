import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type UserDocument = User & Document;

export enum Roles {
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}

@Schema()
export class User {
    _id: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true, type: [SchemaTypes.String], enum: Roles, default: [Roles.EMPLOYEE] })
    roles: Roles[];

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    git: string;

    @Prop({ required: true })
    telegram: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
