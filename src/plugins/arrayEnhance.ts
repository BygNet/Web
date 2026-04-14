declare global {
  interface Array<T> {
    randomElement(): T | undefined
    remove(value: T): boolean
  }
}

export default defineNuxtPlugin(() => {
  Array.prototype.randomElement = function <T>(this: T[]): T | undefined {
    if (this.length === 0) return undefined
    return this[Math.floor(Math.random() * this.length)]
  }

  Array.prototype.remove = function <T>(this: T[], value: T): boolean {
    const index: number = this.indexOf(value)
    if (index === -1) return false

    this.splice(index, 1)
    return true
  }
})
