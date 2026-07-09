#!/usr/bin/env npx ts-node

/**
 * Seed Data Validation Script
 *
 * Validates all CSV seed files in data/seed/
 *
 * Checks:
 * - Row counts
 * - Empty required ID columns
 * - Duplicate IDs
 * - Malformed JSON columns
 *
 * Usage:
 *   npx ts-node scripts/validate-seed.ts
 *   # or
 *   npm run validate:seed
 */

import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

interface ValidationResult {
  file: string;
  rows: number;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  hasIdColumn: boolean;
  idColumnName: string | null;
}

interface ValidationError {
  type: "empty_id" | "duplicate_id" | "malformed_json" | "missing_column";
  row: number;
  value?: string;
  column?: string;
  message: string;
}

interface ValidationWarning {
  type: "no_id_column" | "empty_file" | "large_file";
  message: string;
}

interface ManifestEntry {
  filename: string;
  path: string;
  size_bytes: number;
  row_count: number;
  columns: string[];
  has_id_column: boolean;
  id_column: string | null;
  categories: string[];
  validation: {
    status: "pass" | "warning" | "error";
    errors: number;
    warnings: number;
  };
}

const SEED_DIR = path.join(process.cwd(), "data/seed");
const CATEGORIES: Record<string, string[]> = {
  vocabulary: ["vocabulary", "vocab"],
  grammar: ["grammar"],
  kanji: ["kanji", "radical"],
  kana: ["kana", "hiragana", "katakana"],
  particles: ["particle"],
  reading: ["reading", "passage"],
  quiz: ["quiz", "question"],
  lesson: ["lesson", "roadmap", "milestone"],
  srs: ["srs", "spaced", "card", "deck", "queue", "rating", "state", "algorithm"],
  achievement: ["achievement", "badge", "reward", "metric", "trigger", "anti", "xp", "level"],
  numbers: ["number", "counter", "calendar", "time"],
  symbols: ["symbol", "punctuation"],
};

function categorize(filename: string): string[] {
  const categories: string[] = [];
  const lower = filename.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORIES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      categories.push(category);
    }
  }

  return categories.length > 0 ? categories : ["other"];
}

function findIdColumn(columns: string[]): string | null {
  const idPatterns = ["_id", "id_", "^id$", "_key$", "^key_"];

  for (const col of columns) {
    const lower = col.toLowerCase();
    if (lower === "id" || lower.endsWith("_id")) {
      return col;
    }
  }

  // Check for other ID-like columns
  for (const col of columns) {
    if (col.toLowerCase().includes("id") || col.toLowerCase().includes("key")) {
      return col;
    }
  }

  return null;
}

function hasJsonColumns(columns: string[]): string[] {
  return columns.filter(
    (col) =>
      col.toLowerCase().endsWith("_json") ||
      col.toLowerCase().includes("_json_") ||
      col.toLowerCase().includes("json")
  );
}

function isValidJson(value: string): boolean {
  if (!value || value.trim() === "") return true; // Empty is valid

  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

function validateCsvFile(filepath: string): ValidationResult {
  const filename = path.basename(filepath);
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  const content = fs.readFileSync(filepath, "utf-8");
  const rows = Papa.parse(content, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  if (rows.errors.length > 0) {
    rows.errors.forEach((err) => {
      errors.push({
        type: "missing_column",
        row: err.row ?? 0,
        message: `CSV parse error: ${err.message}`,
      });
    });
  }

  const data = rows.data as Record<string, string>[];
  const columns = rows.meta.fields ?? [];
  const idColumn = findIdColumn(columns);
  const jsonColumns = hasJsonColumns(columns);

  if (data.length === 0) {
    warnings.push({
      type: "empty_file",
      message: "File is empty or has no data rows",
    });
  }

  if (!idColumn) {
    warnings.push({
      type: "no_id_column",
      message: "No ID column found - duplicate checking skipped",
    });
  }

  // Check for large files (> 1MB)
  const stats = fs.statSync(filepath);
  if (stats.size > 1024 * 1024) {
    warnings.push({
      type: "large_file",
      message: `Large file: ${(stats.size / 1024 / 1024).toFixed(2)} MB`,
    });
  }

  // Check for empty IDs and duplicates
  if (idColumn) {
    const seenIds = new Map<string, number>();
    const ids = new Set<string>();

    data.forEach((row, index) => {
      const idValue = row[idColumn];

      // Check empty ID
      if (!idValue || idValue.trim() === "") {
        errors.push({
          type: "empty_id",
          row: index + 2, // +2 for 1-indexed and header row
          value: idValue ?? "(empty)",
          column: idColumn,
          message: `Empty ID in ${idColumn} column`,
        });
      } else {
        ids.add(idValue);

        // Track duplicates
        if (seenIds.has(idValue)) {
          errors.push({
            type: "duplicate_id",
            row: index + 2,
            value: idValue,
            column: idColumn,
            message: `Duplicate ID '${idValue}' (first seen at row ${seenIds.get(idValue)})`,
          });
        } else {
          seenIds.set(idValue, index + 2);
        }
      }

      // Check JSON columns
      jsonColumns.forEach((col) => {
        const value = row[col];
        if (value && !isValidJson(value)) {
          errors.push({
            type: "malformed_json",
            row: index + 2,
            value: value.substring(0, 50) + (value.length > 50 ? "..." : ""),
            column: col,
            message: `Invalid JSON in ${col}: ${value.substring(0, 30)}...`,
          });
        }
      });
    });
  }

  return {
    file: filename,
    rows: data.length,
    errors,
    warnings,
    hasIdColumn: !!idColumn,
    idColumnName: idColumn,
  };
}

function generateManifest(results: ValidationResult[]): ManifestEntry[] {
  return results.map((r) => {
    const filepath = path.join(SEED_DIR, r.file);
    const stats = fs.statSync(filepath);

    return {
      filename: r.file,
      path: `data/seed/${r.file}`,
      size_bytes: stats.size,
      row_count: r.rows,
      columns: [], // Will be populated from CSV
      has_id_column: r.hasIdColumn,
      id_column: r.idColumnName,
      categories: categorize(r.file),
      validation: {
        status:
          r.errors.length > 0
            ? "error"
            : r.warnings.length > 0
              ? "warning"
              : "pass",
        errors: r.errors.length,
        warnings: r.warnings.length,
      },
    };
  });
}

function printReport(results: ValidationResult[]): void {
  console.log("\n" + "=".repeat(80));
  console.log("SEED DATA VALIDATION REPORT");
  console.log("=".repeat(80) + "\n");

  let totalRows = 0;
  let totalErrors = 0;
  let totalWarnings = 0;

  for (const result of results) {
    totalRows += result.rows;
    totalErrors += result.errors.length;
    totalWarnings += result.warnings.length;

    const statusIcon =
      result.errors.length > 0
        ? "❌"
        : result.warnings.length > 0
          ? "⚠️"
          : "✅";

    console.log(`${statusIcon} ${result.file}`);
    console.log(`   Rows: ${result.rows.toLocaleString()}`);
    if (result.idColumnName) {
      console.log(`   ID Column: ${result.idColumnName}`);
    }

    if (result.errors.length > 0) {
      console.log(`   Errors (${result.errors.length}):`);
      result.errors.slice(0, 5).forEach((err) => {
        console.log(`     - [Row ${err.row}] ${err.message}`);
      });
      if (result.errors.length > 5) {
        console.log(`     ... and ${result.errors.length - 5} more errors`);
      }
    }

    if (result.warnings.length > 0) {
      console.log(`   Warnings (${result.warnings.length}):`);
      result.warnings.forEach((warn) => {
        console.log(`     - ${warn.message}`);
      });
    }

    console.log();
  }

  console.log("-".repeat(80));
  console.log("\nSUMMARY:");
  console.log(`  Total Files:    ${results.length}`);
  console.log(`  Total Rows:     ${totalRows.toLocaleString()}`);
  console.log(`  Total Errors:   ${totalErrors}`);
  console.log(`  Total Warnings: ${totalWarnings}`);

  const passCount = results.filter(
    (r) => r.errors.length === 0 && r.warnings.length === 0
  ).length;
  const warnCount = results.filter(
    (r) => r.errors.length === 0 && r.warnings.length > 0
  ).length;
  const errorCount = results.filter((r) => r.errors.length > 0).length;

  console.log("\nSTATUS:");
  console.log(`  ✅ Pass:   ${passCount}`);
  console.log(`  ⚠️  Warn:   ${warnCount}`);
  console.log(`  ❌ Error:  ${errorCount}`);

  console.log("\n" + "=".repeat(80));

  if (totalErrors === 0) {
    console.log("\n🎉 All seed files passed validation!");
  } else {
    console.log(`\n⚠️  ${totalErrors} validation error(s) found. Review above.`);
  }

  console.log("");
}

async function main(): Promise<void> {
  console.log("Validating seed files in:", SEED_DIR);

  // Get all CSV files
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".csv"))
    .sort();

  if (files.length === 0) {
    console.log("No CSV files found in data/seed/");
    return;
  }

  console.log(`Found ${files.length} CSV files\n`);

  // Validate each file
  const results: ValidationResult[] = [];

  for (const file of files) {
    const filepath = path.join(SEED_DIR, file);
    try {
      const result = validateCsvFile(filepath);
      results.push(result);
    } catch (err) {
      console.error(`Error validating ${file}:`, err);
      results.push({
        file,
        rows: 0,
        errors: [
          {
            type: "missing_column",
            row: 0,
            message: `Failed to parse: ${(err as Error).message}`,
          },
        ],
        warnings: [],
        hasIdColumn: false,
        idColumnName: null,
      });
    }
  }

  // Print report
  printReport(results);

  // Generate manifest
  const manifest = generateManifest(results);

  // Write JSON manifest
  const manifestJsonPath = path.join(SEED_DIR, "seed-manifest.json");
  fs.writeFileSync(manifestJsonPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest written to: ${manifestJsonPath}`);

  // Write Markdown manifest
  let md = "# Seed Data Manifest\n\n";
  md += `Generated: ${new Date().toISOString()}\n\n`;
  md += "## Summary\n\n";
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Files | ${results.length} |\n`;
  md += `| Total Rows | ${results.reduce((sum, r) => sum + r.rows, 0).toLocaleString()} |\n`;
  md += `| Pass | ${results.filter((r) => r.errors.length === 0 && r.warnings.length === 0).length} |\n`;
  md += `| Warning | ${results.filter((r) => r.errors.length === 0 && r.warnings.length > 0).length} |\n`;
  md += `| Error | ${results.filter((r) => r.errors.length > 0).length} |\n\n`;

  md += "## Files\n\n";
  md += `| File | Rows | Categories | Status |\n`;
  md += `|------|------|------------|--------|\n`;

  for (const r of results) {
    const status =
      r.errors.length > 0
        ? "❌ Error"
        : r.warnings.length > 0
          ? "⚠️ Warning"
          : "✅ Pass";
    md += `| ${r.file} | ${r.rows.toLocaleString()} | ${categorize(r.file).join(", ")} | ${status} |\n`;
  }

  const manifestMdPath = path.join(SEED_DIR, "seed-manifest.md");
  fs.writeFileSync(manifestMdPath, md);
  console.log(`Markdown manifest written to: ${manifestMdPath}`);

  // Exit with error code if there are errors
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  process.exit(totalErrors > 0 ? 1 : 0);
}

main().catch(console.error);
