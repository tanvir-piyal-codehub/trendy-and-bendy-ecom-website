import { PaymentMethod, PaymentMethodConfig } from '../types';

export interface GatewayStatus {
  method: PaymentMethod;
  name: string;
  isGatewayConfigured: boolean;
  activeMode: 'AUTOMATED_GATEWAY' | 'MANUAL_TRXID';
  requiredEnvVars: string[];
  missingEnvVars: string[];
  instructions: string;
}

// Inspect environment variables safely in Vite browser runtime
const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {} as any;

export const paymentService = {
  /**
   * Check whether gateway credentials exist for a given payment method
   */
  checkGatewayStatus(method: PaymentMethod, config?: PaymentMethodConfig): GatewayStatus {
    switch (method) {
      case 'BKASH': {
        const required = ['VITE_BKASH_APP_KEY', 'VITE_BKASH_APP_SECRET'];
        const missing = required.filter(v => !env[v]);
        const isConfigured = missing.length === 0;
        const activeMode = (isConfigured && config?.gatewayMode === 'AUTOMATED_GATEWAY') 
          ? 'AUTOMATED_GATEWAY' 
          : 'MANUAL_TRXID';

        return {
          method: 'BKASH',
          name: 'bKash',
          isGatewayConfigured: isConfigured,
          activeMode,
          requiredEnvVars: required,
          missingEnvVars: missing,
          instructions: isConfigured && activeMode === 'AUTOMATED_GATEWAY'
            ? 'Redirecting to secure bKash checkout portal...'
            : 'Send Money to our bKash account and enter your Transaction ID (TrxID) below.'
        };
      }

      case 'NAGAD': {
        const required = ['VITE_NAGAD_MERCHANT_ID', 'VITE_NAGAD_PUBLIC_KEY'];
        const missing = required.filter(v => !env[v]);
        const isConfigured = missing.length === 0;
        const activeMode = (isConfigured && config?.gatewayMode === 'AUTOMATED_GATEWAY') 
          ? 'AUTOMATED_GATEWAY' 
          : 'MANUAL_TRXID';

        return {
          method: 'NAGAD',
          name: 'Nagad',
          isGatewayConfigured: isConfigured,
          activeMode,
          requiredEnvVars: required,
          missingEnvVars: missing,
          instructions: isConfigured && activeMode === 'AUTOMATED_GATEWAY'
            ? 'Redirecting to secure Nagad checkout portal...'
            : 'Send Money to our Nagad account and enter your Transaction ID (TrxID) below.'
        };
      }

      case 'SSLCOMMERZ': {
        const required = ['VITE_SSLCOMMERZ_STORE_ID', 'VITE_SSLCOMMERZ_STORE_PASS'];
        const missing = required.filter(v => !env[v]);
        const isConfigured = missing.length === 0;
        const activeMode = (isConfigured && config?.gatewayMode === 'AUTOMATED_GATEWAY') 
          ? 'AUTOMATED_GATEWAY' 
          : 'MANUAL_TRXID';

        return {
          method: 'SSLCOMMERZ',
          name: 'SSLCommerz',
          isGatewayConfigured: isConfigured,
          activeMode,
          requiredEnvVars: required,
          missingEnvVars: missing,
          instructions: isConfigured && activeMode === 'AUTOMATED_GATEWAY'
            ? 'Redirecting to SSLCommerz Hosted Payment Page...'
            : 'Transfer to our bank/SSL account and enter the Transaction ID (TrxID) below.'
        };
      }

      default: {
        return {
          method,
          name: method,
          isGatewayConfigured: false,
          activeMode: 'MANUAL_TRXID',
          requiredEnvVars: [],
          missingEnvVars: [],
          instructions: 'Submit your payment reference below.'
        };
      }
    }
  },

  /**
   * Get overall gateway diagnostics for admin panel
   */
  getAllGatewayStatuses(configs?: PaymentMethodConfig[]): GatewayStatus[] {
    const methods: PaymentMethod[] = ['BKASH', 'NAGAD', 'SSLCOMMERZ'];
    return methods.map(m => {
      const conf = configs?.find(c => c.id === m);
      return this.checkGatewayStatus(m, conf);
    });
  }
};
