import { describe, expect, it } from "vitest";
import {
  absUrl,
  formatTimeString,
  mapBannerDoc,
  mapEventDoc,
  mapNewsDoc,
  parseUbDate,
  shouldSkipEvent,
} from "@/lib/sync/volunteerOrgMappers";
import { sanitizeHtml } from "@/lib/sync/sanitizeHtml";

describe("volunteer.org.mn mappers", () => {
  it("resolves relative image paths with encodeURI", () => {
    expect(absUrl("/uploaded/images/foo bar.jpg")).toBe(
      "https://volunteer.org.mn/uploaded/images/foo%20bar.jpg"
    );
    expect(absUrl("https://cdn.example/x.png")).toBe("https://cdn.example/x.png");
    expect(absUrl(null)).toBe("");
  });

  it("parses UB +08:00 datetimes", () => {
    const d = parseUbDate("2026-10-20 10:01:36");
    expect(d).toBeInstanceOf(Date);
    expect(d!.toISOString()).toBe("2026-10-20T02:01:36.000Z");
  });

  it("formats timeString in Asia/Ulaanbaatar", () => {
    const start = parseUbDate("2026-10-20 14:30:00")!;
    const end = parseUbDate("2026-10-20 16:00:00")!;
    expect(formatTimeString(start, end)).toBe("14:30 - 16:00");
  });

  it("maps news with mn fallback into en/de and absolute thumb", () => {
    const doc = mapNewsDoc(
      {
        id: 33,
        title: "Because Im a Girl",
        thumb: "/uploaded/images/a.jpeg",
        created_at: "2026-10-20 10:01:36",
      },
      {
        id: 33,
        title: "Because Im a Girl",
        description: "Short desc",
        thumb: "/uploaded/images/a.jpeg",
        content: '<p>Hi</p><script>alert(1)</script><iframe src="https://www.youtube.com/embed/abc"></iframe>',
      }
    );
    expect(doc.set.title.mn).toBe("Because Im a Girl");
    expect(doc.set.title.en).toBe("Because Im a Girl");
    expect(doc.set.summary.mn).toBe("Short desc");
    expect(doc.set.image).toContain("https://volunteer.org.mn/uploaded/");
    expect(doc.set.content.mn).not.toContain("<script");
    expect(doc.set.content.mn).toContain("youtube.com");
    expect(doc.setOnInsert.featured).toBe(false);
    expect(doc.setOnInsert.views).toBe(0);
    expect(doc.filter).toEqual({ source: "volunteer.org.mn", externalId: "33" });
  });

  it("skips unpublished or deleted events", () => {
    expect(
      shouldSkipEvent({
        id: 1,
        title: "X",
        is_publish: 0,
        event_date1: "2026-11-01 12:00:00",
      })
    ).toBe(true);
    expect(
      shouldSkipEvent({
        id: 2,
        title: "Y",
        is_publish: 1,
        deleted_at: "2026-01-01 00:00:00",
        event_date1: "2026-11-01 12:00:00",
      })
    ).toBe(true);
    expect(
      mapEventDoc({
        id: 3,
        title: "Open",
        is_publish: 1,
        deleted_at: null,
        event_date1: "2026-11-01 12:00:00",
        address: null,
        banner: "/uploaded/b.jpg",
        content: "<p>Ok</p>",
        price: "0",
      })
    ).not.toBeNull();
  });

  it("marks past events from event_date1", () => {
    const doc = mapEventDoc(
      {
        id: 9,
        title: "Past event",
        is_publish: 1,
        event_date1: "2020-01-15 09:00:00",
        banner: "/uploaded/e.jpg",
        content: null,
        address: null,
        price: 10,
      },
      new Date("2026-10-24T00:00:00+08:00")
    );
    expect(doc?.set.status).toBe("past");
    expect(doc?.set.university).toBe("VCM");
    expect(doc?.set.category).toBe("campaign");
    expect(doc?.set.location.mn).toBe("Улаанбаатар");
    expect(doc?.setOnInsert.featured).toBe(false);
  });

  it("keeps same-day events upcoming until end of UB day", () => {
    const doc = mapEventDoc(
      {
        id: 39,
        title: "Today event",
        is_publish: 1,
        event_date1: "2026-10-24 10:00:00",
        banner: "/uploaded/e.jpg",
        content: null,
        address: null,
        price: 0,
      },
      new Date("2026-10-24T14:00:00+08:00")
    );
    expect(doc?.set.status).toBe("upcoming");
  });

  it("maps banners and ignores inactive without image", () => {
    const active = mapBannerDoc({
      id: 1,
      text1: "Hello",
      slider: "/uploaded/s.jpg",
      status: 1,
      link: "/events",
    });
    expect(active?.set.active).toBe(true);
    expect(active?.set.image).toContain("volunteer.org.mn");

    const noImg = mapBannerDoc({ id: 2, text1: "X", slider: null, status: 1 });
    expect(noImg).toBeNull();
  });

  it("idempotent upsert filter is stable", () => {
    const a = mapNewsDoc({ id: "7", title: "A", thumb: "/a.jpg", created_at: "2026-01-01 00:00:00" });
    const b = mapNewsDoc({ id: 7, title: "B", thumb: "/b.jpg", created_at: "2026-01-02 00:00:00" });
    expect(a.filter).toEqual(b.filter);
  });
});

describe("sanitizeHtml", () => {
  it("keeps youtube iframe and strips scripts", () => {
    const html = sanitizeHtml(
      `<p>Hi</p><script>x()</script><iframe src="https://www.youtube.com/embed/zz"></iframe><iframe src="https://evil.test"></iframe>`
    );
    expect(html).toContain("youtube.com");
    expect(html).not.toContain("script");
    expect(html).not.toContain("evil.test");
  });
});
