require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// السماح باستقبال البيانات بصيغة JSON
app.use(express.json({ limit: '10kb' }));

// 1. تفعيل CORS (السماح لموقعك فقط بالاتصال بالسيرفر)
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*' // في الإنتاج ضع رابط موقعك فقط
}));

// 2. حماية من الإغراق (Rate Limiting) - 5 طلبات فقط بالدقيقة لكل مستخدم
const apiLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // دقيقة واحدة
    max: 5,
    message: { error: 'عذراً، تجاوزت عدد المحاولات المسموحة. يرجى الانتظار دقيقة.' }
});

app.use('/api/', apiLimiter);

// 3. مسار استقبال الطلبات من الواجهة
app.post('/api/submit-request', async (req, res) => {
    const { name, phone, service, pdplAgreed } = req.body;

    // التحقق من موافقة العميل
    if (!pdplAgreed) {
        return res.status(400).json({ error: 'يجب الموافقة على سياسة الخصوصية.' });
    }

    // هنا مستقبلاً (في المرحلة القادمة) سنربط هذا الجزء بـ Google Sheets ولوحة تحكم السوداني
    console.log(`[طلب جديد] - الخدمة: ${service} | العميل: ${name} | الجوال: ${phone}`);

    // إرسال رد بنجاح العملية
    return res.json({ success: true, message: 'تم تجهيز الطلب بنجاح' });
});

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ ${PORT}`);
});
