(() => {
  const KEY = "__tpu_cpu_merge_v1";
  const store = JSON.parse(localStorage.getItem(KEY) || '{"items":{},"runs":[]}');
  const items = Object.values(store.items);

  const data = {
    generatedAt: new Date().toISOString(),
    source: "https://www.techpowerup.com/cpu-specs/",
    total: items.length,
    runs: store.runs,
    items,
  };

  copy(JSON.stringify(data, null, 2));
  window.__cpuCollector = data;
  console.log(`已导出 ${data.total} 条 CPU，JSON 已复制到剪贴板`);
})();
