const nodemailer = require('nodemailer');

const enviarCita = async (req, res) => {
  const datos = req.body;

  const config = {//Informacion del correo principal
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: 'ginaproyecto4@gmail.com',
      pass: 'nkvh rkhj qedm gbql'
    }
  };

  const mensaje = {//Informacion de la cita que se genero
    from: 'ginaproyecto4@gmail.com',
    to: datos.email || 'ginaproyecto4@gmail.com',
    subject: 'Nueva Cita Agendada',
    text: `Cita Agendada:
        Nombre: ${datos.name}
        Fecha: ${datos.fechaCita}
        Hora: ${datos.hora}
        Servicio: ${datos.grupo}
        Correo del cliente: ${datos.email}`
  };

  try {
    const transport = nodemailer.createTransport(config);
    const info = await transport.sendMail(mensaje);
    console.log('Correo enviado:', info.messageId);
    res.status(200).send({ success: true, message: 'Correo enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).send({ success: false, message: 'Error al enviar correo' });
  }
};

module.exports = { enviarCita };
