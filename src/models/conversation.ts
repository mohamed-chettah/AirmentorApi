import { Schema, model, Types, Document } from 'mongoose';

interface IConversation extends Document {
    idUser: Types.ObjectId[];
    idCreator: Types.ObjectId[];
    idAnnouncement: Types.ObjectId[];
    messages: Types.ObjectId[];
}

const ConversationSchema = new Schema<IConversation>({
    idUser: [{ type: Types.ObjectId, ref: 'user', required: true }],
    idCreator: [{ type: Types.ObjectId, ref: 'user', required: true }],
    idAnnouncement: [{ type: Types.ObjectId, ref: 'announcement', required: true }],
    messages: [{ type: Types.ObjectId, ref: 'message' }]
});

export const Conversation = model<IConversation>('conversation', ConversationSchema);
