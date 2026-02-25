export type PrintBadgePayload = {
  id: string;
  name: string;
  organisation: string;
  role: string;
  transport: string;
  destination: string;
};

export async function printBadge(data: PrintBadgePayload) {
  try {
    const res = await fetch("http://192.168.127.1:8000/print/label", {
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

export async function printMealCoupon(id: string) {}
