const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

function sendMail(email, subject, text) {
  let transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 465,
    auth: {
      user: process.env.SENDGRID_USERNAME,
      pass: process.env.SENDGRID_API_KEY
    }
  });

  var mailOptions = {
    from: "albin@ui-diff.com",
    to: email,
    subject,
    text
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      res.end(error);
    } else {
      console.log("Email sent: " + info.response);
      res.json(info.response);
    }
  });
}

function getImageUrlWithSize(result, wantedSize) {
  const defaultUrl = "https://res.cloudinary.com/albin-groen/image/upload";

  const urlWithCustomWidth = width =>
    `${defaultUrl}/w_${width}/v${result.version}/${result.public_id}.jpg`;

  const sizes = {
    sm: urlWithCustomWidth(0.5),
    lg: urlWithCustomWidth(1.5)
  };

  return sizes[wantedSize] || "";
}

const env = "local";

const envs = {
  live: "https://app.ui-diff.com",
  local: "http://localhost:3000"
};

const clientUrl = envs[env];
const redirectUrl = method => `${envs[env]}?method=${method}`;

const createTokens = (user, secret1, secret2) => {
  const token = jwt.sign({ _id: user._id }, secret1, { expiresIn: "5m" });
  const refreshToken = jwt.sign({ _id: user._id }, secret2, {
    expiresIn: "7d"
  });

  return { token, refreshToken };
};

const setTokens = (res, token, refreshToken) => {
  res.set("x-token", token);
  res.set("x-refresh-token", refreshToken);
};

module.exports = {
  sendMail,
  clientUrl,
  getImageUrlWithSize,
  redirectUrl,
  createTokens,
  setTokens
};
