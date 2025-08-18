// Utility formatters
export const usd2 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

export const nf0 = new Intl.NumberFormat("en-US");

export function pct2(x: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(x);
}

export function formatPct(p: number): string {
  return (p > 0 ? "+" : "") + pct2(p) + "%";
}

export function shortAddr(a: string): string {
  return a.slice(0, 6) + "…" + a.slice(-4);
}

export function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  return `${days} d ago`;
}

export function escapeHtml(s: string): string {
  return s.replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ] || m)
  );
}
