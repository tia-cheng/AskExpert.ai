import React, { useState } from 'react';

function App() {
    const [query, setQuery] = useState('');
    const [experts, setExperts] = useState([]);

    const handleVoiceInput = () => {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            setQuery(speechResult);
            searchExperts(); // Automatically search after voice input
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
        };
    };

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const searchExperts = async () => {
        const response = await fetch('/find-expert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
        });
        const data = await response.json();
        setExperts(data);
        speak(`Found ${data.length} experts for your query.`);
    };

    return (
        <div>
            <h1>AskExpert.ai</h1>
            <button onClick={handleVoiceInput}>🎤 Speak</button>
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your query"
            />
            <button onClick={searchExperts}>Search</button>
            <ul>
                {experts.map((expert, index) => (
                    <li key={index}>
                        {expert.name} - {expert.specialty}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App; 