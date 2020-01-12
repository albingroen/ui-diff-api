require("dotenv").config();

function sendMail(to, subject, html) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: "ui-diff@gmail.com",
    subject,
    html
  };
  sgMail.send(msg);
}

module.exports = {
  sendMail
}