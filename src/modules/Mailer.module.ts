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
          title: 'Welcome! Your account has been created',
          content: `Hi ${name}, <br />We are delighted to inform you that an account has been created for you to access ${theOnlineDashboard}. Through this dashboard, you can view the details of your current lease with us, as well as renew your lease and see additional details about your tenancy.`,
          additional: `Your login credentials are provided below:<br /><br />
          <strong>Website:</strong> ${toLink(WEBSITE_URL)}<br />
          <strong>Email:</strong> ${email}<br />
          <strong>Password:</strong> ${password}<br /><br />
          If you have any questions or need assistance, please don't hesitate to contact us.`,
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

  sendNewSuperAdminMail = async (
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
          content: `Hi ${name}, <br />As a super admin, you now have full access to ${theOnlineDashboard} to manage all features. Here are your login details:`,
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
            content: `Hi ${name}, <br />This is a reminder that your next lease payment is ${leaseStatus}`,
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

  sendNewLeaseCreatedMail = async (
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
          subject: 'New Lease Created',
          html: generateEmail({
            title: 'Your Lease is Ready!',
            content: `Hi ${name}, <br />Great news! Your lease for ${propertyName} has been successfully created.`,
            additional: `You can now access ${theOnlineDashboard} to view your lease details, payment schedule, and manage your tenancy. If you have any questions, please don't hesitate to contact us.`,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  sendNextLeasePeriodPaymentConfirmationMail = async (
    {
      to,
      name,
      propertyName,
      nextLeaseStartDate,
      nextLeaseEndDate,
      amount,
    }: {
      to: string;
      name: string;
      propertyName: string;
      nextLeaseStartDate: string;
      nextLeaseEndDate: string;
      amount: number;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'Next Lease Period Payment Confirmed',
          html: generateEmail({
            title: 'Payment Confirmed for Next Lease Period!',
            content: `Hi ${name}, <br />Thank you for your payment! Your payment for the next lease period at ${propertyName} has been successfully processed and confirmed.`,
            additional: `Payment Details:<br />
            <strong>Property:</strong> ${propertyName}<br />
            <strong>Next Lease Period:</strong> ${nextLeaseStartDate} to ${nextLeaseEndDate}<br />
            <strong>Amount Paid:</strong> ₦${amount.toLocaleString()}<br /><br />
            Your next lease period is now secured and will automatically become active when your current lease ends. You can view all your lease details and payment history on ${theOnlineDashboard}.<br /><br />
            If you have any questions, please don't hesitate to contact us.`,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };

  sendNextLeasePeriodStartedMail = async (
    {
      to,
      name,
      propertyName,
      leaseStartDate,
      leaseEndDate,
    }: {
      to: string;
      name: string;
      propertyName: string;
      leaseStartDate: string;
      leaseEndDate: string;
    },
    notificationTrigger: NotificationFunction
  ) => {
    try {
      return this.processEmail(
        {
          from: fromMail,
          to,
          subject: 'Next Lease Period Has Started',
          html: generateEmail({
            title: 'Your Next Lease Period is Now Active!',
            content: `Hi ${name}, <br />Your next lease period at ${propertyName} has officially started and is now active.`,
            additional: `Lease Details:<br />
            <strong>Property:</strong> ${propertyName}<br />
            <strong>Lease Period:</strong> ${leaseStartDate} to ${leaseEndDate}<br />
            Your new lease period is now in effect. You can access ${theOnlineDashboard} to view your updated lease details, payment schedule, and manage your tenancy. We wish you a wonderful stay!<br /><br />
            If you have any questions or need assistance, please don't hesitate to contact us.`,
          }),
        },
        notificationTrigger
      );
    } catch (err) {
      console.log(err);
    }
  };
}
