const admin = require('firebase-admin');

// Fungsi untuk menangani parsing Private Key agar format enter (\n) terbaca sempurna oleh Firebase
function getFormattedPrivateKey() {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!privateKey) return undefined;
  
  // Mengubah teks "\n" menjadi karakter enter asli
  return privateKey.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getFormattedPrivateKey(),
    }),
  });
}

module.exports = async (req, res) => {
  // Pengaturan Header CORS agar aman dipanggil dari web mana pun
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { nama, total } = req.body;

    const message = {
      notification: {
        title: 'Pesanan Baru Masuk!',
        body: `${nama} memesan dengan total Rp ${Number(total).toLocaleString('id-ID')}`,
      },
      topic: 'admin_kedai_hioko',
    };

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: error.message });
  }
};
