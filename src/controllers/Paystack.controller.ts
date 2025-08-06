import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { PaystackModule } from '../modules/Paystack.module';
import { successResponse } from '../utils/response';

@Service()
export class PaystackController {
  constructor(private readonly paystackModule: PaystackModule) {}

  // Customer Management
  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const customer = await this.paystackModule.createCustomer(req.body);
      return successResponse(res, 'Customer created successfully', customer);
    } catch (error: any) {
      return next(error);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerCode } = req.params;
      const customer = await this.paystackModule.getCustomer(customerCode);
      return successResponse(res, 'Customer retrieved successfully', customer);
    } catch (error: any) {
      return next(error);
    }
  }

  async updateCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerCode } = req.params;
      const customer = await this.paystackModule.updateCustomer(
        customerCode,
        req.body
      );
      return successResponse(res, 'Customer updated successfully', customer);
    } catch (error: any) {
      return next(error);
    }
  }

  async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customers = await this.paystackModule.listCustomers(req.query);
      return successResponse(
        res,
        'Customers retrieved successfully',
        customers
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Transaction Management
  async initializeTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await this.paystackModule.initializeTransaction(
        req.body
      );
      return successResponse(
        res,
        'Transaction initialized successfully',
        transaction
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async verifyTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { reference } = req.params;
      const transaction = await this.paystackModule.verifyTransaction({
        reference,
      });
      return successResponse(
        res,
        'Transaction verified successfully',
        transaction
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async getTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      const transaction = await this.paystackModule.getTransaction(
        transactionId
      );
      return successResponse(
        res,
        'Transaction retrieved successfully',
        transaction
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async listTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const transactions = await this.paystackModule.listTransactions(
        req.query
      );
      return successResponse(
        res,
        'Transactions retrieved successfully',
        transactions
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async chargeAuthorization(req: Request, res: Response, next: NextFunction) {
    try {
      const transaction = await this.paystackModule.chargeAuthorization(
        req.body
      );
      return successResponse(
        res,
        'Authorization charged successfully',
        transaction
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Transfer Management
  async createTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const transfer = await this.paystackModule.createTransfer(req.body);
      return successResponse(res, 'Transfer created successfully', transfer);
    } catch (error: any) {
      return next(error);
    }
  }

  async finalizeTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { transferCode } = req.params;
      const { otp } = req.body;
      const transfer = await this.paystackModule.finalizeTransfer(
        transferCode,
        otp
      );
      return successResponse(res, 'Transfer finalized successfully', transfer);
    } catch (error: any) {
      return next(error);
    }
  }

  async getTransfer(req: Request, res: Response, next: NextFunction) {
    try {
      const { transferCode } = req.params;
      const transfer = await this.paystackModule.getTransfer(transferCode);
      return successResponse(res, 'Transfer retrieved successfully', transfer);
    } catch (error: any) {
      return next(error);
    }
  }

  async listTransfers(req: Request, res: Response, next: NextFunction) {
    try {
      const transfers = await this.paystackModule.listTransfers(req.query);
      return successResponse(
        res,
        'Transfers retrieved successfully',
        transfers
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Recipient Management
  async createRecipient(req: Request, res: Response, next: NextFunction) {
    try {
      const recipient = await this.paystackModule.createRecipient(req.body);
      return successResponse(res, 'Recipient created successfully', recipient);
    } catch (error: any) {
      return next(error);
    }
  }

  async getRecipient(req: Request, res: Response, next: NextFunction) {
    try {
      const { recipientCode } = req.params;
      const recipient = await this.paystackModule.getRecipient(recipientCode);
      return successResponse(
        res,
        'Recipient retrieved successfully',
        recipient
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async listRecipients(req: Request, res: Response, next: NextFunction) {
    try {
      const recipients = await this.paystackModule.listRecipients(req.query);
      return successResponse(
        res,
        'Recipients retrieved successfully',
        recipients
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Plan Management
  async createPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await this.paystackModule.createPlan(req.body);
      return successResponse(res, 'Plan created successfully', plan);
    } catch (error: any) {
      return next(error);
    }
  }

  async getPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const { planCode } = req.params;
      const plan = await this.paystackModule.getPlan(planCode);
      return successResponse(res, 'Plan retrieved successfully', plan);
    } catch (error: any) {
      return next(error);
    }
  }

  async listPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const plans = await this.paystackModule.listPlans(req.query);
      return successResponse(res, 'Plans retrieved successfully', plans);
    } catch (error: any) {
      return next(error);
    }
  }

  // Subscription Management
  async createSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await this.paystackModule.createSubscription(
        req.body
      );
      return successResponse(
        res,
        'Subscription created successfully',
        subscription
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async getSubscription(req: Request, res: Response, next: NextFunction) {
    try {
      const { subscriptionCode } = req.params;
      const subscription = await this.paystackModule.getSubscription(
        subscriptionCode
      );
      return successResponse(
        res,
        'Subscription retrieved successfully',
        subscription
      );
    } catch (error: any) {
      return next(error);
    }
  }

  async listSubscriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const subscriptions = await this.paystackModule.listSubscriptions(
        req.query
      );
      return successResponse(
        res,
        'Subscriptions retrieved successfully',
        subscriptions
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Bank Management
  async listBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const banks = await this.paystackModule.listBanks();
      return successResponse(res, 'Banks retrieved successfully', banks);
    } catch (error: any) {
      return next(error);
    }
  }

  async resolveAccountNumber(req: Request, res: Response, next: NextFunction) {
    try {
      const { accountNumber, bankCode } = req.body;
      const account = await this.paystackModule.resolveAccountNumber(
        accountNumber,
        bankCode
      );
      return successResponse(
        res,
        'Account number resolved successfully',
        account
      );
    } catch (error: any) {
      return next(error);
    }
  }

  // Webhook Management
  async handleWebhook(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers['x-paystack-signature'] as string;
      const requestBody = JSON.stringify(req.body);

      if (!signature) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Missing Paystack signature',
        });
      }

      const isValid = await this.paystackModule.verifyWebhookSignature(
        requestBody,
        signature
      );

      if (!isValid) {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Invalid webhook signature',
        });
      }

      const event = req.body as any;

      // Handle different webhook events
      switch (event.event) {
        case 'charge.success':
          // Handle successful payment
          console.log('Payment successful:', event.data);
          break;
        case 'transfer.success':
          // Handle successful transfer
          console.log('Transfer successful:', event.data);
          break;
        case 'subscription.create':
          // Handle subscription creation
          console.log('Subscription created:', event.data);
          break;
        default:
          console.log('Unhandled webhook event:', event.event);
      }

      return successResponse(res, 'Webhook processed successfully');
    } catch (error: any) {
      return next(error);
    }
  }

  // Utility endpoints
  async getPublicKey(req: Request, res: Response, next: NextFunction) {
    try {
      const publicKey = this.paystackModule.getPublicKey();
      return successResponse(res, 'Public key retrieved successfully', {
        publicKey,
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async convertAmount(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, toKobo = true } = req.body;

      if (typeof amount !== 'number') {
        return res.status(400).json({
          statusCode: 400,
          status: 'error',
          message: 'Amount must be a number',
        });
      }

      const convertedAmount = toKobo
        ? this.paystackModule.convertToKobo(amount)
        : this.paystackModule.convertFromKobo(amount);

      return successResponse(res, 'Amount converted successfully', {
        originalAmount: amount,
        convertedAmount,
        direction: toKobo ? 'to_kobo' : 'from_kobo',
      });
    } catch (error: any) {
      return next(error);
    }
  }

  async generateReference(req: Request, res: Response, next: NextFunction) {
    try {
      const reference = this.paystackModule.generateReference();
      return successResponse(res, 'Reference generated successfully', {
        reference,
      });
    } catch (error: any) {
      return next(error);
    }
  }
}
