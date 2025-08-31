import Handlebars from 'handlebars';
import fs from 'fs';
import envConfig from '../configs/envConfig';
import { sendMail } from '../configs/mailer';
import { Service } from 'typedi';

const fromMail = envConfig.MAIL_FROM;
const defaultHtml = fs.readFileSync('./assets/mail.html', 'utf-8');

type GenerateEmail = {
  title: string;
  content: string;
  additional?: string;
  additional2?: string;
};

type ProcessEmail = {
  from?: string;
  to: string;
  subject: string;
  html: string;
};

type NotificationFunction = (success: boolean) => Promise<void>;

const generateEmail = ({
  title,
  content,
  additional,
  additional2,
}: GenerateEmail) => {
  const template = Handlebars.compile(defaultHtml);
  const htmlToSend = template({
    title,
    content,
    additional,
    additional2,
  });

  return htmlToSend;
};

export const WEBSITE_URL = envConfig.FRONTEND_URL;

const theOnlineDashboard = `<a href="${WEBSITE_URL}">the online portal</a>`;

const linkToParentEvent = (id: string) =>
  `<a href="${WEBSITE_URL}/user/theme/${id}">the online portal</a>`;

const toLink = (link: string, text?: string) => {
  return `<a href="${link}">${text || link}</a>`;
};

@Service()
export class MailerModule {
  processEmail = async (
    data: ProcessEmail,
    notificationTrigger: NotificationFunction
  ) => {
    try {
      const payload = {
        ...data,
        from: data.from || fromMail,
      };

      await sendMail(payload);
      notificationTrigger(true);
      console.log('Email Sent to ', data.to);
    } catch (err) {
      console.log('Error sending email to ', data.to, err);
      notificationTrigger(false);
    }
  };

  sendNewTenantMail = async (
    {
      to,
      name,
      email,
      password,
    }: {
      to: string;
      name: string;
      email: string;
      password: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    return this.processEmail(
      {
        to,
        subject: 'Welcome to the Rent Platform',
        html: generateEmail({
          title: 'Sign in and access your account!',
          content: `Hi ${name}, <br />We are delighted to inform you that an account has been created for you to access ${theOnlineDashboard}. Through this dashboard, you can view the details of your current lease with use, as well as renew your lease and see additional details`,
          additional: `Website: ${toLink(WEBSITE_URL)} 
          <br />Email: ${email}
          <br />Password: ${password}`,
        }),
      },
      notificationTrigger
    );
  };

  sendNewAdminMail = async (
    {
      to,
      name,
      email,
      password,
    }: {
      to: string;
      name: string;
      email: string;
      password: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    return this.processEmail(
      {
        to,
        subject: 'Welcome to the Rent Platform',
        html: generateEmail({
          title: 'Sign in and access your account!',
          content: `Hi ${name}, <br />As an admin, you now have access to ${theOnlineDashboard} to manage your properties. Here are your login details:`,
          additional: `Website: ${toLink(WEBSITE_URL)} 
          <br />Email: ${email}
          <br />Password: ${password}`,
        }),
      },
      notificationTrigger
    );
  };

  sendPasswordResetLinkMail = async (
    {
      to,
      name,
      resetLink,
    }: {
      to: string;
      name: string;
      resetLink: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'Password Reset Request',
          html: generateEmail({
            title: 'Password Reset',
            content: `Hi ${name}, <br />Please complete your password reset on ${theOnlineDashboard} with the provided reset link:`,
            additional: toLink(resetLink, 'Reset Password'),
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  sendLeasePaymentReminderMail = async (
    {
      to,
      name,
      leaseStatus,
    }: {
      to: string;
      name: string;
      leaseStatus: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'Lease Payment Reminder',
          html: generateEmail({
            title: 'Lease Payment Reminder',
            content: `Hi ${name}, <br />This is a reminder that your lease payment status is ${leaseStatus}`,
            additional: `You can make payment on ${theOnlineDashboard}`,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  sendLeaseTenantRemovedMail = async (
    {
      to,
      name,
      propertyName,
    }: {
      to: string;
      name: string;
      propertyName: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'Lease Cancelled',
          html: generateEmail({
            title: 'Your Lease has been cancelled',
            content: `Hi ${name}, <br />Your lease with ${propertyName} has been cancelled.`,
            additional: `You will no longer need to access the online portal`,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  sendLeaseNotificationMail = async (
    {
      to,
      notificationTitle,
      notificationContent,
    }: {
      to: string;
      notificationTitle: string;
      notificationContent: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'New Notification',
          html: generateEmail({
            title: notificationTitle,
            content: notificationContent,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  static sendAccountDeletedMail = async ({ to }: Record<string, string>) => {
    try {
      sendMail({
        from: fromMail,
        to,
        subject: 'Account Deleted',
        html: generateEmail({
          title: 'Account Deleted!',
          content: `Hi, Your account has been deleted from Totsland's Porfolio.<br />`,
          additional: `You can no longer access your account using your credentials.`,
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };

  static sendNewEventUploadMail = async ({
    to,
    name,
    eventId,
    childName,
  }: {
    to: string;
    name: string;
    eventId: string;
    childName: string;
  }) => {
    try {
      sendMail({
        from: fromMail,
        to,
        subject: 'Theme Event Uploaded',
        html: generateEmail({
          title: 'New Theme Event Uploaded!',
          content: `Dear ${name}, <br />We are excited to inform you that a theme featuring your child, ${childName}, has been uploaded to ${linkToParentEvent(
            eventId
          )}!`,
          additional: `To view the photos and details of this event, please log in to your account using the link provided above.`,
        }),
      });
    } catch (err) {
      console.log(err);
    }
  };
}
