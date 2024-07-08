import { Hono } from 'hono'

import { isValidObjectId } from 'mongoose'
import { Announcement } from '../models/announcement'

const api = new Hono().basePath('/announcements')

api.get('/', async (c) => {
    const announcement = await Announcement.find({})
    return c.json(announcement)
})

api.get('/:id', async (c) => {
    const _id = c.req.param('id')

    if (isValidObjectId(_id)) {
        const announcement = await Announcement.findOne({ _id })
        return c.json(announcement)
    }
    return c.json({ msg: 'ObjectId malformed' }, 400)
})

api.post('/', async (c) => {
    const body = await c.req.json()
    try {
        const newAnnouncement = new Announcement(body)
        const saveAnnouncement = await newAnnouncement.save()
        return c.json(saveAnnouncement, 201)
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

    const tryToUpdate = await Announcement.findOneAndUpdate(q, updateQuery, { new: true })
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
    const tryToUpdate = await Announcement.findOneAndUpdate(q, updateQuery, { new: true })
    return c.json(tryToUpdate, 200)

})

api.delete('/:id', async (c) => {
    const _id = c.req.param('id')
    const tryToDelete = await Announcement.deleteOne({ _id })
    const { deletedCount } = tryToDelete
    if (deletedCount) {
        return c.json({ msg: "DELETE done" })
    }
    return c.json({ msg: "not found" }, 404)

})

export default api
