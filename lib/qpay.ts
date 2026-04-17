export async function qpayGetAccessToken() {
  const basicAuth = Buffer.from(
    `${process.env.QPAY_USERNAME}:${process.env.QPAY_PASSWORD}`
  ).toString("base64");

  const authRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/json",
    },
  });

  if (!authRes.ok) {
    const text = await authRes.text().catch(() => "");
    throw new Error(`QPay auth failed: ${text || authRes.status}`);
  }

  const authData = await authRes.json();
  return authData.access_token as string;
}

export async function qpayCreateInvoice({
  senderInvoiceNo,
  receiverCode,
  description,
  amount,
}: {
  senderInvoiceNo: string;
  receiverCode: string;
  description: string;
  amount: number;
}) {
  const accessToken = await qpayGetAccessToken();
  const invoiceRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/invoice`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      invoice_code: process.env.QPAY_INVOICE_CODE,
      sender_invoice_no: senderInvoiceNo,
      invoice_receiver_code: receiverCode,
      invoice_description: description,
      amount,
    }),
  });

  if (!invoiceRes.ok) {
    const text = await invoiceRes.text().catch(() => "");
    throw new Error(`QPay invoice failed: ${text || invoiceRes.status}`);
  }

  return invoiceRes.json();
}

export async function qpayCheckInvoicePaid(invoiceId: string) {
  const accessToken = await qpayGetAccessToken();
  const checkRes = await fetch(`${process.env.QPAY_BASE_URL}/v2/payment/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      object_type: "INVOICE",
      object_id: invoiceId,
    }),
  });

  if (!checkRes.ok) {
    const text = await checkRes.text().catch(() => "");
    throw new Error(`QPay payment check failed: ${text || checkRes.status}`);
  }

  const checkData = await checkRes.json();
  const isPaid =
    (checkData.count > 0 &&
      checkData.rows?.some(
        (row: any) =>
          row.payment_status === "PAID" || row.payment_status === "SUCCESS"
      )) ||
    (checkData.paid_amount || 0) > 0;

  return { isPaid: !!isPaid, raw: checkData };
}

