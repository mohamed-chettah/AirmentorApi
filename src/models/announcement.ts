import { Schema, model, Types } from 'mongoose';

interface IAnnouncement{
   title: string,
   description: string,
   picture: string,
   skills: string[],
   is_activate: boolean,
}

const AnnouncementSchema = new Schema<IAnnouncement>({
   title: {type: String, required: true},
   description: {type: String, required: true},
   picture: {type: String, required: true},
   skills: {type: [String], required: true},
   is_activate: {type: Boolean, required: true} 
});

const Announcement = model<IAnnouncement>('announcement', AnnouncementSchema);
export { Announcement, IAnnouncement }
