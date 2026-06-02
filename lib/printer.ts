export type PrinterPayload = {
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

export async function printBadge(data: PrinterPayload) {
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
      console.log("Printer API error response:", text);
      throw new Error(text || "Printer API error");
    }

    return await res.json();
  } catch (err) {
    console.error("Print error:", err);
    throw err;
  }
}

export async function printMealCoupon(data: PrinterPayload) {
  try {
    const res = await fetch(`${BASE_URL}/print/meal-coupon`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      console.error("Printer API error:", error);
      throw new Error(JSON.stringify(error));
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
