declare module 'paystack-api' {
  interface PaystackConfig {
    baseUrl?: string;
  }

  interface CustomerData {
    email: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    metadata?: Record<string, any>;
  }

  interface TransactionData {
    amount: number;
    email: string;
    reference?: string;
    callback_url?: string;
    currency?: string;
    channels?: string[];
    metadata?: Record<string, any>;
    customer?: string;
    plan?: string;
    invoice_limit?: number;
    split_code?: string;
    subaccount?: string;
    transaction_charge?: number;
    bearer?: 'account' | 'subaccount';
  }

  interface TransferData {
    source: 'balance';
    amount: number;
    recipient: string;
    reason?: string;
    currency?: string;
    reference?: string;
  }

  interface RecipientData {
    type: 'nuban' | 'mobile_money' | 'basa';
    name: string;
    account_number: string;
    bank_code: string;
    currency?: string;
    description?: string;
    metadata?: Record<string, any>;
  }

  interface PlanData {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    currency?: string;
    description?: string;
    send_invoices?: boolean;
    send_sms?: boolean;
    hosted_page?: boolean;
    hosted_page_url?: string;
    hosted_page_summary?: string;
    metadata?: Record<string, any>;
  }

  interface SubscriptionData {
    customer: string;
    plan: string;
    authorization?: string;
    start_date?: string;
  }

  interface ChargeAuthorizationData {
    authorization_code: string;
    email: string;
    amount: number;
    reference?: string;
    currency?: string;
    metadata?: Record<string, any>;
  }

  interface TransferFinalizeData {
    transfer_code: string;
    otp: string;
  }

  interface BankResolveData {
    account_number: string;
    bank_code: string;
  }

  interface ListParams {
    perPage?: number;
    page?: number;
    from?: string;
    to?: string;
    status?: string;
    customer?: string;
    plan?: string;
  }

  interface PaystackResponse<T = any> {
    status: boolean;
    message: string;
    data: T;
  }

  class Paystack {
    constructor(secretKey: string, config?: PaystackConfig);

    customer: {
      create(data: CustomerData): Promise<PaystackResponse>;
      get(customerCode: string): Promise<PaystackResponse>;
      update(
        customerCode: string,
        data: Partial<CustomerData>
      ): Promise<PaystackResponse>;
      list(params?: ListParams): Promise<PaystackResponse>;
    };

    transaction: {
      initialize(data: TransactionData): Promise<PaystackResponse>;
      verify(reference: string): Promise<PaystackResponse>;
      get(transactionId: string): Promise<PaystackResponse>;
      list(params?: ListParams): Promise<PaystackResponse>;
      chargeAuthorization(
        data: ChargeAuthorizationData
      ): Promise<PaystackResponse>;
    };

    transfer: {
      initiate(data: TransferData): Promise<PaystackResponse>;
      finalize(data: TransferFinalizeData): Promise<PaystackResponse>;
      get(transferCode: string): Promise<PaystackResponse>;
      list(params?: ListParams): Promise<PaystackResponse>;
    };

    transferrecipient: {
      create(data: RecipientData): Promise<PaystackResponse>;
      get(recipientCode: string): Promise<PaystackResponse>;
      list(params?: {
        perPage?: number;
        page?: number;
      }): Promise<PaystackResponse>;
    };

    plan: {
      create(data: PlanData): Promise<PaystackResponse>;
      get(planCode: string): Promise<PaystackResponse>;
      list(params?: ListParams): Promise<PaystackResponse>;
    };

    subscription: {
      create(data: SubscriptionData): Promise<PaystackResponse>;
      get(subscriptionCode: string): Promise<PaystackResponse>;
      list(params?: ListParams): Promise<PaystackResponse>;
    };

    bank: {
      list(): Promise<PaystackResponse>;
      resolve(data: BankResolveData): Promise<PaystackResponse>;
    };
  }

  export = Paystack;
}
