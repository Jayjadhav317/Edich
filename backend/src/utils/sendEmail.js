const nodemailer = require("nodemailer");

let actualTransporter = null;

async function initTransporter() {
  if (actualTransporter) return actualTransporter;

  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    actualTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      requireTLS: true,
      family: 4, // Force IPv4 to prevent IPv6 network unreachable (ENETUNREACH) errors
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
    });
  } else {
    // Fallback to Ethereal email test account for zero-config testing
    const testAccount = await nodemailer.createTestAccount();
    actualTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
  }
  return actualTransporter;
}

// Wrapper that delegates sendMail to the dynamically initialized transporter
const transporter = {
  sendMail: async (mailOptions) => {
    const tx = await initTransporter();
    return tx.sendMail(mailOptions);
  },
  verify: async () => {
    const tx = await initTransporter();
    return tx.verify();
  }
};

module.exports = transporter;
