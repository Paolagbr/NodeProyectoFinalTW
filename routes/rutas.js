const express = require('express');
const router = express.Router();
const { enviarCita } = require('../controllers/controller');

router.post('/enviar-cita', enviarCita);

module.exports = router;
