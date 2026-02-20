export type PrintBadgePayload = {
  id: string;
  name: string;
  organisation: string;
  role: string;
};

export async function printBadge(data: PrintBadgePayload) {
  try {
    const res = await fetch("http://127.0.0.1:8000/print/label", {
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
