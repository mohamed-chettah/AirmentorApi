import { model, Schema, Types } from "mongoose";
import { IUser } from "./user";

interface IAnnouncement {
  title: string;
  description: string;
  picture: string;
  skills: Types.ObjectId[];
  is_activate: boolean;
  createdBy: IUser;
  registeredUsers: Types.ObjectId[];
}

const AnnouncementSchema = new Schema<IAnnouncement>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: String, required: true },
  skills: [{ type: Types.ObjectId, ref: "skill" }],
  is_activate: { type: Boolean, required: true },
  createdBy: { type: Types.ObjectId, ref: "user" },
  registeredUsers: [{ type: Types.ObjectId, ref: "user" }],
});

const Announcement = model<IAnnouncement>("announcement", AnnouncementSchema);
export { Announcement, IAnnouncement };
