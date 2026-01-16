export interface PaymentPayload {
  amount: number;
  transactionId: string;
  name?: string;
  phone?: string;
}

export const rupantorConfig = {
  baseUrl: "https://payment.rupantorpay.com/api/payment",
  apiKey: process.env.RUPANTOR_API_KEY!,
};

// 1. Create Payment URL
export async function initiatePayment(payload: PaymentPayload) {
  const url = `${rupantorConfig.baseUrl}/checkout`;

  // Matches your Node.js example structure
  const body = {
    amount: payload.amount,
    // Pass Order ID in success URL to track it later
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/success?order_id=${payload.transactionId}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?status=cancelled`,
    // Metadata allows you to pass extra info
    metadata: {
      transaction_id: payload.transactionId,
      customer_name: payload.name,
      customer_phone: payload.phone
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": rupantorConfig.apiKey, // ✅ Correct Header
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
}

// 2. Verify Payment (New)
export async function verifyPayment(txnId: string) {
  const url = `${rupantorConfig.baseUrl}/verify-payment`;

  const body = {
    transaction_id: txnId
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": rupantorConfig.apiKey,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return data;
}