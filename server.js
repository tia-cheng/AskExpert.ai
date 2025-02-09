require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { getExperts } = require('./scraper'); // Import your scraper function
const mongoose = require('mongoose');
const OpenAI = require('openai');

const app = express();
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/expertsDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const expertSchema = new mongoose.Schema({
    name: String,
    specialty: String,
    contact: String
});

const Expert = mongoose.model('Expert', expertSchema);

// Modify your scraper to save data to MongoDB
async function saveExpertsToDB(experts) {
    await Expert.insertMany(experts);
    console.log('Experts saved to database');
}

// Updated OpenAI configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

app.post('/find-expert', async (req, res) => {
    try {
        const { query } = req.body;
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant that finds experts." },
                { role: "user", content: `Find experts related to: ${query}` }
            ],
        });

        const experts = parseExpertsFromResponse(completion.choices[0].message.content);
        await saveExpertsToDB(experts);
        res.json(experts);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process request' });
    }
});

function parseExpertsFromResponse(responseText) {
    // Simple parsing logic - you might want to make this more sophisticated
    return [{
        name: "Sample Expert",
        specialty: "Based on: " + responseText,
        contact: "sample@email.com"
    }];
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 