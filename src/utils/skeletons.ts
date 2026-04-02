export function generateLines(lines: number): number[] {
  return Array.from({ length: lines }, () => {
    return Math.floor(Math.random() * 31) + 70
  })
}
