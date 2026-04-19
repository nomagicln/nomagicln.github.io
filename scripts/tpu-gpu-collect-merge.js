(() => {
  const KEY = "__tpu_gpu_merge_v1";
  const text = (el) => (el?.textContent || "").replace(/\s+/g, " ").trim();
  const norm = (s) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const HEADERS = ["name", "bus", "memory", "gpu clock", "memory clock", "cores / tmus / rops"];
  const extractReleaseDate = (raw) => {
    const value = raw.trim();
    if (/^never released$/i.test(value)) {
      return { releaseDateRaw: "Never Released", releaseDate: null, releaseDatePrecision: "none" };
    }
    if (/^unknown$/i.test(value)) {
      return { releaseDateRaw: "Unknown", releaseDate: null, releaseDatePrecision: "none" };
    }

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

    const yearOnly = value.match(/\b((?:19|20)\d{2})\b/);
    if (yearOnly) {
      return {
        releaseDateRaw: yearOnly[1],
        releaseDate: `${yearOnly[1]}-01-01`,
        releaseDatePrecision: "year",
      };
    }

    return { releaseDateRaw: "", releaseDate: null, releaseDatePrecision: "none" };
  };

  const isGpuTable = (table) => {
    const rows = [...table.querySelectorAll("tr")].slice(0, 5);
    return rows.some((r) => {
      const cells = [...r.querySelectorAll("th,td")].map((c) => norm(text(c)));
      return HEADERS.every((h) => cells.some((c) => c.includes(h)));
    });
  };

  const tables = [...document.querySelectorAll("table")].filter(isGpuTable);
  if (!tables.length) {
    console.error("没找到 GPU 主表");
    return;
  }

  const store = JSON.parse(localStorage.getItem(KEY) || '{"items":{},"runs":[]}');
  let added = 0;

  for (const table of tables) {
    for (const tr of table.querySelectorAll("tr")) {
      const tds = [...tr.querySelectorAll("td")];
      if (tds.length < 6) continue;

      const links = [...tds[0].querySelectorAll('a[href*="/gpu-specs/"]')];
      if (!links.length) continue;

      const nameLink = links[0];
      const chipLink = links.find((a) => a !== nameLink);

      const sourceUrl = new URL(nameLink.getAttribute("href"), location.origin).toString();
      const m = sourceUrl.match(/\.c(\d+)$/);
      const id = m ? `c${m[1]}` : sourceUrl;
      if (store.items[id]) continue;

      const name = text(nameLink);
      const category = /(h100|h200|b\d{2,3}|a\d{2,3}|l\d{2,3}|tesla|server|datacenter|gh200|dgx|rtx pro|quadro|a16|a2|a30|a40|a6000|l40s)/i.test(name)
        ? "enterprise"
        : /(rtx pro|quadro|workstation)/i.test(name)
          ? "workstation"
          : "consumer";

      const c0 = text(tds[0]);
      const releaseInfo = c0.replace(name, "").replace(chipLink ? text(chipLink) : "", "").trim();
      const releaseDateMeta = extractReleaseDate(releaseInfo);

      store.items[id] = {
        id,
        name,
        category,
        source: "techpowerup",
        sourceUrl,
        releaseDate: releaseDateMeta.releaseDate,
        releaseDateRaw: releaseDateMeta.releaseDateRaw,
        releaseDatePrecision: releaseDateMeta.releaseDatePrecision,
        releaseInfo,
        chip: chipLink ? text(chipLink) : "",
        bus: text(tds[1]),
        memory: text(tds[2]),
        gpuClock: text(tds[3]),
        memoryClock: text(tds[4]),
        coresTMUsROPs: text(tds[5]),
      };
      added++;
    }
  }

  store.runs.push({
    at: new Date().toISOString(),
    url: location.href,
    added,
    total: Object.keys(store.items).length,
  });

  localStorage.setItem(KEY, JSON.stringify(store));
  console.log(`本次新增 ${added}，累计 ${Object.keys(store.items).length}`);
})();
