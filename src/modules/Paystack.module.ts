import { Service } from 'typedi';
import Paystack, {
  CreateCustomerData,
  CreatePlanData,
  CreateRecipientData,
  CreateSubscriptionData,
  CreateTransferData,
  InitializeTransactionData,
  VerifyTransactionData,
} from 'paystack-api';
import { BadRequestError } from '../configs/error';
import envConfig from '../configs/envConfig';

@Service()
export class PaystackModule {
  private paystack: Paystack;

  constructor() {
    const secretKey = envConfig.PAYSTACK_SECRET_KEY;
    const publicKey = envConfig.PAYSTACK_PUBLIC_KEY;

    if (!secretKey || !publicKey) {
      throw new Error('Paystack secret key and public key are required');
    }

    this.paystack = new Paystack(secretKey, {
      baseUrl: envConfig.PAYSTACK_BASE_URL || 'https://api.paystack.co',
    });
  }

  // Customer Management
  async createCustomer(data: CreateCustomerData) {
    try {
      const response = await this.paystack.customer.create({
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        metadata: data.metadata,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to create customer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getCustomer(customerCode: string) {
    try {
      const response = await this.paystack.customer.get(customerCode);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get customer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async updateCustomer(
    customerCode: string,
    data: Partial<CreateCustomerData>
  ) {
    try {
      const response = await this.paystack.customer.update(customerCode, data);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to update customer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listCustomers(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
  }) {
    try {
      const response = await this.paystack.customer.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list customers: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Transaction Management
  async initializeTransaction(data: InitializeTransactionData) {
    try {
      const response = await this.paystack.transaction.initialize({
        amount: data.amount,
        email: data.email,
        reference: data.reference,
        callback_url: data.callback_url,
        currency: data.currency || 'NGN',
        channels: data.channels,
        metadata: data.metadata,
        customer: data.customer,
        plan: data.plan,
        invoice_limit: data.invoice_limit,
        split_code: data.split_code,
        subaccount: data.subaccount,
        transaction_charge: data.transaction_charge,
        bearer: data.bearer,
      });
      return response.data as {
        authorization_url: string;
        access_code: string;
        reference: string;
      };
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to initialize transaction: ${error.message || 'Unknown error'}`
      );
    }
  }

  async verifyTransaction(data: VerifyTransactionData) {
    try {
      const response = await this.paystack.transaction.verify(data);
      return response.data;
    } catch (error: any) {
      console.error(error);
      throw new BadRequestError(
        `Failed to verify transaction: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getTransaction(transactionId: string) {
    try {
      const response = await this.paystack.transaction.get(transactionId);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get transaction: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
    status?: string;
    customer?: string;
  }) {
    try {
      const response = await this.paystack.transaction.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list transactions: ${error.message || 'Unknown error'}`
      );
    }
  }

  async chargeAuthorization(data: {
    authorization_code: string;
    email: string;
    amount: number;
    reference?: string;
    currency?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      const response = await this.paystack.transaction.chargeAuthorization({
        authorization_code: data.authorization_code,
        email: data.email,
        amount: data.amount,
        reference: data.reference,
        currency: data.currency || 'NGN',
        metadata: data.metadata,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to charge authorization: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Transfer Management
  async createTransfer(data: CreateTransferData) {
    try {
      const response = await this.paystack.transfer.initiate({
        source: data.source,
        amount: data.amount,
        recipient: data.recipient,
        reason: data.reason,
        currency: data.currency || 'NGN',
        reference: data.reference,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to create transfer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async finalizeTransfer(transferCode: string, otp: string) {
    try {
      const response = await this.paystack.transfer.finalize({
        transfer_code: transferCode,
        otp: otp,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to finalize transfer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getTransfer(transferCode: string) {
    try {
      const response = await this.paystack.transfer.get(transferCode);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get transfer: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listTransfers(params?: {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
    status?: string;
  }) {
    try {
      const response = await this.paystack.transfer.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list transfers: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Recipient Management
  async createRecipient(data: CreateRecipientData) {
    try {
      const response = await this.paystack.transferrecipient.create({
        type: data.type,
        name: data.name,
        account_number: data.account_number,
        bank_code: data.bank_code,
        currency: data.currency || 'NGN',
        description: data.description,
        metadata: data.metadata,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to create recipient: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getRecipient(recipientCode: string) {
    try {
      const response = await this.paystack.transferrecipient.get(recipientCode);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get recipient: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listRecipients(params?: { perPage?: number; page?: number }) {
    try {
      const response = await this.paystack.transferrecipient.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list recipients: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Plan Management
  async createPlan(data: CreatePlanData) {
    try {
      const response = await this.paystack.plan.create({
        name: data.name,
        amount: data.amount,
        interval: data.interval,
        currency: data.currency || 'NGN',
        description: data.description,
        send_invoices: data.send_invoices,
        send_sms: data.send_sms,
        hosted_page: data.hosted_page,
        hosted_page_url: data.hosted_page_url,
        hosted_page_summary: data.hosted_page_summary,
        metadata: data.metadata,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to create plan: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getPlan(planCode: string) {
    try {
      const response = await this.paystack.plan.get(planCode);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get plan: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listPlans(params?: {
    perPage?: number;
    page?: number;
    status?: string;
  }) {
    try {
      const response = await this.paystack.plan.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list plans: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Subscription Management
  async createSubscription(data: CreateSubscriptionData) {
    try {
      const response = await this.paystack.subscription.create({
        customer: data.customer,
        plan: data.plan,
        authorization: data.authorization,
        start_date: data.start_date,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to create subscription: ${error.message || 'Unknown error'}`
      );
    }
  }

  async getSubscription(subscriptionCode: string) {
    try {
      const response = await this.paystack.subscription.get(subscriptionCode);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to get subscription: ${error.message || 'Unknown error'}`
      );
    }
  }

  async listSubscriptions(params?: {
    perPage?: number;
    page?: number;
    customer?: string;
    plan?: string;
    status?: string;
  }) {
    try {
      const response = await this.paystack.subscription.list(params);
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list subscriptions: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Bank Management
  async listBanks() {
    try {
      const response = await this.paystack.bank.list();
      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to list banks: ${error.message || 'Unknown error'}`
      );
    }
  }

  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const response = await this.paystack.bank.resolve({
        account_number: accountNumber,
        bank_code: bankCode,
      });

      return response.data;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to resolve account number: ${error.message || 'Unknown error'}`
      );
    }
  }

  // Webhook Management
  async verifyWebhookSignature(
    requestBody: string,
    signature: string
  ): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
        .update(requestBody)
        .digest('hex');

      return hash === signature;
    } catch (error: any) {
      throw new BadRequestError(
        `Failed to verify webhook signature: ${
          error.message || 'Unknown error'
        }`
      );
    }
  }

  // Utility Methods
  convertToKobo(amount: number): number {
    return Math.round(amount * 100);
  }

  convertFromKobo(amount: number): number {
    return amount / 100;
  }

  generateReference(): string {
    return `REF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get public key for frontend use
  getPublicKey(): string {
    return process.env.PAYSTACK_PUBLIC_KEY!;
  }
}
