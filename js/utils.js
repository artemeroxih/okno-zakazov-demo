// Общие помощники: подстановка в тексты, числа, склонения, даты, защита текста.
window.Okno = window.Okno || {};

(function (O) {
  // fill("Минимум {min}", { min: "2 кг" }) → "Минимум 2 кг"
  O.fill = function (text, params) {
    return String(text).replace(/\{(\w+)\}/g, function (all, key) {
      return params && key in params ? params[key] : all;
    });
  };

  // Склонение: plural(5, "штука", "штуки", "штук") → "штук"
  O.plural = function (n, one, few, many) {
    if (!Number.isInteger(n)) return few;
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b === 1) return one;
    if (b >= 2 && b <= 4) return few;
    return many;
  };

  O.days = function (n) { return n + " " + O.plural(n, "день", "дня", "дней"); };

  // 5000 → "5 000"
  O.money = function (n) { return Math.round(n).toLocaleString("ru-RU"); };
  O.round100 = function (n) { return Math.round(n / 100) * 100; };

  // 1.5 → "1,5"
  O.num = function (n) { return String(Math.round(n * 100) / 100).replace(".", ","); };

  // Количество с единицей: "1,5 кг", "6 штук"
  O.qtyText = function (qty, unit) {
    if (unit === "кг") return O.num(qty) + " кг";
    return qty + " " + O.plural(qty, "штука", "штуки", "штук");
  };

  // Примерная цена заявки: цена за единицу × количество, округление до 100 ₽
  O.priceText = function (dessert, qty) {
    var T = O.TEXTS;
    var from = O.round100(dessert.priceFrom * qty);
    var to = O.round100(dessert.priceTo * qty);
    if (from === to) return O.fill(T.priceAbout, { value: O.money(from) });
    return O.fill(T.priceRange, { from: O.money(from), to: O.money(to) });
  };

  // Цена за единицу в каталоге, без умножения
  O.unitPriceText = function (dessert) {
    var T = O.TEXTS;
    if (dessert.priceFrom === dessert.priceTo) return O.fill(T.priceAbout, { value: O.money(dessert.priceFrom) });
    return O.fill(T.priceRange, { from: O.money(dessert.priceFrom), to: O.money(dessert.priceTo) });
  };

  // ---- Даты (по местному времени покупателя) ----
  O.today = function () { var d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  O.addDays = function (date, n) { var d = new Date(date); d.setDate(d.getDate() + n); return d; };
  O.dateKey = function (d) {
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + m + "-" + day;
  };
  O.parseKey = function (key) {
    var p = String(key).split("-");
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  };
  // "пятница, 23 октября"
  O.dateLong = function (d) { return d.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" }); };
  // "пт, 23 октября"
  O.dateShort = function (d) { return d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" }); };

  // Защита от «сломанного» текста: всё, что пришло из данных, выводим через esc()
  O.esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  // Ссылки для связи с кондитером: Telegram и телефон
  O.contactLinks = function () {
    var C = O.CONFIG, parts = [];
    if (C.telegram) {
      var nick = C.telegram.replace(/^@/, "");
      parts.push('<a class="link" href="https://t.me/' + encodeURIComponent(nick) + '" target="_blank" rel="noopener">@' + O.esc(nick) + "</a>");
    }
    if (C.phone) {
      parts.push('<a class="link" href="tel:' + O.esc(C.phone.replace(/[^\d+]/g, "")) + '">' + O.esc(C.phone) + "</a>");
    }
    return parts.join(" " + O.TEXTS.or + " ");
  };

  // Значок из набора в index.html
  O.icon = function (name) {
    return '<svg class="i" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
  };
})(window.Okno);
