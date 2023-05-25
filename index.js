const express = require('express');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const app = express();

app.use(express.json());

// Get all stories
app.get('/stories', async (req, res) => {
    try {
        const snapshot = await db.collection('stories').get();
        const stories = snapshot.docs.map(doc => doc.data());
        res.json(stories);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stories' });
    }
});

// Get a specific story
app.get('/stories/:id', async (req, res) => {
    try {
        const snapshot = await db.collection('stories').doc(req.params.id).get();
        if (!snapshot.exists) {
            res.status(404).json({ error: 'Story not found' });
        } else {
            res.json(snapshot.data());
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get the story' });
    }
});

// Create a new story
app.post('/stories', async (req, res) => {
    try {
        const storyData = req.body;
        const docRef = await db.collection('stories').add(storyData);
        const story = await docRef.get();
        res.status(201).json(story.data());
    } catch (error) {
        res.status(500).json({ error: 'Failed to create the story' });
    }
});

// Update a story
app.put('/stories/:id', async (req, res) => {
    try {
        const storyData = req.body;
        await db.collection('stories').doc(req.params.id).update(storyData);
        const updatedStory = await db.collection('stories').doc(req.params.id).get();
        res.json(updatedStory.data());
    } catch (error) {
        res.status(500).json({ error: 'Failed to update the story' });
    }
});

// Delete a story
app.delete('/stories/:id', async (req, res) => {
    try {
        await db.collection('stories').doc(req.params.id).delete();
        res.sendStatus(204);
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete the story' });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});
