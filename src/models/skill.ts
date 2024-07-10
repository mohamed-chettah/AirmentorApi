import { Schema, model, Types } from 'mongoose';
import { ICategorie } from './categorie';

interface ISkill {
    title: string;
    categories: ICategorie;
}

const SkillSchema = new Schema<ISkill>({
    title: { type: String, required: true },
    categories: { type: Types.ObjectId, ref: 'categorie' },
});

const Skill = model<ISkill>('skill', SkillSchema);
export { Skill, ISkill }
