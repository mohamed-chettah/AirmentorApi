import { Hono } from 'hono'

import { isValidObjectId } from 'mongoose'
import { User } from '../models/user'
import { Skill } from '../models/skill'
import { Categorie } from '../models/categorie'

const categories = new Hono().basePath('/categories')

categories.get('/', async (c) => {
    const categorie = await Categorie.find({})
    return c.json(categorie)
})

categories.get('/:id', async (c) => {
    const _id = c.req.param('id')

    if (isValidObjectId(_id)) {
        const categorie = await Categorie.findOne({ _id })
        return c.json(categorie)
    }
    return c.json({ msg: 'ObjectId malformed' }, 400)
})

categories.post('/', async (c) => {
    const body = await c.req.json()
    try {
        const newCategorie = new Categorie(body)
        const saveCategorie = await newCategorie.save()
        return c.json(saveCategorie, 201)
    } catch (error: unknown) {
        return c.json(error._message, 400)
    }
})

// en put, on écrase toutes les valeurs (y compris les tableaux)
categories.put('/:id', async (c) => {
    const _id = c.req.param('id')
    const body = await c.req.json()
    // on attrape l'id de la creations (_id)
    // on a besoin du body pour les champs à mettre à jour
    // on peut préparer notre query pour findOneAndUpdate
    const q = {
        _id
    }
    const updateQuery = {
        ...body
    }
    // par défaut il va faire un $set

    const tryToUpdate = await Skill.findOneAndUpdate(q, updateQuery, { new: true })
    return c.json(tryToUpdate, 200)

})
// en patch, on va "append" les éléments passés dans le body
categories.patch('/:id', async (c) => {
    const _id = c.req.param('id')
    const body = await c.req.json()
    // on attrape l'id de la creations (_id)
    // on a besoin du body pour les champs à mettre à jour
    // on peut préparer notre query pour findOneAndUpdate
    const q = {
        _id
    }
    const { title, description } = body;

    const updateQuery = {
        $set: {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { categories }),
        }
    };
    const tryToUpdate = await Categorie.findOneAndUpdate(q, updateQuery, { new: true })
    return c.json(tryToUpdate, 200)

})

categories.delete('/:id', async (c) => {
    const _id = c.req.param('id')
    const tryToDelete = await Categorie.deleteOne({ _id })
    const { deletedCount } = tryToDelete
    if (deletedCount) {
        return c.json({ msg: "DELETE done" })
    }
    return c.json({ msg: "not found" }, 404)

})

export default categories
