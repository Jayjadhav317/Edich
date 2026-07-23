const nodemailer = require("nodemailer");
const dns = require("dns");
require("dotenv").config();

dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  console.log("DNS:", addresses);
});

const sendEmail = async (provider, data) => {
  let host;

  if (provider === "gmail") {
    host = "smtp.gmail.com";
  } else {
    host = "smtp.office365.com";
  }

  const transporter = nodemailer.createTransport({
    host: host,
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true
    }
  });

  console.log("Verifying connection in sendEmail...");
  await transporter.verify();
  console.log("SMTP Verified");

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