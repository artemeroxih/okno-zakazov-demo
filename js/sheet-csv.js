// Каталог из опубликованных листов Google Таблицы (Файл → Поделиться → Опубликовать в интернете, формат CSV).
// Это быстро: файлы раздаёт сама Google. Правила разбора — те же, что в google/Code.gs.
window.Okno = window.Okno || {};

(function (O) {
  var COL = {
    show: "Показывать", name: "Название", description: "Описание", photo: "Фото (ссылка)",
    unit: "Единица (кг или шт)", from: "Цена от, ₽", to: "Цена до, ₽", min: "Минимум",
    step: "Шаг", fillings: "Начинки (через запятую)"
  };
  var SETTING_MIN = "Заявка минимум за … дней";
  var SETTING_MAX = "Дату можно выбрать не дальше чем через … дней";

  // Разбор CSV: кавычки, запятые и переносы строк внутри ячеек
  O.parseCsv = function (text) {
    var rows = [], row = [], cell = "", q = false;
    text = String(text || "").replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
    return rows;
  };

  // "2 500" → 2500, "1,5" → 1.5
  function num(v) {
    var n = Number(String(v || "").replace(/[\s  ]/g, "").replace(",", "."));
    return isFinite(n) ? n : 0;
  }

  // "21.10.2026" → "2026-10-21"
  function dateKey(v) {
    var m = String(v || "").trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (!m) return "";
    return m[3] + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
  }

  function readDesserts(rows) {
    if (!rows.length) return [];
    var head = rows[0].map(function (h) { return String(h).trim(); });
    var idx = {};
    Object.keys(COL).forEach(function (k) { idx[k] = head.indexOf(COL[k]); });
    if (idx.name < 0) throw new Error("Лист «Десерты»: нет столбца «Название»");
    function cell(r, k) { return idx[k] >= 0 ? (r[idx[k]] || "") : ""; }

    return rows.slice(1).map(function (r) {
      var name = String(cell(r, "name")).trim();
      if (!name) return null;
      if (!/^(true|истина|да|1)$/i.test(String(cell(r, "show")).trim())) return null;
      var unit = /^кг/i.test(String(cell(r, "unit")).trim()) ? "кг" : "шт";
      var from = num(cell(r, "from")), to = num(cell(r, "to")) || from;
      if (!(from > 0)) return null;
      var photo = String(cell(r, "photo")).trim();
      return {
        id: name, name: name, show: true,
        description: String(cell(r, "description")).trim(),
        photo: /^https:\/\//i.test(photo) ? photo : "",
        unit: unit,
        priceFrom: Math.min(from, to), priceTo: Math.max(from, to),
        min: num(cell(r, "min")) || 1,
        step: num(cell(r, "step")) || (unit === "кг" ? 0.5 : 1),
        fillings: String(cell(r, "fillings")).split(/[,;\n]/).map(function (s) { return s.trim(); }).filter(Boolean)
      };
    }).filter(Boolean);
  }

  function readSettings(rows) {
    var out = { minDaysAhead: 2, maxDaysAhead: 60 };
    rows.forEach(function (r) {
      var label = String(r[0] || "").trim(), value = num(r[1]);
      if (label === SETTING_MIN && value >= 0) out.minDaysAhead = Math.round(value);
      if (label === SETTING_MAX && value > 0) out.maxDaysAhead = Math.round(value);
    });
    return out;
  }

  // Собирает каталог в том же виде, что отдаёт скрипт Google
  O.catalogFromCsv = function (dessertsCsv, busyCsv, settingsCsv) {
    var settings = readSettings(O.parseCsv(settingsCsv));
    var today = O.dateKey(O.today());
    var last = O.dateKey(O.addDays(O.today(), settings.maxDaysAhead));
    var busy = O.parseCsv(busyCsv).slice(1).map(function (r) { return dateKey(r[0]); })
      .filter(function (k) { return k && k >= today && k <= last; });
    return {
      ok: true,
      desserts: readDesserts(O.parseCsv(dessertsCsv)),
      busyDates: busy,
      minDaysAhead: settings.minDaysAhead,
      maxDaysAhead: settings.maxDaysAhead
    };
  };
})(window.Okno);
