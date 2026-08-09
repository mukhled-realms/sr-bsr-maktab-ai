const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// تشغيل واجهة الموقع من مجلد public
app.use(express.static('public'));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY';
const OWNER_PHONE = '966577619578';
const OFFICE_NAME = 'مكتب السرعة للخدمات الرقمية';

// قائمة الخدمات المتاحة
let services = [
  { id: 1, name: 'تجديد/استخراج الإقامة', active: true },
  { id: 2, name: 'نقل كفالة / تغيير مهنة (قوى)', active: true },
  { id: 3, name: 'رخص البلديات والأنشطة (بلدي)', active: true },
  { id: 4, name: 'تأشيرات وجوازات (مقيم/أبشر)', active: true }
];

// تحليل الطلب عبر الذكاء الاصطناعي
app.post('/api/analyze', async (req, res) => {
  const { userMessage, userName = 'عميل' } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'الرجاء كتابة طلبك' });

  try {
    const activeServices = services.filter(s => s.active).map(s => s.name).join('، ');
    const prompt = `أنت مساعد ذكي في "${OFFICE_NAME}". الخدمات المتاحة حالياً: [${activeServices}]. 
العميل: "${userName}". الطلب: "${userMessage}". 
حلل الطلب واذكر الخدمة والمستندات المطلوبة بوضوح وجزئية التواصل عبر الواتساب.`;

    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] }
    );

    const analysis = geminiResponse.data.candidates[0].content.parts[0].text;
    const whatsappMessage = `🔔 طلب جديد\nالعميل: ${userName}\nالطلب: ${userMessage}\n\nالتحليل:\n${analysis}`;
    const whatsappLink = `https://wa.me/${OWNER_PHONE}?text=${encodeURIComponent(whatsappMessage)}`;

    res.json({ success: true, analysis, whatsappLink });
  } catch (error) {
    res.status(500).json({ success: false, error: 'حدث خطأ في النظام' });
  }
});

// روابط لوحة الإدارة
app.get('/api/admin/services', (req, res) => res.json({ success: true, services }));

app.post('/api/admin/services', (req, res) => {
  const { name } = req.body;
  if (name) services.push({ id: Date.now(), name, active: true });
  res.json({ success: true, services });
});

app.patch('/api/admin/services/:id', (req, res) => {
  const { id } = req.params;
  const { active } = req.body;
  const service = services.find(s => s.id == id);
  if (service) service.active = active;
  res.json({ success: true, services });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 يعمل على المنفذ ${PORT}`));
