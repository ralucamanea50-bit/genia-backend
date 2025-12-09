const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔥 Contor mesaje utilizator
let userMessageCount = 0;

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
        const { messages } = req.body;
        const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

        if (!CLAUDE_API_KEY) {
            return res.status(500).json({
                error: 'Claude API key missing',
                message: 'Configure CLAUDE_API_KEY in server environment'
            });
        }

        // 🔥 Limită conversație 5 mesaje
        userMessageCount++;
        if (userMessageCount > 5) {
            return res.json({
                content: [{
                    text: "Îmi face plăcere conversația cu tine 💜\nGenIA poate răspunde la maxim 5 întrebări într-o sesiune.\nPentru detalii, colaborări sau discuție directă cu Raluca:\n📞 +49 15111050456\n🌐 https://ralucamanea.com/get-in-touch"
                }]
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

                // 🔥 Personalitate & Rol GenIA
                system: `
Tu ești GenIA™ – asistent cognitiv creat de Raluca Manea.

Răspunzi DOAR la întrebări despre:
• cine este GenIA
• ce face GenIA
• cum ajută oamenii
• cum poate fi accesată

Dacă întrebarea nu e despre GenIA, răspunzi prietenos:
"Pot răspunde doar la întrebări despre GenIA și rolul ei 💜"

Ton: cald, uman, scurt, clar (max 4-6 rânduri).
Nu menționa că ești AI, chatbot sau model lingvistic.
Ești GenIA™ — identitate umanizată creată de Raluca Manea.

După 5 întrebări → direcționezi către Raluca cu eleganță:
"Îmi face plăcere conversația 💜 Pentru mai mult, contacteaz-o direct pe Raluca."
                `,
                messages: messages
            })
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GenIA™ Backend Running on port ${PORT}`);
    console.log(`📍 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
