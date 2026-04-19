(() => {
  const KEY = "__tpu_gpu_merge_v1";
  const store = JSON.parse(localStorage.getItem(KEY) || '{"items":{},"runs":[]}');
  const items = Object.values(store.items);

  const data = {
    generatedAt: new Date().toISOString(),
    source: "https://www.techpowerup.com/gpu-specs/",
    total: items.length,
    runs: store.runs,
    items,
  };

  copy(JSON.stringify(data, null, 2));
  window.__gpuCollector = data;
  console.log(`已导出 ${data.total} 条，JSON 已复制到剪贴板`);
})();
