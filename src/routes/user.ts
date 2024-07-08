import { Hono } from 'hono'

import { isValidObjectId } from 'mongoose'
import { User } from '../models/user'

const api = new Hono().basePath('/user')

api.get('/', async (c) => {
    const user = await User.find({})
    return c.json(user)
})

api.get('/:id', async (c) => {
    const _id = c.req.param('id')

    if (isValidObjectId(_id)) {
        const user = await User.findOne({ _id })
        return c.json(user)
    }
    return c.json({ msg: 'ObjectId malformed' }, 400)
})

api.post('/', async (c) => {
    const body = await c.req.json()
    try {
        const newUser = new User(body)
        const saveUser = await newUser.save()
        return c.json(saveUser, 201)
    } catch (error: unknown) {
        return c.json(error._message, 400)
    }
})

// en put, on écrase toutes les valeurs (y compris les tableaux)
api.put('/:id', async (c) => {
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

    const tryToUpdate = await User.findOneAndUpdate(q, updateQuery, { new: true })
    return c.json(tryToUpdate, 200)

})
// en patch, on va "append" les éléments passés dans le body
api.patch('/:id', async (c) => {
    const _id = c.req.param('id')
    const body = await c.req.json()
    // on attrape l'id de la creations (_id)
    // on a besoin du body pour les champs à mettre à jour
    // on peut préparer notre query pour findOneAndUpdate
    const q = {
        _id
    }
    const { categories, ...rest } = body

    const updateQuery = {
        $addToSet: {
            categories: categories
        },
        $set: { ...rest }
    }
    const tryToUpdate = await User.findOneAndUpdate(q, updateQuery, { new: true })
    return c.json(tryToUpdate, 200)

})

api.delete('/:id', async (c) => {
    const _id = c.req.param('id')
    const tryToDelete = await User.deleteOne({ _id })
    const { deletedCount } = tryToDelete
    if (deletedCount) {
        return c.json({ msg: "DELETE done" })
    }
    return c.json({ msg: "not found" }, 404)

})

export default api
