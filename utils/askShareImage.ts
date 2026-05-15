interface AskShareImageInput {
  username: string
  asksUrl: string
  content: string
  createdDate: string
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.trim().split(/\s+/)
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (ctx.measureText(nextLine).width <= maxWidth) {
      currentLine = nextLine
      continue
    }

    if (currentLine) {
      lines.push(currentLine)
    }
    currentLine = word

    if (lines.length >= maxLines) {
      break
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine)
  }

  if (lines.length > maxLines) {
    lines.length = maxLines
  }

  if (lines.length === maxLines && words.length > 0) {
    const lastIndex = lines.length - 1
    const lastLine = lines[lastIndex] ?? ''
    let truncated = lastLine
    while (ctx.measureText(`${truncated}…`).width > maxWidth && truncated) {
      truncated = truncated.slice(0, -1)
    }
    lines[lastIndex] = `${truncated}…`
  }

  return lines
}

async function toBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('Failed to render ask image'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

async function renderAskShareBlob(input: AskShareImageInput): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = 1600
  canvas.height = 1800

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Failed to create canvas context')
  }

  if ('fonts' in document && document.fonts?.ready) {
    await document.fonts.ready
  }

  const { width, height } = canvas

  ctx.scale(2, 2)

  const scaledWidth = width / 2
  const scaledHeight = height / 2

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, scaledWidth, scaledHeight)

  const cardX = 0
  const cardY = 0
  const cardWidth = scaledWidth
  const cardHeight = scaledHeight
  const headerHeight = 104

  ctx.fillStyle = '#ffe4f1'
  ctx.fillRect(
    cardX,
    cardY + headerHeight,
    cardWidth,
    cardHeight - headerHeight
  )

  const headerGradient = ctx.createLinearGradient(
    cardX,
    cardY,
    cardX + cardWidth,
    cardY
  )
  headerGradient.addColorStop(0, '#ff5db1')
  headerGradient.addColorStop(1, '#8b5cf6')

  ctx.fillStyle = headerGradient
  ctx.fillRect(cardX, cardY, cardWidth, headerHeight)

  ctx.textBaseline = 'top'

  ctx.fillStyle = '#ffffff'
  ctx.font = '800 44px "Wix Madefor Text"'
  ctx.fillText(`@${input.username}`, cardX + 36, cardY + 20)

  ctx.font = '500 24px "Wix Madefor Text"'
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
  ctx.fillText(
    new Date(input.createdDate).toLocaleDateString(),
    cardX + 36,
    cardY + 76
  )

  ctx.fillStyle = '#111111'
  ctx.font = '700 56px "Wix Madefor Text"'

  const lines = wrapText(ctx, input.content, cardWidth - 72, 6)

  let y = cardY + headerHeight + 58
  for (const line of lines) {
    ctx.fillText(line, cardX + 36, y)
    y += 64
  }

  const cleanUrl = input.asksUrl.replace(/^https?:\/\//, '')

  ctx.font = '600 26px "Wix Madefor Text"'
  const pillPaddingX = 24
  const pillHeight = 52
  const pillWidth = ctx.measureText(cleanUrl).width + pillPaddingX * 2
  const pillX = cardX + 36
  const pillY = cardY + cardHeight - 84

  ctx.fillStyle = 'rgba(139, 92, 246, 0.12)'
  ctx.beginPath()
  ctx.roundRect(pillX, pillY, pillWidth, pillHeight, 999)
  ctx.fill()

  ctx.fillStyle = 'rgba(80, 50, 120, 0.72)'
  ctx.fillText(cleanUrl, pillX + pillPaddingX, pillY + 13)

  return await toBlob(canvas)
}

export async function shareAskAsImage(
  input: AskShareImageInput
): Promise<void> {
  const blob = await renderAskShareBlob(input)
  const file = new File([ blob ], `byg-ask-${input.username}.png`, {
    type: 'image/png',
  })

  if (navigator.share && navigator.canShare?.({ files: [ file ] })) {
    await navigator.share({
      files: [ file ],
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = file.name
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}
