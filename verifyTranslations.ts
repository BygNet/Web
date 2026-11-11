import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

type JsonValue = null | boolean | number | string | JsonValue[] | JsonObject
type JsonObject = { [key: string]: JsonValue }

type ConfiguredLocale = {
  code: string
  name?: string
  file?: string | { path?: string }
  files?: (string | { path?: string })[]
}

type NuxtI18nConfig = {
  langDir?: string
  restructureDir?: string
  locales?: ConfiguredLocale[]
}

type NuxtConfig = {
  i18n?: NuxtI18nConfig
}

type LocaleFile = {
  absolutePath: string
  displayPath: string
  keys: Set<string>
  leafKeys: Set<string>
}

type LocaleReport = {
  code: string
  name: string
  files: LocaleFile[]
  keys: Set<string>
  leafKeys: Set<string>
}

type Discrepancy = {
  locale: string
  key: string
  presentIn: string[]
}

type DeadKey = {
  key: string
  locales: string[]
  files: string[]
}

type TranslationReport = {
  rootDir: string
  langDir: string
  locales: LocaleReport[]
  configuredFiles: LocaleFile[]
  discrepancies: Discrepancy[]
  deadKeys: DeadKey[]
  searchFileCount: number
  errors: string[]
}

function isObject(value: JsonValue): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function collectKeys(
  value: JsonValue,
  prefix = ''
): { keys: Set<string>; leafKeys: Set<string> } {
  const keys = new Set<string>()
  const leafKeys = new Set<string>()

  if (!isObject(value)) {
    if (prefix) {
      keys.add(prefix)
      leafKeys.add(prefix)
    }
    return { keys, leafKeys }
  }

  for (const [ key, child ] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    keys.add(fullKey)

    if (isObject(child) && Object.keys(child).length > 0) {
      const nested = collectKeys(child, fullKey)
      for (const nestedKey of nested.keys) keys.add(nestedKey)
      for (const nestedLeafKey of nested.leafKeys) leafKeys.add(nestedLeafKey)
    } else {
      leafKeys.add(fullKey)
    }
  }

  return { keys, leafKeys }
}

function sorted(values: Iterable<string>): string[] {
  return [ ...values ].sort((a, b) => a.localeCompare(b))
}

function relativeToRoot(rootDir: string, filePath: string): string {
  return path.relative(rootDir, filePath) || path.basename(filePath)
}

function normalizeConfiguredFiles(files: ConfiguredLocale['files']): string[] {
  if (!Array.isArray(files)) return []
  return files.flatMap(file =>
    typeof file === 'string' || typeof file?.path !== 'string'
      ? typeof file === 'string'
        ? [ file ]
        : []
      : [ file.path ]
  )
}

async function loadNuxtConfig(rootDir: string): Promise<NuxtConfig> {
  const configPath = path.join(rootDir, 'nuxt.config.ts')
  const configUrl = `${pathToFileURL(configPath).href}?verifyTranslations=${Date.now()}`
  const configModule = await import(configUrl)
  return (configModule.default ?? configModule) as NuxtConfig
}

async function readConfiguredFile(
  rootDir: string,
  langDir: string,
  localeCode: string,
  configuredPath: string
): Promise<LocaleFile> {
  const absolutePath = path.resolve(rootDir, langDir, configuredPath)
  const displayPath = relativeToRoot(rootDir, absolutePath)
  const contents = await readFile(absolutePath, 'utf8')
  const json = JSON.parse(contents) as JsonValue
  const { keys, leafKeys } = collectKeys(json)

  return {
    absolutePath,
    displayPath: `${localeCode}: ${displayPath}`,
    keys,
    leafKeys,
  }
}

async function listSearchFiles(rootDir: string): Promise<string[]> {
  try {
    const { stdout } = await execFileAsync(
      'git',
      [
        '-C',
        rootDir,
        'ls-files',
        '--cached',
        '--others',
        '--exclude-standard',
        '-z',
      ],
      { encoding: 'buffer' }
    )

    return stdout
      .toString('utf8')
      .split('\0')
      .filter(Boolean)
      .map(filePath => path.resolve(rootDir, filePath))
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Could not ask Git for the non-ignored codebase files: ${reason}`
    )
  }
}

function isBinary(contents: Buffer): boolean {
  const sampleLength = Math.min(contents.length, 8_192)
  for (let index = 0; index < sampleLength; index++) {
    if (contents[index] === 0) return true
  }
  return false
}

async function findDeadKeys(
  rootDir: string,
  configuredFiles: LocaleFile[],
  locales: LocaleReport[]
): Promise<{ deadKeys: DeadKey[]; searchFileCount: number }> {
  const configuredPaths = new Set(
    configuredFiles.map(file => path.normalize(file.absolutePath))
  )
  const searchFiles = (await listSearchFiles(rootDir)).filter(
    filePath => !configuredPaths.has(path.normalize(filePath))
  )
  const searchableContents: string[] = []

  for (const filePath of searchFiles) {
    let contents: Buffer
    try {
      contents = await readFile(filePath)
    } catch {
      continue
    }

    if (isBinary(contents)) continue
    searchableContents.push(contents.toString('utf8'))
  }

  const keyLocales = new Map<string, Set<string>>()
  const keyFiles = new Map<string, Set<string>>()

  for (const locale of locales) {
    for (const file of locale.files) {
      for (const key of file.leafKeys) {
        if (!keyLocales.has(key)) keyLocales.set(key, new Set())
        if (!keyFiles.has(key)) keyFiles.set(key, new Set())
        keyLocales.get(key)!.add(locale.code)
        keyFiles.get(key)!.add(file.displayPath)
      }
    }
  }

  const deadKeys: DeadKey[] = []
  for (const key of sorted(keyLocales.keys())) {
    const isUsed = searchableContents.some(contents => contents.includes(key))
    if (isUsed) continue

    deadKeys.push({
      key,
      locales: sorted(keyLocales.get(key)!),
      files: sorted(keyFiles.get(key)!),
    })
  }

  return { deadKeys, searchFileCount: searchableContents.length }
}

export async function buildTranslationReport(
  rootDir = process.cwd()
): Promise<TranslationReport> {
  const config = await loadNuxtConfig(rootDir)
  const i18n = config.i18n

  if (!i18n || !Array.isArray(i18n.locales)) {
    throw new Error('i18n.locales not found or invalid in nuxt.config.ts')
  }
  if (typeof i18n.langDir !== 'string' || i18n.langDir.length === 0) {
    throw new Error('i18n.langDir not found or invalid in nuxt.config.ts')
  }

  const langDirRoot = path.resolve(
    rootDir,
    i18n.restructureDir ?? 'i18n',
    i18n.langDir
  )

  const locales: LocaleReport[] = []
  const configuredFiles: LocaleFile[] = []
  const errors: string[] = []

  for (const configuredLocale of i18n.locales) {
    if (!configuredLocale || typeof configuredLocale.code !== 'string') {
      errors.push('A locale in nuxt.config.ts is missing a valid code.')
      continue
    }

    const locale: LocaleReport = {
      code: configuredLocale.code,
      name: configuredLocale.name ?? configuredLocale.code,
      files: [],
      keys: new Set(),
      leafKeys: new Set(),
    }

    const files = normalizeConfiguredFiles(
      configuredLocale.files ??
        (configuredLocale.file === undefined ? [] : [ configuredLocale.file ])
    )
    if (files.length === 0) {
      errors.push(`${locale.code}: no files are listed in nuxt.config.ts.`)
    }

    for (const configuredPath of files) {
      try {
        const file = await readConfiguredFile(
          rootDir,
          langDirRoot,
          locale.code,
          configuredPath
        )
        locale.files.push(file)
        configuredFiles.push(file)
        for (const key of file.keys) locale.keys.add(key)
        for (const key of file.leafKeys) locale.leafKeys.add(key)
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        errors.push(`${locale.code}: ${configuredPath} — ${reason}`)
      }
    }

    locales.push(locale)
  }

  const allKeys = new Set<string>()
  for (const locale of locales) {
    for (const key of locale.leafKeys) allKeys.add(key)
  }

  const discrepancies: Discrepancy[] = []
  for (const locale of locales) {
    for (const key of sorted(allKeys)) {
      if (locale.leafKeys.has(key)) continue
      discrepancies.push({
        locale: locale.code,
        key,
        presentIn: locales
          .filter(candidate => candidate.leafKeys.has(key))
          .map(candidate => candidate.code),
      })
    }
  }

  const { deadKeys, searchFileCount } = await findDeadKeys(
    rootDir,
    configuredFiles,
    locales
  )

  return {
    rootDir,
    langDir: i18n.langDir,
    locales,
    configuredFiles,
    discrepancies,
    deadKeys,
    searchFileCount,
    errors,
  }
}

function color(text: string, code: number): string {
  if (!process.stdout.isTTY) return text
  return `\x1b[${code}m${text}\x1b[0m`
}

function heading(text: string): void {
  console.log(`\n${color(text, 36)}`)
  console.log(color('─'.repeat(text.length), 90))
}

function printSummary(report: TranslationReport): void {
  const keyCount = new Set(
    report.locales.flatMap(locale => [ ...locale.leafKeys ])
  ).size
  const discrepancyLocales = new Set(
    report.discrepancies.map(discrepancy => discrepancy.locale)
  ).size
  const status =
    report.errors.length > 0
      ? color('ERRORS FOUND', 31)
      : report.discrepancies.length > 0 || report.deadKeys.length > 0
        ? color('ISSUES FOUND', 33)
        : color('OK', 32)

  heading('Translation verification')
  console.log(`Status: ${status}`)
  console.log(`Languages: ${report.locales.length}`)
  console.log(`Configured locale files: ${report.configuredFiles.length}`)
  console.log(`Unique leaf keys: ${keyCount}`)
  console.log(
    `Language discrepancies: ${report.discrepancies.length} missing entries across ${discrepancyLocales} language(s)`
  )
  console.log(`Dead localization keys: ${report.deadKeys.length}`)
  console.log(`Codebase files searched: ${report.searchFileCount}`)

  if (report.errors.length > 0) {
    console.log(color(`Configuration/file errors: ${report.errors.length}`, 31))
  }
}

function printErrors(report: TranslationReport): void {
  if (report.errors.length === 0) {
    console.log('\nNo configuration or file errors.')
    return
  }

  heading('Configuration and file errors')
  for (const error of report.errors) console.log(color(`• ${error}`, 31))
}

async function paginate(
  title: string,
  lines: string[],
  ask: (prompt: string) => Promise<string>
): Promise<void> {
  const pageSize = 20
  let page = 0

  while (true) {
    const pageCount = Math.max(1, Math.ceil(lines.length / pageSize))
    const start = page * pageSize
    const pageLines = lines.slice(start, start + pageSize)

    heading(`${title} (${page + 1}/${pageCount})`)
    if (pageLines.length === 0) console.log('Nothing to show.')
    else for (const line of pageLines) console.log(line)

    if (pageCount === 1) {
      await ask('\nPress Enter to go back: ')
      return
    }

    const answer = (await ask('\n[n]ext, [p]revious, [q]uit list: '))
      .trim()
      .toLowerCase()
    if (answer === 'q' || answer === '') return
    if (answer === 'n' && page < pageCount - 1) page++
    if (answer === 'p' && page > 0) page--
  }
}

async function showDiscrepancies(
  report: TranslationReport,
  ask: (prompt: string) => Promise<string>
): Promise<void> {
  if (report.discrepancies.length === 0) {
    console.log('\nNo language discrepancies found.')
    await ask('Press Enter to go back: ')
    return
  }

  const byLocale = new Map<string, Discrepancy[]>()
  for (const discrepancy of report.discrepancies) {
    if (!byLocale.has(discrepancy.locale)) byLocale.set(discrepancy.locale, [])
    byLocale.get(discrepancy.locale)!.push(discrepancy)
  }

  while (true) {
    heading('Language discrepancies')
    for (const locale of report.locales) {
      const count = byLocale.get(locale.code)?.length ?? 0
      console.log(
        `${locale.code.padEnd(4)} ${locale.name.padEnd(16)} ${count} missing key(s)`
      )
    }

    const answer = (
      await ask('\nEnter a language code to inspect, or [b]ack: ')
    )
      .trim()
      .toLowerCase()
    if (answer === 'b' || answer === '') return

    const locale = report.locales.find(
      candidate => candidate.code.toLowerCase() === answer
    )
    if (!locale) {
      console.log(`Unknown language: ${answer}`)
      continue
    }

    const discrepancies = byLocale.get(locale.code) ?? []
    await paginate(
      `${locale.code} — missing keys`,
      discrepancies.map(
        discrepancy =>
          `• ${discrepancy.key}  (present in: ${discrepancy.presentIn.join(', ')})`
      ),
      ask
    )
  }
}

async function showDeadKeys(
  report: TranslationReport,
  ask: (prompt: string) => Promise<string>
): Promise<void> {
  await paginate(
    'Dead localization keys',
    report.deadKeys.map(
      deadKey =>
        `• ${deadKey.key}  [${deadKey.locales.join(', ')}]  ${deadKey.files.join(', ')}`
    ),
    ask
  )
}

async function showConfiguredFiles(
  report: TranslationReport,
  ask: (prompt: string) => Promise<string>
): Promise<void> {
  await paginate(
    `Configured files (${report.langDir})`,
    report.configuredFiles.map(file => `• ${file.displayPath}`),
    ask
  )
}

async function runInteractive(report: TranslationReport): Promise<boolean> {
  printSummary(report)

  const valid =
    report.errors.length === 0 &&
    report.discrepancies.length === 0 &&
    report.deadKeys.length === 0

  if (
    process.argv.includes('--non-interactive') ||
    !process.stdin.isTTY ||
    !process.stdout.isTTY
  ) {
    console.log(
      '\nRun this command in a terminal to inspect the issue lists interactively.'
    )
    printErrors(report)
    return valid
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const ask = (prompt: string): Promise<string> => readline.question(prompt)

  try {
    while (true) {
      heading('Inspect report')
      console.log('1. Language discrepancies')
      console.log('2. Dead localization keys')
      console.log('3. Configured locale files')
      console.log('4. Configuration and file errors')
      console.log('q. Quit')

      const answer = (await ask('\nChoose an option: ')).trim().toLowerCase()
      if (answer === 'q' || answer === '') break
      if (answer === '1') await showDiscrepancies(report, ask)
      else if (answer === '2') await showDeadKeys(report, ask)
      else if (answer === '3') await showConfiguredFiles(report, ask)
      else if (answer === '4') {
        printErrors(report)
        await ask('\nPress Enter to go back: ')
      } else console.log(`Unknown option: ${answer}`)
    }
  } finally {
    readline.close()
  }

  return valid
}

export async function verifyTranslations(): Promise<boolean> {
  const report = await buildTranslationReport()
  return runInteractive(report)
}

const isMain = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false

if (isMain) {
  if (process.argv.includes('--help')) {
    console.log(
      'Usage: bun run utils/verifyTranslations.ts [--non-interactive]'
    )
    process.exit(0)
  }

  try {
    const valid = await verifyTranslations()
    process.exitCode = valid ? 0 : 1
  } catch (error) {
    console.error(
      color(error instanceof Error ? error.message : String(error), 31)
    )
    process.exitCode = 1
  }
}
