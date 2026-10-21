export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(
  amount: number | null,
  currency = "GBP",
  priceType = "from"
) {
  if (amount === null || amount === undefined) return "Price on enquiry";
  const value = new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
  return priceType === "fixed" ? value : `from ${value}`;
}

export function normalisePostcode(postcode: string) {
  return postcode.replace(/\s+/g, "").toUpperCase();
}

export function titleCase(value: string) {
  return value
    .toLowerCase()
    .split(/[\s_-]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");
}
