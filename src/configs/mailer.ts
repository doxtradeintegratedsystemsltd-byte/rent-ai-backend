import nodemailer from 'nodemailer';
import envConfig from './envConfig';

export type MailData = {
  from: string;
  to: string | string[];
  html?: string;
  subject?: string;
};

const transport = nodemailer.createTransport({
  service: 'gmail',
  connectionTimeout: 300000,
  pool: true,
  secure: true,
  auth: {
    user: envConfig.MAIL_USER,
    pass: envConfig.MAIL_PASSWORD,
  },
  ignoreTLS: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false,
  },
});

export const verifyMailSetup = () => {
  transport.verify((error, success) => {
    if (error) console.log(`Error setting up nodemailer: ${error}`);
    else console.log('Server 🚀 is ready to send out mails');
  });
};

export const sendMail = (data: MailData) => {
  return transport.sendMail(data);
};
