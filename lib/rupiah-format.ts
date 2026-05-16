/** Strip Rupiah display formatting; keep plain digits or text-only values (e.g. Negotiable). */
export function parseRupiahToPlain(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!/\d/.test(trimmed)) return trimmed;

  if (/-/.test(trimmed)) {
    const segments = trimmed.split(/\s*-\s*/);
    const nums = segments.map((s) => s.replace(/\D/g, "")).filter(Boolean);
    if (nums.length >= 2) return `${nums[0]}-${nums[1]}`;
    if (nums.length === 1) return nums[0];
    return "";
  }

  return trimmed.replace(/\D/g, "");
}

function formatAmount(digits: string): string {
  if (!digits) return "";
  const n = Number(digits);
  if (!Number.isFinite(n)) return digits;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

/** Format salary for form input or public display from raw DB / user input. */
export function formatRupiahInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";

  if (!/\d/.test(trimmed)) return trimmed;

  const plain = parseRupiahToPlain(trimmed);
  if (!plain || !/\d/.test(plain)) return trimmed;

  if (plain.includes("-")) {
    const [min, max] = plain.split("-", 2);
    const left = formatAmount(min);
    const right = formatAmount(max ?? "");
    if (left && right) return `${left} - ${right}`;
    if (left) return `${left} - `;
    return left;
  }

  return formatAmount(plain);
}

/** Format stored plain salary for read-only display. */
export function formatSalaryDisplay(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  return formatRupiahInput(value);
}
