import mongoose, { AnyBulkWriteOperation } from 'mongoose';
import { join } from 'path';
import { readFileSync } from 'fs';
import connectToDb from '../db/db';
import { Category } from '../models/category.model';
import dotenv from 'dotenv';

dotenv.config({
    path: './.env',
});

// ─── Types ────────────────────────────────────────────────────────────────────

interface CategorySeedItem {
    name: string;
    tags: string[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const JSON_PATH: string = join(__dirname, 'categories.json');

// ─── Logger ───────────────────────────────────────────────────────────────────

const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
} as const;

const log = {
    info: (msg: string): void =>
        console.log(`${colors.cyan}ℹ${colors.reset}  ${msg}`),
    success: (msg: string): void =>
        console.log(`${colors.green}✔${colors.reset}  ${msg}`),
    warn: (msg: string): void =>
        console.log(`${colors.yellow}⚠${colors.reset}  ${msg}`),
    error: (msg: string): void =>
        console.log(`${colors.red}✖${colors.reset}  ${msg}`),
    dim: (msg: string): void =>
        console.log(`${colors.dim}   ${msg}${colors.reset}`),
};

// ─── Load JSON ────────────────────────────────────────────────────────────────

function loadCategories(): CategorySeedItem[] {
    try {
        const raw = readFileSync(JSON_PATH, 'utf-8');
        const data: unknown = JSON.parse(raw);

        if (!Array.isArray(data)) {
            throw new Error('JSON root must be an array of category objects.');
        }

        return data as CategorySeedItem[];
    } catch (err) {
        log.error(`Failed to load JSON: ${(err as Error).message}`);
        process.exit(1);
    }
}

// ─── Validate ─────────────────────────────────────────────────────────────────

function validate(categories: CategorySeedItem[]): void {
    const errors: string[] = [];

    categories.forEach((cat, idx) => {
        if (!cat.name || typeof cat.name !== 'string') {
            errors.push(`[${idx}] Missing or invalid "name" field.`);
        }
        if (!Array.isArray(cat.tags) || cat.tags.length === 0) {
            errors.push(`[${idx}] "${cat.name}" has no tags array.`);
        }
    });

    if (errors.length) {
        log.error('Validation errors found:');
        errors.forEach((e) => log.dim(e));
        process.exit(1);
    }

    log.success(`Validation passed — ${categories.length} categories ready.`);
}

// ─── Drop (--fresh mode) ──────────────────────────────────────────────────────

async function dropIfFresh(): Promise<void> {
    if (process.argv.includes('--fresh')) {
        log.warn('"--fresh" flag detected — deleting all existing categories…');
        const { deletedCount } = await Category.deleteMany({});
        log.warn(`Deleted ${deletedCount} existing categories.\n`);
    }
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
    const categories = loadCategories();
    validate(categories);

    // Build bulkWrite ops — upsert by name so re-running is always safe
    const ops: AnyBulkWriteOperation[] = categories.map((cat) => ({
        updateOne: {
            filter: { name: cat.name.toLowerCase().trim() },
            update: {
                $set: {
                    name: cat.name.toLowerCase().trim(),
                    tags: [
                        ...new Set(cat.tags.map((t) => t.toLowerCase().trim())),
                    ],
                },
            },
            upsert: true,
        },
    }));

    log.info(`Running bulkWrite for ${ops.length} categories…\n`);

    const result = await Category.bulkWrite(ops, { ordered: false });

    const inserted = result.upsertedCount;
    const updated = result.modifiedCount;
    const matched = result.matchedCount;

    console.log('──────────────────────────────────────────');
    log.success('Seed complete!\n');
    log.dim(`  Inserted (new)     : ${inserted}`);
    log.dim(`  Updated            : ${updated}`);
    log.dim(`  Already up-to-date : ${matched - updated}`);
    log.dim(`  Total processed    : ${ops.length}`);
    console.log('──────────────────────────────────────────\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

(async (): Promise<void> => {
    console.log('\n══════════════════════════════════════════');
    console.log('   Category Seeder');
    console.log('══════════════════════════════════════════\n');

    try {
        await connectToDb();
        await dropIfFresh();
        await seed();
    } catch (err) {
        log.error(`Unexpected error: ${(err as Error).message}`);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        log.info('Disconnected from MongoDB. Goodbye!\n');
    }
})();
