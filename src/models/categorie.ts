import { Schema, model, Types } from 'mongoose';

interface ICategorie {
    title: string;
    description: string;
}

const CategorieSchema = new Schema<ICategorie>({
    title: { type: String, required: true },
    description: { type: String, required: true },

});

const Categorie = model<ICategorie>('categorie', CategorieSchema);
export { Categorie, ICategorie }
