const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendConfirmationEmail = (userEmail, token) => {
  const verificationLink = `http://localhost:3000/verificacao-token?email=${encodeURIComponent(userEmail)}&token=${token}`;
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: 'Confirmação de Cadastro',
    text: `Use o seguinte token para confirmar seu cadastro: ${token}\nOu clique no link para verificar: ${verificationLink}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Erro ao enviar e-mail: ', error);
    } else {
      console.log('E-mail enviado: ' + info.response);
    }
  });
};

module.exports = { sendConfirmationEmail };
