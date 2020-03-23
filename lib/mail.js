const nodemailer = require('nodemailer')

function sendMail(email, subject, text) {
  const auth = {
    user: process.env.SENDGRID_USERNAME,
    pass: process.env.SENDGRID_API_KEY
  }

  let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth
  });

  var mailOptions = {
    from: "albin@ui-diff.com",
    to: email,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      return error
    } else {
      return info.response
    }
  });
}

module.exports = {
  sendMail
};
