import { env } from "@/env";
import { EMAIL_SENDER } from "@/lib/constants";
import { createTransport, type TransportOptions } from "nodemailer";

const smtpConfig = {
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
};

const transporter = createTransport(smtpConfig as TransportOptions);

export type MessageInfo = {
  to: string;
  subject: string;
  body: string;
};

export const sendMail = async (message: MessageInfo) => {
  const { to, subject, body } = message;
  const mailOptions = {
    from: EMAIL_SENDER,
    to,
    subject,
    html: body,
  };
  return transporter.sendMail(mailOptions);
};
