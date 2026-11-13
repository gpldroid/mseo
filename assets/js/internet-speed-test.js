(() => {
  "use strict";
  const ENDPOINT = "https://speed.cloudflare.com";
  const $ = (id) => document.getElementById(id);
  const startButton = $("speed-start");
  const cancelButton = $("speed-cancel");
  const status = $("speed-status");
  const progress = $("speed-progress-bar");
  const values = { download: $("download-value"), upload: $("upload-value"), ping: $("ping-value"), jitter: $("jitter-value") };
  let controller = null;
  const format = (value) => Number.isFinite(value) ? (value >= 100 ? value.toFixed(0) : value >= 10 ? value.toFixed(1) : value.toFixed(2)) : "—";
  const setStatus = (message, kind = "") => { status.textContent = message; status.dataset.kind = kind; };
  const setProgress = (percent) => { progress.style.width = Math.max(0, Math.min(100, percent)) + "%"; };
  const timedFetch = async (url, options = {}) => {
    const response = await fetch(url, { cache: "no-store", mode: "cors", ...options, signal: controller.signal });
    if (!response.ok) throw new Error("تعذر الاتصال بخادم الاختبار (HTTP " + response.status + ").");
    return response;
  };
  const measureLatency = async () => {
    const samples = [];
    for (let i = 0; i < 5; i++) {
      const begin = performance.now();
      await timedFetch(ENDPOINT + "/__down?bytes=0&cache=" + Math.random());
      samples.push(performance.now() - begin);
      setProgress(8 + (i + 1) * 3);
    }
    const mean = samples.reduce((sum, n) => sum + n, 0) / samples.length;
    const jitter = samples.slice(1).reduce((sum, n, i) => sum + Math.abs(n - samples[i]), 0) / (samples.length - 1);
    return { ping: mean, jitter };
  };
  const measureDownload = async () => {
    const sizes = [1000000, 5000000, 10000000];
    let best = 0;
    for (let i = 0; i < sizes.length; i++) {
      const begin = performance.now();
      const response = await timedFetch(ENDPOINT + "/__down?bytes=" + sizes[i] + "&cache=" + Math.random());
      const data = await response.arrayBuffer();
      const seconds = (performance.now() - begin) / 1000;
      if (seconds > 0 && data.byteLength) best = Math.max(best, data.byteLength * 8 / seconds / 1000000);
      setProgress(25 + (i + 1) * 13);
    }
    return best;
  };
  const measureUpload = async () => {
    const payload = new Uint8Array(3000000);
    if (window.crypto && crypto.getRandomValues) {
      for (let i = 0; i < payload.length; i += 65536) crypto.getRandomValues(payload.subarray(i, Math.min(i + 65536, payload.length)));
    }
    const begin = performance.now();
    await timedFetch(ENDPOINT + "/__up?cache=" + Math.random(), { method: "POST", headers: { "Content-Type": "application/octet-stream" }, body: payload });
    const seconds = (performance.now() - begin) / 1000;
    setProgress(90);
    return seconds > 0 ? payload.byteLength * 8 / seconds / 1000000 : 0;
  };
  const reset = () => { Object.values(values).forEach((node) => { node.textContent = "—"; }); setProgress(0); };
  const run = async () => {
    if (controller) return;
    controller = new AbortController();
    startButton.disabled = true;
    cancelButton.disabled = false;
    reset();
    try {
      setStatus("جارٍ قياس زمن الاستجابة والتذبذب…");
      const latency = await measureLatency();
      values.ping.textContent = format(latency.ping);
      values.jitter.textContent = format(latency.jitter);
      setStatus("جارٍ قياس سرعة التنزيل…");
      const download = await measureDownload();
      values.download.textContent = format(download);
      setStatus("جارٍ قياس سرعة الرفع…");
      const upload = await measureUpload();
      values.upload.textContent = format(upload);
      setProgress(100);
      setStatus("اكتمل الاختبار. للحصول على مقارنة أدق، أعد القياس في وقت آخر.", "success");
    } catch (error) {
      if (error.name === "AbortError") setStatus("تم إيقاف الاختبار. يمكنك تشغيله مرة أخرى.");
      else setStatus(error.message || "حدث خطأ أثناء الاختبار. تحقق من الاتصال وحاول مجددًا.", "error");
    } finally {
      controller = null;
      startButton.disabled = false;
      cancelButton.disabled = true;
    }
  };
  startButton.addEventListener("click", run);
  cancelButton.addEventListener("click", () => { if (controller) controller.abort(); });
})();