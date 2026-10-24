import type { AnyBulkWriteOperation } from "mongoose";
import { connectToDB } from "@/lib/db";
import News from "@/lib/models/News";
import Event from "@/lib/models/Events";
import Banner from "@/lib/models/Banner";
import Program from "@/lib/models/Program";
import {
  BASE,
  eventItemSchema,
  isTruthyStatus,
  mapBannerDoc,
  mapEventDoc,
  mapNewsDoc,
  mapVolunteerProgramDoc,
  newsDetailSchema,
  newsListItemSchema,
  sliderItemSchema,
  volunteerItemSchema,
} from "@/lib/sync/volunteerOrgMappers";

export type SyncSectionResult = {
  upserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export type SyncResult = {
  news: SyncSectionResult;
  events: SyncSectionResult;
  programs: SyncSectionResult;
  banners: SyncSectionResult;
};

type UpsertOp = {
  filter: Record<string, unknown>;
  set: Record<string, unknown>;
  setOnInsert: Record<string, unknown>;
};

type BulkModel = {
  bulkWrite: (
    ops: AnyBulkWriteOperation[],
    opts?: { ordered?: boolean }
  ) => Promise<{ upsertedCount?: number; modifiedCount?: number }>;
};

const UA = "VCM-App-Sync/1.0";
const MAX_PAGES = 5;
const PAGE_DELAY_MS = 300;

function emptySection(): SyncSectionResult {
  return { upserted: 0, updated: 0, skipped: 0, errors: [] };
}

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${url}`);
  }
  return res.json();
}

async function bulkUpsert(
  model: BulkModel,
  ops: UpsertOp[]
): Promise<{ upserted: number; updated: number }> {
  if (!ops.length) return { upserted: 0, updated: 0 };
  const writes: AnyBulkWriteOperation[] = ops.map((op) => ({
    updateOne: {
      filter: op.filter,
      update: {
        $set: op.set,
        $setOnInsert: op.setOnInsert,
      },
      upsert: true,
    },
  }));
  const result = await model.bulkWrite(writes, { ordered: false });
  return {
    upserted: result.upsertedCount || 0,
    updated: result.modifiedCount || 0,
  };
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

async function syncNews(): Promise<SyncSectionResult> {
  const out = emptySection();
  const perPage = 10;
  const mapped: UpsertOp[] = [];

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      if (page > 1) await sleep(PAGE_DELAY_MS);
      const url = `${BASE}/getNews/${perPage}/?page=${page}`;
      const json = asRecord(await fetchJson(url));
      if (!isTruthyStatus(json.status) && json.status !== true) {
        out.errors.push(`news page ${page}: unexpected status`);
        break;
      }
      const news = asRecord(json.news);
      const rows = news.data;
      if (!Array.isArray(rows) || rows.length === 0) break;
      const lastPage = Number(news.last_page) || page;

      for (const raw of rows) {
        const parsed = newsListItemSchema.safeParse(raw);
        if (!parsed.success) {
          out.skipped += 1;
          continue;
        }
        let detail: unknown = null;
        try {
          await sleep(PAGE_DELAY_MS);
          detail = await fetchJson(`${BASE}/getNewsDetail/${parsed.data.id}`);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : String(e);
          out.errors.push(`news detail ${parsed.data.id}: ${msg}`);
        }
        const detailParsed = newsDetailSchema.safeParse(detail);
        mapped.push(mapNewsDoc(parsed.data, detailParsed.success ? detailParsed.data : null));
      }

      if (page >= lastPage) break;
    }

    const { upserted, updated } = await bulkUpsert(News as unknown as BulkModel, mapped);
    out.upserted += upserted;
    out.updated += updated;
  } catch (e: unknown) {
    out.errors.push(`news: ${e instanceof Error ? e.message : String(e)}`);
  }
  return out;
}

async function syncEvents(): Promise<SyncSectionResult> {
  const out = emptySection();
  const mapped: UpsertOp[] = [];
  const now = new Date();

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      if (page > 1) await sleep(PAGE_DELAY_MS);
      const url = `${BASE}/getEvents/null?page=${page}`;
      const json = asRecord(await fetchJson(url));
      const rows = json.data;
      if (!Array.isArray(rows) || rows.length === 0) break;
      const lastPage = Number(json.last_page) || page;

      for (const raw of rows) {
        const parsed = eventItemSchema.safeParse(raw);
        if (!parsed.success) {
          out.skipped += 1;
          continue;
        }
        const doc = mapEventDoc(parsed.data, now);
        if (!doc) {
          out.skipped += 1;
          continue;
        }
        mapped.push(doc);
      }

      if (page >= lastPage) break;
    }

    const { upserted, updated } = await bulkUpsert(Event as unknown as BulkModel, mapped);
    out.upserted += upserted;
    out.updated += updated;
  } catch (e: unknown) {
    out.errors.push(`events: ${e instanceof Error ? e.message : String(e)}`);
  }
  return out;
}

async function syncPrograms(): Promise<SyncSectionResult> {
  const out = emptySection();
  const mapped: UpsertOp[] = [];
  const perPage = 12;

  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      if (page > 1) await sleep(PAGE_DELAY_MS);
      const url = `${BASE}/getVolunteers/null/${perPage}?page=${page}`;
      const json = asRecord(await fetchJson(url));
      const volunteers = asRecord(json.volunteers);
      const rows = volunteers.data ?? json.data;
      if (!Array.isArray(rows) || rows.length === 0) break;
      const lastPage = Number(volunteers.last_page ?? json.last_page) || page;

      for (const raw of rows) {
        const parsed = volunteerItemSchema.safeParse(raw);
        if (!parsed.success) {
          out.skipped += 1;
          continue;
        }
        mapped.push(mapVolunteerProgramDoc(parsed.data));
      }

      if (page >= lastPage) break;
    }

    const { upserted, updated } = await bulkUpsert(Program as unknown as BulkModel, mapped);
    out.upserted += upserted;
    out.updated += updated;
  } catch (e: unknown) {
    out.errors.push(`programs: ${e instanceof Error ? e.message : String(e)}`);
  }
  return out;
}

async function syncBanners(): Promise<SyncSectionResult> {
  const out = emptySection();
  try {
    const json = asRecord(await fetchJson(`${BASE}/getSliders`));
    const rows = json.data;
    if (!Array.isArray(rows)) {
      out.errors.push("banners: missing data");
      return out;
    }
    const mapped: UpsertOp[] = [];
    rows.forEach((raw: unknown, i: number) => {
      const parsed = sliderItemSchema.safeParse(raw);
      if (!parsed.success) {
        out.skipped += 1;
        return;
      }
      const doc = mapBannerDoc(parsed.data, i);
      if (!doc) {
        out.skipped += 1;
        return;
      }
      mapped.push(doc);
    });
    const { upserted, updated } = await bulkUpsert(Banner as unknown as BulkModel, mapped);
    out.upserted += upserted;
    out.updated += updated;
  } catch (e: unknown) {
    out.errors.push(`banners: ${e instanceof Error ? e.message : String(e)}`);
  }
  return out;
}

/** Server-only sync. Never call from the browser. */
export async function syncVolunteerOrg(): Promise<SyncResult> {
  await connectToDB();
  const news = await syncNews();
  const events = await syncEvents();
  const programs = await syncPrograms();
  const banners = await syncBanners();
  return { news, events, programs, banners };
}

export { SOURCE, BASE } from "@/lib/sync/volunteerOrgMappers";
