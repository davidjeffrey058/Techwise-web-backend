const nodemailer = require('nodemailer');

module.exports = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: Number(process.env.EMAIL_PORT),
            secure: Boolean(process.env.SECURE),
            auth: {
                user: process.env.USER,
                pass: process.env.PASS,
            },
        });

        const result = await transporter.sendMail({
            to: email,
            subject: subject,
            text: text,
            from: process.env.USER,
        });

        // console.log(result);
        return true;
    } catch (error) {
        // console.log(error);
        return false;
    }
}