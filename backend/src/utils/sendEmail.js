const nodemailer = require("nodemailer");
const dns = require("dns");

dns.lookup("smtp.gmail.com", { all: true }, (err, addresses) => {
  console.log("DNS Lookup Results for smtp.gmail.com:", addresses);
});

const isSecure = process.env.SMTP_SECURE === "true";
const port = Number(process.env.SMTP_PORT);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: port,
  secure: isSecure,
  requireTLS: !isSecure && port === 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 30000,

  greetingTimeout: 30000,
  socketTimeout: 30000,
});

if (process.env.NODE_ENV !== "production") {
  transporter.verify()
    .then(() => console.log("SMTP Connected Successfully"))
    .catch((err) => console.error("SMTP Verify Error:", err));
}

module.exports = transporter;
