import { createClient } from '@supabase/supabase-js'
import * as Papa from 'papaparse'
import * as fs from 'fs'
import * as path from 'path'

// ─── Load .env.local automatically (tsx doesn't read it by default) ───────────
;(function loadEnvLocal() {
  const envPath = path.resolve(process.cwd(), '.env.local')
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) {
      process.env[key] = value
    }
  }
})()

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeedError {
  file: string
  row: number
  id: string
  message: string
  severity: 'warning' | 'error'
}

export interface ImportResult {
  table: string
  file: string
  success: boolean
  upserted: number
  skipped: number
  errors: SeedError[]
}

export interface DryRunReport {
  mode: 'validate' | 'dry-run' | 'import'
  timestamp: string
  results: ImportResult[]
  summary: {
    totalTables: number
    totalUpserted: number
    totalSkipped: number
    totalErrors: number
  }
  envCheck: {
    hasSupabaseUrl: boolean
    hasServiceRoleKey: boolean
  }
}

// ─── Environment ─────────────────────────────────────────────────────────────

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL is not set. ' +
        'Add it to your .env.local file.'
    )
  }
  return url
}

export function getServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is not set. ' +
        'Add it to your .env.local file (server-side only).'
    )
  }
  return key
}

export type SeedClient = ReturnType<typeof createClient>

export function createServiceClient(): SeedClient {
  return createClient(getSupabaseUrl(), getServiceRoleKey(), {
    auth: { persistSession: false },
  })
}

// ─── CSV Reading ──────────────────────────────────────────────────────────────

export function readCsv<T = Record<string, string>>(
  filePath: string
): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Required seed file not found: ${filePath}`)
  }

  const content = fs.readFileSync(filePath, 'utf-8')
  const result = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  })

  if (result.errors.length > 0) {
    // Only crash on parse errors that prevent reading
    const critical = result.errors.filter((e) => !e.type.includes('Quotes'))
    if (critical.length > 0) {
      console.error('CSV parse errors:', critical)
    }
  }

  return result.data
}

// ─── Extra Columns (raw_data) ─────────────────────────────────────────────────

/**
 * Extract columns that are NOT in the known schema fields.
 * These get stored as raw_data JSONB.
 */
export function extractExtraColumns<T extends object>(
  row: T,
  knownFields: string[]
): Record<string, unknown> {
  const extra: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
    if (
      knownFields.includes(key) ||
      key === 'id' ||
      value === '' ||
      value === undefined ||
      value === null
    ) {
      continue
    }
    extra[key] = value
  }
  return Object.keys(extra).length > 0 ? extra : {}
}

// ─── Supabase Upsert ───────────────────────────────────────────────────────────

export async function upsertRows(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  rows: Record<string, unknown>[],
  conflictTarget = 'id'
): Promise<{ upserted: number; errors: SeedError[] }> {
  if (rows.length === 0) {
    return { upserted: 0, errors: [] }
  }

  const errors: SeedError[] = []
  let upserted = 0

  // Batch upsert in chunks of 100
  const CHUNK = 100
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict: conflictTarget })
      .select('id')

    if (error) {
      chunk.forEach((row, idx) => {
        errors.push({
          file: table,
          row: i + idx + 1,
          id: String(row.id ?? 'unknown'),
          message: error.message,
          severity: 'error',
        })
      })
      continue
    }

    upserted += data?.length ?? 0
  }

  return { upserted, errors }
}

// ─── Report Helpers ───────────────────────────────────────────────────────────

export function printReport(report: DryRunReport): void {
  const { mode, timestamp, results, summary, envCheck } = report

  console.log('\n' + '═'.repeat(70))
  console.log(`  📦 Seed Import Report  |  Mode: ${mode.toUpperCase()}  |  ${timestamp}`)
  console.log('═'.repeat(70))

  if (!envCheck.hasSupabaseUrl || !envCheck.hasServiceRoleKey) {
    console.log('\n  ⚠️  Environment not configured — dry-run only')
    console.log(
      `     NEXT_PUBLIC_SUPABASE_URL: ${envCheck.hasSupabaseUrl ? '✓' : '✗'}`
    )
    console.log(
      `     SUPABASE_SERVICE_ROLE_KEY: ${envCheck.hasServiceRoleKey ? '✓' : '✗'}`
    )
  }

  for (const r of results) {
    const icon = r.success ? '✅' : r.errors.length > 0 ? '⚠️' : '❌'
    const raw = r.errors.filter((e) => e.severity === 'error').length
    const warn = r.errors.filter((e) => e.severity === 'warning').length
    const extra = [raw ? `${raw} error(s)` : '', warn ? `${warn} warning(s)` : '']
      .filter(Boolean)
      .join(', ')

    console.log(
      `\n  ${icon} ${r.table.padEnd(32)} | upserted: ${String(r.upserted).padStart(4)} | skipped: ${String(r.skipped).padStart(4)}${extra ? ` | ${extra}` : ''}`
    )
    if (r.errors.length > 0 && mode !== 'validate') {
      for (const e of r.errors.slice(0, 5)) {
        console.log(`     └─ Row ${e.row} [${e.id}]: ${e.message}`)
      }
      if (r.errors.length > 5) {
        console.log(`     └─ ...and ${r.errors.length - 5} more errors`)
      }
    }
  }

  console.log('\n' + '─'.repeat(70))
  console.log(
    `  Summary: ${summary.totalTables} tables | ${summary.totalUpserted} upserted | ${summary.totalSkipped} skipped | ${summary.totalErrors} error(s)`
  )
  console.log('═'.repeat(70) + '\n')
}

// ─── Path Helpers ─────────────────────────────────────────────────────────────

export function seedPath(filename: string): string {
  return path.join(process.cwd(), 'data', 'seed', filename)
}

// ─── JSON Helpers ─────────────────────────────────────────────────────────────

/**
 * Safely parse a JSON string field from CSV.
 * Returns null on parse failure (doesn't crash).
 */
export function parseJsonField<T = unknown>(
  value: string | undefined | null
): T | null {
  if (!value || value === '' || value === '{}') return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

/**
 * Parse a JSON string array field like `"["a","b"]"` or just `"a|b"`.
 */
export function parseArrayField(
  value: string | undefined | null,
  delimiter = '|'
): string[] {
  if (!value || value === '') return []
  // Try JSON parse first
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.map(String)
  } catch {
    // Fallback to pipe-delimited
    return value.split(delimiter).filter(Boolean).map((s) => s.trim())
  }
  return []
}
