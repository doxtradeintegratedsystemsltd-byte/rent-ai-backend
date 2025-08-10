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
      verify(
        data: VerifyTransactionData
      ): Promise<PaystackResponse<VerifyTransactionResponse>>;
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

export interface PaystackConfig {
  secretKey: string;
  publicKey: string;
  baseUrl?: string;
}

export interface CreateCustomerData {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  metadata?: Record<string, any>;
}

export interface InitializeTransactionData {
  amount: number; // Amount in kobo (multiply by 100)
  email: string;
  reference?: string;
  callback_url?: string;
  currency?: string;
  channels?: string[];
  metadata?: Record<string, any>;
  customer?: string; // Customer code
  plan?: string; // Plan code
  invoice_limit?: number;
  split_code?: string;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: 'account' | 'subaccount';
}

export interface VerifyTransactionData {
  reference: string;
}

export interface CreateTransferData {
  source: 'balance';
  amount: number; // Amount in kobo
  recipient: string; // Recipient code
  reason?: string;
  currency?: string;
  reference?: string;
}

export interface CreateRecipientData {
  type: 'nuban' | 'mobile_money' | 'basa';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreatePlanData {
  name: string;
  amount: number; // Amount in kobo
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

export interface CreateSubscriptionData {
  customer: string; // Customer email or code
  plan: string; // Plan code
  authorization?: string; // Authorization code
  start_date?: string; // ISO date string
}

export interface WebhookEvent {
  event: string;
  data: Record<string, any>;
}

export interface VerifyTransactionResponse {
  id: number;
  domain: string;
  status: string;
  reference: string;
  receipt_number: string | null;
  amount: number;
  message: string;
  gateway_response: string;
  paid_at: string;
  created_at: string;
  channel: string;
  currency: string;
  ip_address: string;
  metadata: string;
  log: {
    start_time: number;
    time_spent: number;
    attempts: number;
    errors: number;
    success: boolean;
    mobile: boolean;
    input: any[];
  };
  fees: number;
  fees_split: any;
  authorization: {
    authorization_code: string;
    bin: string;
    last4: string;
    exp_month: string;
    exp_year: string;
    channel: string;
    card_type: string;
  };
  customer: {
    id: number;
    first_name: string | null;
    last_name: string | null;
    email: string;
    customer_code: string;
    phone: string | null;
    metadata: any;
  };
  plan: any;
  split: any;
  order_id: any;
  paidAt: string;
  createdAt: string;
  requested_amount: number;
  pos_transaction_data: any;
  source: any;
  fees_breakdown: any;
  connect: any;
  transaction_date: string;
  plan_object: any;
  subaccount: any;
}
