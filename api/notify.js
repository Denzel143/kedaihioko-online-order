const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    })
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const { nama, total } = req.body;
    
    const payload = {
      notification: {
        title: 'Pesanan Baru Masuk!',
        body: `Ada pesanan dari ${nama || 'Pelanggan'} sejumlah Rp${parseInt(total || 0).toLocaleString('id-ID')}`,
        sound: 'default'
      },
      topic: 'admin_kedai_hioko'
    };

    try {
      await admin.messaging().send(payload);
      res.status(200).json({ success: true, message: 'Notifikasi FCM Terkirim' });
    } catch (error) {
      console.error("FCM Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
