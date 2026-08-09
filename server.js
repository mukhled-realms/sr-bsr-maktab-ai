require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// JSON استقبال البيانات
app.use(express.json({ limit: '10kb' }));

// السماح بالاتصال
app.use(cors({
    origin: process.env.CLIENT_ORIGIN || '*'
}));

// حماية الإفراط (Rate Limiting)
const apilimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 10, 
    message: { error: 'عذراً، تجاوزت عدد المحاولات المسموحة، يرجى الانتظار دقيقة.' }
});

app.use('/api/', apilimiter);

// **تفعيل عرض ملفات الموقع الواجهة ولوحة التحكم من مجلد public**
app.use(express.static(path.join(__dirname, 'public')));

// مسار استقبال الطلبات من الواجهة
app.post('/api/submit-request', async (req, res) => {
    const { name, phone, service, pdplAgreed } = req.body;

    if (!pdplAgreed) {
        return res.status(400).json({ error: 'يجب الموافقة على سياسة الخصوصية.' });
    }

    console.log(`[طلب جديد] - الاسم: ${name} | الخدمة: ${service} | الجوال: ${phone}`);
    
    return res.json({ success: true, message: 'تم تجهيز الطلب بنجاح' });
});

app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل بنجاح على المنفذ ${PORT}`);
});
