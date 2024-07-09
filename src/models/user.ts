import { model, Schema } from "mongoose";
import { ENUMRole } from "../enum/role";

interface IUser {
  name: string;
  email: string;
  phoneNumber: string;
  place: string;
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
  phoneNumber: { type: String, required: false },
  place: { type: String, required: false },
  password: { type: String, required: false },
  profile_picture: { type: String, required: true },
  grade: { type: Number, required: false },
  credits: { type: Number, required: false },
  description: { type: String, required: false },
  languages: { type: [String], required: false },
  googleId: { type: String, required: true },
  role: { type: String, enum: Object.values(ENUMRole), required: false }, // Définir l'enum pour le schéma
});

const User = model<IUser>("user", UserSchema);
export { IUser, User };
