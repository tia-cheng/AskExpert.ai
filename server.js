const express = require('express');
const bodyParser = require('body-parser');
const { getExperts } = require('./scraper'); // Import your scraper function
const mongoose = require('mongoose');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/expertsDB', { useNewUrlParser: true, useUnifiedTopology: true });

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

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/find-expert', async (req, res) => {
    const { query } = req.body;
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: `Find experts related to: ${query}`,
        max_tokens: 150,
    });

    const experts = parseExpertsFromResponse(response.data.choices[0].text);
    await saveExpertsToDB(experts);
    res.json(experts);
});

function parseExpertsFromResponse(responseText) {
    // Implement logic to parse the response and match it with your database
    return [];
}

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 