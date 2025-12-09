const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

let userMessageCount = 0;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({status:"online",version:"STRICT MODE"});
});

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        const API_KEY = process.env.CLAUDE_API_KEY;

        if (!API_KEY) return res.status(500).json({error:"API key missing"});

        // 🔥 LIMITĂ MAX 6 mesaje
        userMessageCount++;
        if (userMessageCount > 6) {
            return res.json({
                content:[{
                    text:`Limita conversației a fost atinsă 💜  
Pentru detalii suplimentare, contacteaz-o direct pe Raluca:  
📞 +49 15111050456`
                }]
            });
        }

        const response = await fetch("https://api.anthropic.com/v1/messages",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "x-api-key":API_KEY,
                "anthropic-version":"2023-06-01"
            },
            body:JSON.stringify({
                model:"claude-sonnet-4-20250514",
                max_tokens:400, // limitează răspunsurile
                system:`
Tu ești GenIA™ – asistent cognitiv creat de Raluca.
Ton cald, scurt, clar (max 1–3 fraze).

AI VOIE SĂ RĂSPUNZI **DOAR** dacă utilizatorul întreabă despre:
• cine este GenIA
• ce face GenIA
• cum se lucrează cu GenIA / Raluca
• informații despre AI Business, servicii, rolul tău

DACĂ întrebarea este despre altceva (probleme personale, soluții, tutoriale, rezolvări, explicații tehnice):
→ răspunzi politicos și direcționezi:

"Pot răspunde doar la întrebări despre GenIA și colaborarea cu Raluca 💜  
Pentru orice alt subiect, o poți contacta direct la telefon."

DACĂ utilizatorul cere contact → răspunzi DOAR:
📞 +49 15111050456

Fără email.  
Fără WhatsApp link.  
Fără LinkedIn.  
Fără explicații lungi.  
Nu depășești 3 fraze / răspuns.
                `,
                messages
            })
        });

        const data = await response.json();
        return res.json(data);

    } catch(e){
        return res.status(500).json({error:e.message});
    }
});

app.listen(PORT,()=>console.log("GenIA strict backend ON"));
