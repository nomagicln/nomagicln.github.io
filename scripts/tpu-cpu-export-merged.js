(() => {
  const KEY = "__tpu_cpu_merge_v1";
  const store = JSON.parse(localStorage.getItem(KEY) || '{"items":{},"runs":[]}');

  const items = Object.values(store.items).map((item) => {
    const next = { ...item };
    delete next.source;
    delete next.sourceUrl;
    return next;
  });

  const runs = Array.isArray(store.runs)
    ? store.runs.map((run) => {
        const next = { ...run };
        delete next.url;
        delete next.source;
        delete next.sourceUrl;
        return next;
      })
    : [];

  const data = {
    generatedAt: new Date().toISOString(),
    total: items.length,
    runs,
    items,
  };

  copy(JSON.stringify(data, null, 2));
  window.__cpuCollector = data;
  console.log(`已导出 ${data.total} 条 CPU，JSON 已复制到剪贴板`);
})();
