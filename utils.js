const nodemailer = require('nodemailer')
require('dotenv').config()

function sendMail(email, subject, text) {
  let transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 465,
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_API_KEY
    }
  });

  var mailOptions = {
    from: 'albin@ui-diff.com',
    to: email,
    subject,
    text
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      res.end(error)
    } else {
      console.log('Email sent: ' + info.response);
      res.json(info.response)
    }
  });
}

const env = "live"

const envs = {
  live: 'https://app.ui-diff.com',
  local: "http://localhost:3000"
}

const clientUrl = envs[env];

module.exports = {
  sendMail,
  clientUrl
}
