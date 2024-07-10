// Message {
//   idUser: string;
//   idAnnouncement: string;
//   sender: string;
//   receiver: string;
//   content: string;
//   timestamp?: string; // Change timestamp to string type
// }


import { Schema, model, Types } from 'mongoose';
import {IUser} from "./user";
import {IAnnouncement} from "./announcement";

interface IMessage {
    user: IUser;
    announcement: IAnnouncement;
    sender: string;
    content: string;
    timestamp?: string; // Change timestamp to string type
}

const MessageSchema = new Schema<IMessage>({
    user: { type: Types.ObjectId, ref: 'user', required: true },
    announcement: { type: Types.ObjectId, ref: 'announcement', required: true },
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Message = model<IMessage>('message', MessageSchema);


