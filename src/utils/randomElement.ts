export {}

declare global {
  interface Array<T> {
    randomElement(): T | undefined
  }
}

Array.prototype.randomElement = function <T>(this: T[]): T | undefined {
  if (this.length === 0) return undefined
  return this[Math.floor(Math.random() * this.length)]
}
