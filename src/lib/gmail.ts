import type { Currency, TransactionBucket } from "./types";

interface GmailListResponse {
  messages?: { id: string; threadId: string }[];
}

interface GmailMessageResponse {
  id: string;
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: { name: string; value: string }[];
  };
}

export interface GmailReceiptCandidate {
  gmailMessageId: string;
  merchantName: string;
  rawDescription: string;
  amount: number;
  currency: Currency;
  date: string;
  bucket: TransactionBucket;
  snippet: string;
}

const RECEIPT_QUERY = 'newer_than:14d (receipt OR invoice OR "order confirmation" OR payment OR paid)';
const DEFAULT_CURRENCY: Currency = "SGD";

function header(message: GmailMessageResponse, name: string) {
  return message.payload?.headers?.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value;
}

function merchantFromFromHeader(value?: string) {
  if (!value) return "Gmail receipt";
  const withoutEmail = value.replace(/<[^>]+>/g, "").replace(/"/g, "").trim();
  return withoutEmail || value.split("@")[0] || "Gmail receipt";
}

function parseMoney(text: string): { amount: number; currency: Currency } | null {
  const match = text.match(/\b(SGD|USD|MYR|GBP|EUR)\s*([0-9][0-9,]*(?:\.\d{2})?)\b/i) ??
    text.match(/(S\$|RM|\$|£|€)\s*([0-9][0-9,]*(?:\.\d{2})?)/);
  if (!match) return null;

  const symbolOrCurrency = match[1].toUpperCase();
  const amount = Number.parseFloat(match[2].replace(/,/g, ""));
  if (!Number.isFinite(amount)) return null;

  const currency: Currency =
    symbolOrCurrency === "S$" ? "SGD" :
    symbolOrCurrency === "RM" ? "MYR" :
    symbolOrCurrency === "$" ? DEFAULT_CURRENCY :
    symbolOrCurrency === "£" ? "GBP" :
    symbolOrCurrency === "€" ? "EUR" :
    (symbolOrCurrency as Currency);

  return { amount, currency };
}

function parseReceipt(message: GmailMessageResponse): GmailReceiptCandidate | null {
  const subject = header(message, "Subject") ?? "Gmail receipt";
  const from = header(message, "From");
  const dateHeader = header(message, "Date");
  const searchableText = `${subject} ${message.snippet ?? ""}`;
  const money = parseMoney(searchableText);
  if (!money) return null;

  const date = dateHeader
    ? new Date(dateHeader).toISOString()
    : message.internalDate
      ? new Date(Number(message.internalDate)).toISOString()
      : new Date().toISOString();

  return {
    gmailMessageId: message.id,
    merchantName: merchantFromFromHeader(from),
    rawDescription: subject,
    amount: money.amount,
    currency: money.currency,
    date,
    bucket: "needs",
    snippet: message.snippet ?? "",
  };
}

async function gmailFetch<T>(accessToken: string, path: string) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Gmail scan failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export async function scanGmailForReceipts(accessToken: string, maxResults = 10) {
  const list = await gmailFetch<GmailListResponse>(
    accessToken,
    `messages?maxResults=${maxResults}&q=${encodeURIComponent(RECEIPT_QUERY)}`
  );

  const messages = list.messages ?? [];
  const detailed = await Promise.all(
    messages.map((message) =>
      gmailFetch<GmailMessageResponse>(
        accessToken,
        `messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`
      )
    )
  );

  return detailed.map(parseReceipt).filter((receipt): receipt is GmailReceiptCandidate => receipt !== null);
}
