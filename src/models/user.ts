import { Schema, model, Types } from 'mongoose';

enum ENUMRole {
    ADMIN = "Admin",
    MENTOR = "Mentor",
    USER = "User",
}

interface IUser {
    name: string;
    email: string;
    phoneNumber: string;
    place: string
    password: string;
    profile_picture: string;
    grade: number;
    credits: number;
    description: string;
    languages: string[];
    googleId: string;
    role: ENUMRole;
}

const UserSchema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    place: { type: String, required: true },
    password: { type: String, required: true },
    profile_picture: { type: String, required: true },
    grade: { type: Number, required: true },
    credits: { type: Number, required: true },
    description: { type: String, required: true },
    languages: { type: [String], required: true },
    googleId: {type: String, required: true},
    role: { type: String, enum: Object.values(ENUMRole), required: false }, // Définir l'enum pour le schéma

    }
);
    

const User = model<IUser>('user', UserSchema);
export { User, IUser }
