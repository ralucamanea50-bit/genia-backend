const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

let userMessageCount = 0; // Contor întrebări per sesiune

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

        // 🔥 LIMITARE – după 5 mesaje trimite utilizatorul la WhatsApp
        userMessageCount++;
        if (userMessageCount > 5) {
            return res.json({
                content: [{
                    text: "Îmi face plăcere discuția cu tine 💜\nPentru mai multe detalii continuă direct cu Raluca pe WhatsApp:\n👉 https://wa.me/4915111050456?text=Salut%2C%20vreau%20detalii%20despre%20GenIA%20✨"
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

                // 🔥 Identitate & Reguli GenIA
                system: `
Tu ești GenIA™ – asistent cognitiv creat de Raluca Manea.
Răspunzi DOAR la întrebări despre:
• cine este GenIA
• ce face GenIA
• cum poate ajuta oamenii
• cum poate fi accesată / utilizată

Dacă utilizatorul întreabă altceva, răspunde politicos doar:
"Pot răspunde doar la întrebări despre GenIA și rolul ei. 💜"

Răspunsurile sunt scurte, calde, umane, max 4-6 rânduri.

După 5 întrebări, direcționezi spre WhatsApp:
"Îmi face plăcere discuția cu tine 💜 Dar de aici cel mai bine e să continui direct cu Raluca 👉 https://wa.me/4915111050456?text=Salut%2C%20vreau%20detalii%20despre%20GenIA%20✨"

Nu menționa că ești AI sau ChatGPT.
Tu ești GenIA™ – identitate umanizată, creată de Raluca Manea.
                `,
                messages: messages
            })
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        res.status(500).json({
            error: 'Internal Server Error',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 GenIA™ Backend Running on port ${PORT}`);
    console.log(`📍 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
