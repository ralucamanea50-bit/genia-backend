const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        status: 'online',
        message: 'GenIA™ Backend Server - Running ✓',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, system } = req.body;
        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
        
        if (!CLAUDE_API_KEY) {
            return res.status(500).json({
                error: 'Server configuration error',
                message: 'Claude API key not configured on server'
            });
        }

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'Messages array is required'
            });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                system: system || 'You are a helpful assistant.',
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Claude API Error:', errorData);
            return res.status(response.status).json({
                error: 'Claude API error',
                message: 'Failed to get response from Claude',
                details: errorData
            });
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GenIA™ Backend Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/`);
    console.log(`📍 Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`✅ CORS enabled for all origins`);
    console.log(`🔑 API Key configured: ${process.env.CLAUDE_API_KEY ? 'YES ✓' : 'NO ✗'}`);
});
