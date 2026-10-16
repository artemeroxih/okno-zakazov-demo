// Связь с Google: каталог и заявки (адреса — в config.js).
//  - Каталог: сначала из опубликованных листов (быстро), если не вышло — через скрипт Google.
//  - Заявки: только через скрипт Google (он проверяет их и пишет в таблицу).
// Если apiUrl пустой, страница работает в демо-режиме на тестовых данных (stubs.js).
window.Okno = window.Okno || {};

(function (O) {
  var url = (O.CONFIG.apiUrl || "").trim();
  if (!url) return;
  var csv = O.CONFIG.catalogCsv || {};

  // fetch с ограничением по времени, чтобы покупатель не ждал бесконечно
  function request(target, options, ms, asText) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms) : null;
    if (ctrl) options.signal = ctrl.signal;
    return fetch(target, options).then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return asText ? res.text() : res.json();
    }).then(function (data) {
      if (timer) clearTimeout(timer);
      return data;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function fromScript() {
    // 30 секунд: после простоя Google запускает скрипт заново, первый ответ бывает долгим
    return request(url, { method: "GET", redirect: "follow" }, 30000).then(function (data) {
      if (!data || data.ok !== true) throw new Error("Каталог: ответ без ok");
      return data;
    });
  }

  function fromPublished() {
    function get(u) { return request(u, { method: "GET", cache: "no-store" }, 8000, true); }
    return Promise.all([get(csv.desserts), get(csv.busy), get(csv.settings)]).then(function (t) {
      // Если вместо таблицы пришла страница (лист не опубликован) — это ошибка
      if (/^\s*</.test(t[0])) throw new Error("Опубликованный лист «Десерты» не открылся");
      return O.catalogFromCsv(t[0], t[1], t[2]);
    });
  }

  O.loadCatalog = function () {
    if (!(csv.desserts && csv.busy && csv.settings)) return fromScript();
    return fromPublished().catch(function (err) {
      console.warn("Опубликованные листы не открылись, берём каталог через скрипт:", err);
      return fromScript();
    });
  };

  // Заявка. text/plain — чтобы браузер отправил её Google без лишнего предварительного запроса.
  O.sendRequest = function (payload) {
    return request(url, {
      method: "POST",
      redirect: "follow",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }, 25000).then(function (data) {
      if (!data || data.ok !== true) {
        var err = new Error("Заявка не принята: " + (data && data.code));
        err.code = data && data.code;
        err.field = data && data.field;
        throw err;
      }
      return data;
    });
  };
})(window.Okno);
