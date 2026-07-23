const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "false",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const sendEmail = async (to, subject, text) => {
    try {
        const info = await transporter.sendMail({
            from: `"Excalidraw Clone" <${process.env.SMTP_FROM}>`,
            to,
            subject,
            text,
        });

        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

module.exports = sendEmail;