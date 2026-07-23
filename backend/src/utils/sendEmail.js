const nodemailer = require("nodemailer");
const dns = require("dns");
require("dotenv").config();

dns.lookup("smtp-relay.brevo.com", { all: true }, (err, addresses) => {
  console.log("DNS:", addresses);
});

const sendEmail = async (provider, data) => {
  let host = process.env.SMTP_HOST;
  let port = Number(process.env.SMTP_PORT || "587");

  if (!host) {
    if (provider === "gmail") {
      host = "smtp.gmail.com";
    } else if (provider === "brevo") {
      host = "smtp-relay.brevo.com";
      port = 2525;
    } else {
      host = "smtp.office365.com";
    }
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: port,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  await transporter.sendMail({
    from: `"${process.env.APP_NAME || "Excalidraw Clone"}" <${process.env.SMTP_USER}>`,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
    attachments: data.attachments || []
  });
};

module.exports = sendEmail;