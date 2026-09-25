const axios = require("axios");

/**
 * Per-institution Daraja config is stored on Institution.mpesaConfig
 * (never in .env, since every tenant has their own Paybill/shortcode).
 */

const getBaseUrl = (isLive) =>
  isLive ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";

const getAccessToken = async (institution) => {
  const { consumerKey, consumerSecret, isLive } = institution.mpesaConfig;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString(
    "base64",
  );

  const { data } = await axios.get(
    `${getBaseUrl(isLive)}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${auth}` } },
  );

  return data.access_token;
};

const timestamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
};

/**
 * Initiates an STK push so a student can pay fees directly from the portal
 * instead of manually going to the Paybill. Used by the "Pay now" button.
 */
const initiateStkPush = async ({
  institution,
  phone,
  amount,
  accountReference,
  description,
}) => {
  const { shortcode, passkey, isLive } = institution.mpesaConfig;
  const token = await getAccessToken(institution);
  const ts = timestamp();
  const password = Buffer.from(`${shortcode}${passkey}${ts}`).toString(
    "base64",
  );

  const { data } = await axios.post(
    `${getBaseUrl(isLive)}/mpesa/stkpush/v1/processrequest`,
    {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: ts,
      TransactionType: "CustomerPayBillOnline",
      Amount: amount,
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: `${process.env.API_BASE_URL}/api/v1/finance/mpesa/stk-callback/${institution.slug}`,
      AccountReference: accountReference, // student's admission number
      TransactionDesc: description || "College fees",
    },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return data; // contains CheckoutRequestID for polling status if needed
};

module.exports = { getAccessToken, initiateStkPush };
