import { Schema, model, Types } from 'mongoose';
import { IUser } from './user';

interface IReview {
    grade: number;
    description: string;
    reviewer: IUser;
    reviewed: IUser;   
}

const ReviewSchema = new Schema<IReview>({
    grade: {type: Number, required: true},
    description: {type: String, required: true},
    reviewer: {type: Types.ObjectId, ref:'user'},
    reviewed: { type: Types.ObjectId, ref: 'user' },
});

const Review = model<IReview>('review', ReviewSchema);
export { Review, IReview }
