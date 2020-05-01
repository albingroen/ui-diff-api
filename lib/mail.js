const nodemailer = require('nodemailer');

function sendMail(email, subject, text) {
  const auth = {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_API_KEY,
  };

  const transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth,
  });

  const mailOptions = {
    from: 'albin@ui-diff.com',
    to: email,
    subject,
    html: text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return error;
    }
    return info.response;
  });
}

module.exports = {
  sendMail,
};
