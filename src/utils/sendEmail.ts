import nodemailer from 'nodemailer';
import config from '../config';
import CustomError from "./customError";

const transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: Number(config.smtp.port),
    secure: config.smtp.isSecure,
    auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
    },
});

interface SendEmailOptions {
    to: string;
    from?: string;
    subject: string;
    html: string;
}

export async function sendEmail({to, subject, html, from}: SendEmailOptions): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
        from: from || config.smtp.from,
        to,
        subject,
        html,
    };

    const isSend = await transporter.sendMail(mailOptions);
    if (!isSend) {
        throw new CustomError("Sever error", 500, "CANNOT_SEND_EMAIL");
    }
}
