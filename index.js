const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Importar rutas
const correoRoutes = require('./routes/rutas');
app.use('/api', correoRoutes);  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});





// enviarMail =async ()=>{
//     const config ={
//         host:'smtp.gmail.com',
//         port:587,
//         auth:{
//             user:'ginaproyecto4@gmail.com',
//             pass: 'nkvh rkhj qedm gbql'
//         }
//     }
//     const mensaje={
//         form: 'ginaproyecto4@gmail.com',
//         to:'ginaproyecto4@gmail.com',
//         subject: 'Correo de pruebas',
//         text: 'Envio de correo desde node js utilizando nodemailer'
//     }
//      const trasnport=nodemailer.createTransport(config);
//      const info = await trasnport.sendMail(mensaje);
//      console.log(info);
// }
// enviarMail();