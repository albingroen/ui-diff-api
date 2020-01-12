require("dotenv").config();

function sendMail(to, subject, text) {
  const sgMail = require("@sendgrid/mail");
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to,
    from: "no-reply@ui-diff.com",
    subject,
    text
  };
  sgMail.send(msg);
}

module.exports = {
  sendMail
}