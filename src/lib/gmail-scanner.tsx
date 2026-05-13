"use client";

import { useEffect, useRef } from "react";
import { getStoredGoogleToken } from "./google-firebase-auth";
import { scanGmailForReceipts } from "./gmail";
import { useSanity } from "./store";

const LAST_SCAN_STORAGE_KEY = "sanity:gmail:last-scan:v1";

export function GmailReceiptScanner() {
  const sanity = useSanity();
  const scanning = useRef(false);

  useEffect(() => {
    if (!sanity.ready || !sanity.data.onboarded || sanity.data.accounts.length === 0) return;
    if (scanning.current) return;

    const token = getStoredGoogleToken();
    if (!token) return;

    const lastScan = Number(localStorage.getItem(LAST_SCAN_STORAGE_KEY) ?? "0");
    if (Date.now() - lastScan < 5 * 60_000) return;

    scanning.current = true;

    scanGmailForReceipts(token.accessToken)
      .then((receipts) => {
        const account = sanity.data.accounts[0];
        if (!account) return;

        if (!sanity.data.sources.some((source) => source.type === "gmail")) {
          sanity.addSource({
            type: "gmail",
            label: "Gmail receipts",
            status: "connected",
            lastSyncedAt: new Date().toISOString(),
            transactionsFound: receipts.length,
            watchedSenders: ["receipts", "billing", "orders"],
          });
        }

        for (const receipt of receipts) {
          const sourceId = `gmail:${receipt.gmailMessageId}`;
          if (sanity.data.transactions.some((transaction) => transaction.source === sourceId)) continue;

          const merchant = sanity.upsertMerchant({
            name: receipt.merchantName,
            normalizedName: receipt.merchantName.toLowerCase(),
            defaultBucket: receipt.bucket,
            totalSpent: receipt.amount,
            transactionCount: 1,
            lastTransactionDate: receipt.date,
            currency: receipt.currency,
          });

          sanity.addTransaction({
            accountId: account.id,
            accountName: account.name,
            accountLast4: account.last4,
            merchantId: merchant.id,
            merchantName: merchant.name,
            rawDescription: receipt.rawDescription,
            amount: receipt.amount,
            currency: receipt.currency,
            date: receipt.date,
            categoryName: "Gmail receipt",
            bucket: receipt.bucket,
            source: sourceId,
            status: "approved",
            confidence: 0.72,
            verified: false,
            note: receipt.snippet,
          });
        }

        localStorage.setItem(LAST_SCAN_STORAGE_KEY, String(Date.now()));
      })
      .catch((error) => {
        console.warn("Gmail receipt scan skipped:", error);
      })
      .finally(() => {
        scanning.current = false;
      });
  }, [sanity]);

  return null;
}
