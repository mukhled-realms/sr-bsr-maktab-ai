const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ضع مفتاح Gemini هنا
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; 
const OWNER_PHONE = '966577619578';
const OFFICE_NAME = 'مكتب السرعة للخدمات الرقمية';

app.post('/api/analyze', async (req, res) => {
    const { userMessage, userName = 'عميل' } = req.body;
    if (!userMessage) return res.status(400).json({ error: 'الرجاء كتابة طلبك' });

    try {
        const prompt = `أنت مساعد ذكي في "${OFFICE_NAME}". العميل: ${userName}. الطلب: "${userMessage}". حلل الطلب واكتب: الخدمة، السعر، المستندات.`;
        const geminiResponse = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
            { contents: [{ parts: [{ text: prompt }] }] }
        );
        const analysis = geminiResponse.data.candidates[0].content.parts[0].text;
        const whatsappMessage = `🔔 طلب جديد\nالعميل: ${userName}\nالطلب: ${userMessage}\n\nالتحليل:\n${analysis}`;
        const whatsappLink = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;
        res.json({ success: true, analysis, whatsappLink });
    } catch (error) {
        res.status(500).json({ success: false, error: 'حدث خطأ' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 يعمل على المنفذ ${PORT}`));
