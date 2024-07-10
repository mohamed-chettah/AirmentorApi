import { Hono } from 'hono'

import { Types, isValidObjectId } from 'mongoose'
import { Message } from '../models/message'
const messages = new Hono().basePath('/messages')

// ce sont les routes de l'api qui seront utilisées pour le chat-live entre un user et le createur d'une annonce

//route pour recuperer les messages entre un user(idUser) et le createur d'une annonce(idAnnonce)
messages.get('/getByIdUserAndIdAnnouncement/:idUser/:idAnnouncement', async (c) => {
    try {
        const idUser = c.req.param('idUser');
        const idAnnouncement = c.req.param('idAnnouncement');

        console.log('Fetching messages for User ID:', idUser, 'and Announcement ID:', idAnnouncement);

        const messages = await Message.find({ user: idUser, announcement: idAnnouncement }).populate('user').populate('announcement').populate('announcement.createdBy');

        return c.json( messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({ error: 'Failed to fetch messages' }, 500);
    }
});

export default messages
