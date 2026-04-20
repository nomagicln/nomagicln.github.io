(() => {
  const KEY = "__tpu_cpu_merge_v1";
  const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const HEADERS = [
    "name",
    "codename",
    "cores",
    "clock",
    "socket",
    "process",
    "l3 cache",
    "tdp",
    "released",
  ];

  const monthMap = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  const parseReleased = (raw) => {
    const value = raw.trim();
    if (!value) return { releaseDateRaw: "", releaseDate: null, releaseDatePrecision: "none" };
    if (/^never released$/i.test(value)) {
      return { releaseDateRaw: "Never Released", releaseDate: null, releaseDatePrecision: "none" };
    }
    if (/^unknown$/i.test(value)) {
      return { releaseDateRaw: "Unknown", releaseDate: null, releaseDatePrecision: "none" };
    }

    const fullDate = value.match(/\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th),\s+((?:19|20)\d{2})\b/);
    if (fullDate) {
      const month = monthMap[fullDate[1].slice(0, 3).toLowerCase()];
      const day = fullDate[2].padStart(2, "0");
      const year = fullDate[3];
      if (month) {
        return {
          releaseDateRaw: fullDate[0],
          releaseDate: `${year}-${month}-${day}`,
          releaseDatePrecision: "day",
        };
      }
    }

    const monthYear = value.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
    if (monthYear) {
      const month = monthMap[monthYear[1].slice(0, 3).toLowerCase()];
      const year = monthYear[2];
      if (month) {
        return {
          releaseDateRaw: value,
          releaseDate: `${year}-${month}-01`,
          releaseDatePrecision: "month",
        };
      }
    }

    const yearOnly = value.match(/\b((?:19|20)\d{2})\b/);
    if (yearOnly) {
      return {
        releaseDateRaw: yearOnly[1],
        releaseDate: `${yearOnly[1]}-01-01`,
        releaseDatePrecision: "year",
      };
    }

    return { releaseDateRaw: value, releaseDate: null, releaseDatePrecision: "none" };
  };

  const isCpuTable = (table) => {
    const rows = [...table.querySelectorAll("tr")].slice(0, 6);
    return rows.some((r) => {
      const cells = [...r.querySelectorAll("th,td")].map((c) => norm(text(c)));
      return HEADERS.every((h) => cells.some((c) => c.includes(h)));
    });
  };

  const tables = [...document.querySelectorAll("table")].filter(isCpuTable);
  if (!tables.length) {
    console.error("没找到 CPU 主表");
    return;
  }

  const store = JSON.parse(localStorage.getItem(KEY) || '{"items":{},"runs":[]}');
  let added = 0;

  for (const table of tables) {
    for (const tr of table.querySelectorAll("tr")) {
      const tds = [...tr.querySelectorAll("td")];
      if (tds.length < 9) continue;

      const nameLink = tds[0].querySelector('a[href*="/cpu-specs/"]');
      if (!nameLink) continue;

      const detailUrl = new URL(nameLink.getAttribute("href"), location.origin).toString();
      const m = detailUrl.match(/\.c(\d+)$/);
      const id = m ? `c${m[1]}` : detailUrl;
      if (store.items[id]) continue;

      const name = text(nameLink);
      const releaseMeta = parseReleased(text(tds[8]));

      store.items[id] = {
        id,
        name,
        codename: text(tds[1]),
        coresThreads: text(tds[2]),
        clock: text(tds[3]),
        socket: text(tds[4]),
        process: text(tds[5]),
        l3Cache: text(tds[6]),
        tdp: text(tds[7]),
        released: text(tds[8]),
        releaseDate: releaseMeta.releaseDate,
        releaseDateRaw: releaseMeta.releaseDateRaw,
        releaseDatePrecision: releaseMeta.releaseDatePrecision,
      };
      added++;
    }
  }

  store.runs.push({
    at: new Date().toISOString(),
    added,
    total: Object.keys(store.items).length,
  });

  localStorage.setItem(KEY, JSON.stringify(store));
  console.log(`CPU 本次新增 ${added}，累计 ${Object.keys(store.items).length}`);
})();
