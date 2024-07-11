import {Hono} from 'hono'
import {Conversation} from "../models/conversation";

const conversations = new Hono().basePath('/conversations')

// ce sont les routes de l'api qui seront utilisées pour le chat-live entre un user et le createur d'une annonce

//route pour recuperer les messages entre un user(idUser) et le createur d'une annonce(idAnnonce)
conversations.get('/:idUser/:idCreator/:idAnnouncement', async (c) => {
    try {
        const idUser = c.req.param('idUser');
        const idAnnouncement = c.req.param('idAnnouncement');
        const idCreator = c.req.param('idCreator');
        console.log('Fetching messages for User ID:', idUser, 'and Announcement ID:', idAnnouncement, 'and Creator ID:', idCreator);
        const conversation = await Conversation.findOne({
            idUser: idUser,
            idAnnouncement: idAnnouncement,
            idCreator: idCreator
        }).populate({
            path: 'messages',
            populate: {path: 'user', select: 'name'}
        });

        if (!conversation) {
            return c.json({error: 'Conversation not found'}, 404);
        }

        console.log('Found conversation:', c.json(conversation));
        return c.json(conversation.messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({error: 'Failed to fetch messages'}, 500);
    }
});

conversations.get(':idAnnouncement', async (c) => {
    try {
        const idAnnouncement = c.req.param('idAnnouncement');
        console.log('Fetching messages for Announcement ID:', idAnnouncement);
        const conversation = await Conversation.find({
            idAnnouncement: idAnnouncement,
        }).populate({
            path: 'messages',
            populate: {path: 'user', select: 'name'}
        }).populate('idUser').populate('idAnnouncement');

        console.log('Found conversation:', c.json(conversation));
        if (!conversation) {
            return c.json({error: 'Conversation not found'}, 404);
        }
        return c.json(conversation);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return c.json({error: 'Failed to fetch messages'}, 500);
    }
});

export default conversations


