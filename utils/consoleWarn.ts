export function consoleWarn(): void {
  console.log(
    '%cWarning!',
    `
      font-size: 4rem;
      font-weight: 800;
      color: red;
      text-shadow: 0 2px 0 rgba(0,0,0,0.4);
    `
  )

  console.log(
    '%cDo NOT copy and paste values from here and send them to others!',
    `
      font-size: 1.5rem;
      color: orange;
    `
  )

  console.log(
    "%cIf you don't know what you're doing, please close this panel.",
    `
      font-size: 1rem;
    `
  )

  console.log('Byg staff will never ask for your password or token.')
}
