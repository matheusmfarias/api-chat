const nodemailer = require('nodemailer');
const path = require('path');

// Configuração do transporter (ajuste com seu serviço de e-mail)
const transporter = nodemailer.createTransport({
    service: 'gmail', // ou qualquer outro serviço que você estiver usando
    auth: {
        user: process.env.EMAIL_USER, // Seu e-mail
        pass: process.env.EMAIL_PASS  // Sua senha ou chave de API
    }
});

// Função para enviar o e-mail de confirmação
const sendChangePasswordEmail = (userEmail, userName, token) => {
    const verificationLink = `http://localhost:3000/recupera-senha?token=${token}`;
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: `Solicitação de alteração de senha`,
        html: `
      <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="pt"
    style="font-family:arial, 'helvetica neue', helvetica, sans-serif">

<head>
    <meta charset="UTF-8">
    <meta content="width=device-width, initial-scale=1" name="viewport">
    <meta name="x-apple-disable-message-reformatting">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta content="telephone=no" name="format-detection">
    <link href="https://fonts.googleapis.com/css2?family=Imprima&display=swap" rel="stylesheet">
    <style type="text/css">
        /* Adicione seu estilo personalizado aqui */
        .es-button {
            mso-style-priority: 100 !important;
            text-decoration: none !important;
        }
    </style>
</head>

<body
    style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
    <div dir="ltr" class="es-wrapper-color" lang="pt" style="background-color:#FFFFFF">
        <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0"
            style="padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#FFFFFF">
            <tr>
                <td valign="top" style="padding:0;Margin:0">
                    <table cellpadding="0" cellspacing="0" class="es-footer" align="center"
                        style="width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
                        <tr>
                            <td align="center" style="padding:0;Margin:0">
                                <table bgcolor="#bcb8b1" class="es-footer-body" align="center" cellpadding="0"
                                    cellspacing="0" style="background-color:#FFFFFF;width:600px">
                                    <tr>
                                        <td align="left"
                                            style="padding-top:20px;padding-bottom:20px;padding-left:40px;padding-right:40px">
                                            <table cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top" style="width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td align="center" style="font-size:0px"><a
                                                                        target="_blank"
                                                                        href="https://acipanambi.com/"><img
                                                                            src="https://fchiinm.stripocdn.email/content/guids/CABINET_39954f1b426f56a05fc7c8112df428644f5e0edd52492654c4e23959c997f9b3/images/logositeacitransparente_GWi.png"
                                                                            height="91" width="162.5"></a></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>

                    <!-- Conteúdo principal do e-mail -->
                    <table class="es-content" align="center" style="width:100%">
                        <tr>
                            <td align="center">
                                <table bgcolor="#efefef" class="es-content-body" align="center" cellpadding="0"
                                    cellspacing="0"
                                    style="background-color:#efefef;border-radius:20px;width:600px">
                                    <tr>
                                        <td align="left" style="padding:40px 40px 20px 40px">
                                            <table cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top" style="width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td align="left" class="es-m-txt-c"
                                                                    style="font-size:0px"><img
                                                                        src="https://fchiinm.stripocdn.email/content/guids/CABINET_39954f1b426f56a05fc7c8112df428644f5e0edd52492654c4e23959c997f9b3/images/iconeemail.png"
                                                                        width="100" height="100"></td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td align="left" style="padding:20px 40px">
                                            <table cellpadding="0" cellspacing="0" width="100%">
                                                <tr>
                                                    <td align="center" valign="top" style="width:520px">
                                                        <table cellpadding="0" cellspacing="0" width="100%"
                                                            bgcolor="#fafafa"
                                                            style="padding:10px;background-color:#fafafa;border-radius:10px">
                                                            <tr>
                                                                <td align="left" style="padding:0 20px">
                                                                    <h3 style="font-size:28px;color:#1f58a2">
                                                                        Olá, ${userName}.</h3>
                                                                    <p style="color:#1f58a2;font-size:18px">
                                                                        Você está recebendo esse e-mail pois solicitou a alteração da senha da sua conta.<br><br>
                                                                        Realize a alteração da senha clicando no botão abaixo.
                                                                    </p>
                                                                    <div align="center" style="padding: 20px 0;">
                                                                        <a href="${verificationLink}" class="es-button"
                                                                            style="color:#FFFFFF;font-size:22px;padding:15px 20px;background:#1f58a2;border-radius:30px;text-align:center">Alterar senha</a>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td align="left" style="padding:10px 0">
                                                        <table cellpadding="0" cellspacing="0" width="100%">
                                                            <tr>
                                                                <td align="center" valign="top" style="width:520px">
                                                                    <table cellpadding="0" cellspacing="0" width="100%">
                                                                        <tr>
                                                                            <td align="left"
                                                                                style="font-size:18px;color:#1f58a2">
                                                                                Obrigado,<br><br>ACI Panambi</td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td align="center"
                                                                                style="padding:10px 0;font-size:0px;border-bottom:1px solid #666666">
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td align="left"
                                                                                style="padding-top:20px;font-size:16px;color:#2D3142">
                                                                                Este link expirará em 24 horas. Se você
                                                                                possui dúvidas, <a
                                                                                    href="https://web.whatsapp.com/send?phone=5555992128613"
                                                                                    style="color:#2D3142">estamos aqui
                                                                                    para ajudar.</a></td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td align="center"
                                                                                style="padding-top:20px;font-size:14px;color:#2D3142">
                                                                                <a href="https://acipanambi.com/anexo/politica-de-privacidade.pdf"
                                                                                    style="color:#2D3142">Política de
                                                                                    Privacidade</a>
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td align="center"
                                                                                style="padding-top:20px;font-size:14px;color:#2D3142">
                                                                                Copyright © 2024 ACI Panambi</td>
                                                                        </tr>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
    `
    };

    // Enviar o e-mail
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar o e-mail: ', error);
        } else {
            console.log('E-mail enviado: ' + info.response);
        }
    });
};

module.exports = { sendChangePasswordEmail };
