/** Chromium-style tab shortcuts: 1–8 by position; 9 selects the final tab. */
export function tabIndexForShortcut(key: string, tabCount: number): number | null {
  if (!/^[1-9]$/.test(key)) return null;
  const index = key === '9' ? tabCount - 1 : Number(key) - 1;
  return index >= 0 && index < tabCount ? index : null;
}
