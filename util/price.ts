
export function parsePrice(text: string): number {
  const value = Number(text.replace(/[^0-9.-]/g, ''));

  if (Number.isNaN(value)) {
    throw new Error(`Could not parse a price from "${text}"`);
  }

  return value;
}