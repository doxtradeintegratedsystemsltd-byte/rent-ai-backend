import { Container } from 'typedi';
import { PaystackModule } from '../modules/Paystack.module';

// Example usage of the Paystack module
export class PaystackUsageExamples {
  private paystackModule: PaystackModule;

  constructor() {
    this.paystackModule = Container.get(PaystackModule);
  }

  // Example 1: Initialize a payment transaction
  async initializePayment() {
    try {
      const transactionData = {
        amount: this.paystackModule.convertToKobo(50000), // Convert 500 NGN to kobo
        email: 'customer@example.com',
        reference: this.paystackModule.generateReference(),
        callback_url: 'https://yourapp.com/payment/callback',
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: 'Payment For',
              variable_name: 'payment_for',
              value: 'Rent Payment',
            },
          ],
        },
      };

      const result = await this.paystackModule.initializeTransaction(
        transactionData
      );
      console.log('Payment initialized:', result);
      return result;
    } catch (error) {
      console.error('Error initializing payment:', error);
      throw error;
    }
  }

  // Example 2: Verify a payment transaction
  async verifyPayment(reference: string) {
    try {
      const result = await this.paystackModule.verifyTransaction({ reference });
      console.log('Payment verified:', result);
      return result;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  // Example 3: Create a customer
  async createCustomer() {
    try {
      const customerData = {
        email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        phone: '+2348012345678',
        metadata: {
          custom_fields: [
            {
              display_name: 'Customer Type',
              variable_name: 'customer_type',
              value: 'Tenant',
            },
          ],
        },
      };

      const result = await this.paystackModule.createCustomer(customerData);
      console.log('Customer created:', result);
      return result;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Example 4: Create a transfer recipient
  async createTransferRecipient() {
    try {
      const recipientData = {
        type: 'nuban' as const,
        name: 'John Doe',
        account_number: '0123456789',
        bank_code: '044', // Access Bank code
        currency: 'NGN',
        description: 'Rent refund recipient',
      };

      const result = await this.paystackModule.createRecipient(recipientData);
      console.log('Transfer recipient created:', result);
      return result;
    } catch (error) {
      console.error('Error creating transfer recipient:', error);
      throw error;
    }
  }

  // Example 5: Initiate a transfer
  async initiateTransfer(recipientCode: string) {
    try {
      const transferData = {
        source: 'balance' as const,
        amount: this.paystackModule.convertToKobo(25000), // 250 NGN
        recipient: recipientCode,
        reason: 'Rent refund',
        currency: 'NGN',
        reference: this.paystackModule.generateReference(),
      };

      const result = await this.paystackModule.createTransfer(transferData);
      console.log('Transfer initiated:', result);
      return result;
    } catch (error) {
      console.error('Error initiating transfer:', error);
      throw error;
    }
  }

  // Example 6: Create a subscription plan
  async createSubscriptionPlan() {
    try {
      const planData = {
        name: 'Monthly Rent Plan',
        amount: this.paystackModule.convertToKobo(100000), // 1000 NGN
        interval: 'monthly' as const,
        currency: 'NGN',
        description: 'Monthly rent payment plan',
        send_invoices: true,
        send_sms: false,
        hosted_page: false,
      };

      const result = await this.paystackModule.createPlan(planData);
      console.log('Subscription plan created:', result);
      return result;
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      throw error;
    }
  }

  // Example 7: Create a subscription
  async createSubscription(customerEmail: string, planCode: string) {
    try {
      const subscriptionData = {
        customer: customerEmail,
        plan: planCode,
      };

      const result = await this.paystackModule.createSubscription(
        subscriptionData
      );
      console.log('Subscription created:', result);
      return result;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  // Example 8: List banks
  async listBanks() {
    try {
      const result = await this.paystackModule.listBanks();
      console.log('Banks listed:', result);
      return result;
    } catch (error) {
      console.error('Error listing banks:', error);
      throw error;
    }
  }

  // Example 9: Resolve account number
  async resolveAccountNumber(accountNumber: string, bankCode: string) {
    try {
      const result = await this.paystackModule.resolveAccountNumber(
        accountNumber,
        bankCode
      );
      console.log('Account resolved:', result);
      return result;
    } catch (error) {
      console.error('Error resolving account number:', error);
      throw error;
    }
  }

  // Example 10: Handle webhook events
  async handleWebhookEvent(requestBody: string, signature: string) {
    try {
      const isValid = await this.paystackModule.verifyWebhookSignature(
        requestBody,
        signature
      );

      if (!isValid) {
        throw new Error('Invalid webhook signature');
      }

      const event = JSON.parse(requestBody);

      switch (event.event) {
        case 'charge.success':
          console.log('Payment successful:', event.data);
          // Update your database, send confirmation email, etc.
          break;
        case 'transfer.success':
          console.log('Transfer successful:', event.data);
          // Update transfer status in your database
          break;
        case 'subscription.create':
          console.log('Subscription created:', event.data);
          // Update subscription status in your database
          break;
        default:
          console.log('Unhandled webhook event:', event.event);
      }

      return { success: true, event: event.event };
    } catch (error) {
      console.error('Error handling webhook:', error);
      throw error;
    }
  }

  // Example 11: Complete payment flow
  async completePaymentFlow() {
    try {
      // Step 1: Create customer
      const customer = await this.createCustomer();

      // Step 2: Initialize payment
      const payment = await this.initializePayment();

      // Step 3: Verify payment (this would typically be done via webhook)
      // const verification = await this.verifyPayment(payment.reference);

      console.log('Payment flow completed');
      return { customer, payment };
    } catch (error) {
      console.error('Error in payment flow:', error);
      throw error;
    }
  }
}

// Usage example
export const paystackExamples = new PaystackUsageExamples();

// Example of how to use in your application:
/*
import { paystackExamples } from './examples/paystack-usage';

// Initialize a payment
const payment = await paystackExamples.initializePayment();

// Verify a payment
const verification = await paystackExamples.verifyPayment('REF_123456789');

// Create a customer
const customer = await paystackExamples.createCustomer();

// Complete payment flow
const result = await paystackExamples.completePaymentFlow();
*/
