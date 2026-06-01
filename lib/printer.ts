export type PrintBadgePayload = {
  transport: string;
  destination: string;
  id: string;
  name: string;
  organisation: string;
  role: string;
  event: string;
  type: string;
};

const BASE_URL = process.env.NEXT_PUBLIC_PRINTER_SERVER_URL;

export type PrintMealCouponPayload = {
  id: string;
};

export async function printBadge(data: PrintBadgePayload) {
  try {
    console.log("Printing badge with data:", data);
    console.log("Base URL:", BASE_URL);
    const res = await fetch(`${BASE_URL}/print/label`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Printer API error");
    }

    return await res.json();
  } catch (err) {
    console.error("Print error:", err);
    throw err;
  }
}

export async function printMealCoupon(data: PrintMealCouponPayload) {
  try {
    const res = await fetch(`${BASE_URL}/print/meal-coupon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Printer API error");
    }

    return await res.json();
  } catch (err) {
    console.error("Print error:", err);
    throw err;
  }
}

export async function detectPrinters(): Promise<string[]> {
  try {
    const res = await fetch(`${BASE_URL}/detect/printers`);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Printer API error");
    }
    return await res.json();
  } catch (err) {
    console.error("Error fetching printers:", err);
    throw err;
  }
}
