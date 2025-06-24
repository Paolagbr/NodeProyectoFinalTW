require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL,
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const correoRoutes = require('./routes/rutas');
app.use('/api', correoRoutes);

app.get("/api/cita-qr/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const citasRef = db.collection("citas");
    const snapshot = await citasRef.where("email", "==", email).orderBy("fechaCreacion", "desc").limit(1).get();

    if (snapshot.empty) {
      return res.status(404).json({
        error: "No se encontraron citas para este usuario",
      });
    }

    const citaData = snapshot.docs[0].data();
    const citaId = snapshot.docs[0].id;

    const timestamp = Date.now();
    const codigoDinamico = `SPA-${citaId.substring(0, 8)}-${timestamp}`;

    const qrData = {
      codigoConfirmacion: codigoDinamico,
      citaId: citaId,
      cliente: citaData.nombre || "Cliente",
      email: citaData.email,
      servicio: citaData.servicio || "Servicio SPA",
      fecha: citaData.fecha || new Date().toISOString().split("T")[0],
      hora: citaData.hora || "10:00",
      estado: citaData.estado || "confirmada",
      generadoEn: new Date().toISOString(),
      validoHasta: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    await db.collection("citas").doc(citaId).update({
      ultimoCodigoQR: codigoDinamico,
      ultimaGeneracionQR: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      success: true,
      data: qrData,
    });
  } catch (error) {
    console.error("Error al obtener datos de cita:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message,
    });
  }
});

app.post("/api/verificar-qr", async (req, res) => {
  try {
    const { codigoConfirmacion } = req.body;

    const citasRef = db.collection("citas");
    const snapshot = await citasRef.where("ultimoCodigoQR", "==", codigoConfirmacion).get();

    if (snapshot.empty) {
      return res.status(404).json({
        valid: false,
        message: "Código QR no válido o expirado",
      });
    }

    const citaData = snapshot.docs[0].data();

    res.json({
      valid: true,
      message: "Código QR válido",
      cita: {
        cliente: citaData.nombre,
        servicio: citaData.servicio,
        fecha: citaData.fecha,
        hora: citaData.hora,
      },
    });
  } catch (error) {
    console.error("Error al verificar QR:", error);
    res.status(500).json({
      valid: false,
      message: "Error al verificar código",
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "API funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Prueba la API en: http://localhost:${PORT}/api/test`);
});