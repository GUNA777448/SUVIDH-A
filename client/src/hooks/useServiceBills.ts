import { useMemo, useState, useEffect } from "react";

export type UtilityService = "electricity" | "water";

export type UtilityBill = {
  id: string;
  service: UtilityService;
  month: string;
  amountMinor: number;
  amountLabel: string;
  dateLabel: string;
  status: "pending" | "paid";
  paidAt?: string;
  paymentMethod?: "upi" | "credit_card";
  transactionId?: string;
};

const BILLS_STORAGE_KEY = "suvidha_service_bills";

const defaultBills: UtilityBill[] = [
  {
    id: "electricity-2026-04",
    service: "electricity",
    month: "April 2026",
    amountMinor: 245000,
    amountLabel: "₹2,450",
    dateLabel: "Due: Apr 30",
    status: "pending",
  },
  {
    id: "electricity-2026-03",
    service: "electricity",
    month: "March 2026",
    amountMinor: 218000,
    amountLabel: "₹2,180",
    dateLabel: "Paid: Mar 28",
    status: "paid",
  },
  {
    id: "water-2026-04",
    service: "water",
    month: "April 2026",
    amountMinor: 185000,
    amountLabel: "₹1,850",
    dateLabel: "Due: Apr 30",
    status: "pending",
  },
  {
    id: "water-2026-03",
    service: "water",
    month: "March 2026",
    amountMinor: 168000,
    amountLabel: "₹1,680",
    dateLabel: "Paid: Mar 28",
    status: "paid",
  },
];

function toAmountLabel(amountMinor: number) {
  return `₹${(amountMinor / 100).toLocaleString("en-IN")}`;
}

function hydrateStoredBills(storedBills: unknown): UtilityBill[] {
  if (!Array.isArray(storedBills)) {
    return defaultBills;
  }

  const parsed = storedBills.filter(
    (item): item is UtilityBill =>
      Boolean(item) &&
      typeof item === "object" &&
      "id" in item &&
      "service" in item &&
      "month" in item,
  );

  const hydrated = parsed.length > 0 ? parsed : defaultBills;

  // When everything is already paid, restore defaults so the current cycle can be paid again.
  if (hydrated.every((bill) => bill.status === "paid")) {
    return defaultBills;
  }

  return hydrated;
}

export function useServiceBills() {
  const [bills, setBills] = useState<UtilityBill[]>(defaultBills);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(BILLS_STORAGE_KEY);
    if (!stored) {
      setBills(defaultBills);
      setIsLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setBills(hydrateStoredBills(parsed));
    } catch (_error) {
      setBills(defaultBills);
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    localStorage.setItem(BILLS_STORAGE_KEY, JSON.stringify(bills));
  }, [bills, isLoaded]);

  const getBillsByService = (service: UtilityService) =>
    bills.filter((bill) => bill.service === service);

  const getPendingBill = (service: UtilityService) =>
    bills.find(
      (bill) => bill.service === service && bill.status === "pending",
    ) || null;

  const markBillAsPaid = (params: {
    billId: string;
    paymentMethod: "upi" | "credit_card";
    transactionId: string;
  }) => {
    setBills((prev) =>
      prev.map((bill) => {
        if (bill.id !== params.billId) {
          return bill;
        }

        const paidDate = new Date();
        const paidLabel = `Paid: ${paidDate.toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        })}`;

        return {
          ...bill,
          status: "paid",
          dateLabel: paidLabel,
          paidAt: paidDate.toISOString(),
          paymentMethod: params.paymentMethod,
          transactionId: params.transactionId,
        };
      }),
    );
  };

  const serviceSummary = useMemo(() => {
    const electricityPending = getPendingBill("electricity");
    const waterPending = getPendingBill("water");

    return {
      electricityPending,
      waterPending,
    };
  }, [bills]);

  return {
    bills,
    getBillsByService,
    getPendingBill,
    markBillAsPaid,
    toAmountLabel,
    serviceSummary,
  };
}
