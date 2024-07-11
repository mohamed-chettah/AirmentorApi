import { Schema, model, Types, Document } from 'mongoose';
import { IUser } from './user';
import { IAnnouncement } from './announcement';

export interface IMessage extends Document {
    user: IUser;
    content: string;
    timestamp?: Date; // Change timestamp to string type
}

const MessageSchema = new Schema<IMessage>({
    user: { type: Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Message = model<IMessage>('message', MessageSchema);
