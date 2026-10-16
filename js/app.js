// Запуск страницы: загрузка каталога, переходы между экранами, экран «Отправлено»,
// окно «Ваши данные».
// Адреса экранов: «#» — каталог, «#zayavka?d=ID» — заявка, «#gotovo» — отправлено.
window.Okno = window.Okno || {};

(function (O) {
  var T = O.TEXTS;
  var data = null, loaded = false;
  var SCREENS = ["catalog", "form", "done"];

  function show(name) {
    SCREENS.forEach(function (s) { document.getElementById("screen-" + s).hidden = s !== name; });
    window.scrollTo(0, 0);
  }

  // Приводим данные к одному виду и убираем скрытые десерты
  function normalize(raw) {
    var desserts = (raw.desserts || []).filter(function (d) {
      return d && d.show !== false && d.name;
    }).map(function (d) {
      var unit = d.unit === "кг" ? "кг" : "шт";
      var from = Number(d.priceFrom) || 0;
      var to = Number(d.priceTo) || from;
      return {
        id: String(d.id), name: String(d.name), description: d.description || "",
        photo: /^https:\/\//i.test(String(d.photo || "")) ? String(d.photo) : "",   // только https-ссылки
        unit: unit, priceFrom: Math.min(from, to), priceTo: Math.max(from, to),
        min: Number(d.min) > 0 ? Number(d.min) : 1,
        step: Number(d.step) > 0 ? Number(d.step) : (unit === "кг" ? 0.5 : 1),
        fillings: (d.fillings || []).map(String).filter(Boolean)
      };
    });
    var minDays = Number(raw.minDaysAhead), maxDays = Number(raw.maxDaysAhead);
    return {
      desserts: desserts,
      busyDates: raw.busyDates || [],
      minDaysAhead: isFinite(minDays) && minDays >= 0 ? minDays : 2,
      maxDaysAhead: isFinite(maxDays) && maxDays > 0 ? maxDays : 60
    };
  }

  function renderDone(r) {
    var rows = [
      [T.sumDessert, r.dessertName],
      [r.unit === "кг" ? T.weight : T.quantity, r.qtyText],
      r.hasFillings ? [T.sumFilling, r.filling || T.notChosen] : null,
      [T.sumDate, O.dateShort(O.parseKey(r.date))],
      [T.sumMethod, r.method === "delivery" ? T.delivery : T.pickup],
      [T.sumPrice, r.priceText]
    ].filter(Boolean);
    document.getElementById("screen-done").innerHTML =
      '<div class="done-icon" aria-hidden="true">' + O.icon("check") + "</div>" +
      '<h1 class="center">' + O.esc(T.doneTitle) + "</h1>" +
      '<p class="center lead">' + O.esc(T.doneText) + "</p>" +
      '<div class="card summary">' + rows.map(function (row) {
        return "<div><span>" + O.esc(row[0]) + "</span><span>" + O.esc(row[1]) + "</span></div>";
      }).join("") + "</div>" +
      '<p class="small muted center ask">' + O.esc(T.doneAsk) + " " + O.contactLinks() + "</p>" +
      '<div class="stack">' +
        '<a class="btn" href="#zayavka?d=' + encodeURIComponent(r.dessertId) + '">' + O.esc(T.doneAgain) + "</a>" +
        '<a class="btn secondary" href="#">' + O.esc(T.doneToCatalog) + "</a>" +
      "</div>";
  }

  function route() {
    if (!loaded) return;
    var hash = location.hash;
    if (data && hash.indexOf("#zayavka") === 0) {
      var id = new URLSearchParams(hash.split("?")[1] || "").get("d");
      var dessert = data.desserts.filter(function (d) { return d.id === id; })[0];
      if (dessert) { O.Form.open(dessert, data); show("form"); return; }
    }
    if (hash === "#gotovo" && O.lastSent) { renderDone(O.lastSent); show("done"); return; }
    show("catalog");
  }

  // Окно «Ваши данные» (о согласии)
  O.openPrivacy = function () {
    var dlg = document.getElementById("privacy");
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  };
  function fillPrivacy() {
    var dlg = document.getElementById("privacy");
    dlg.innerHTML = "<h3>" + O.esc(T.privacyTitle) + "</h3>" +
      "<p>" + O.esc(T.privacy1) + "</p>" +
      "<p>" + O.esc(O.fill(T.privacy2, { name: O.CONFIG.name })) + "</p>" +
      "<p>" + O.esc(T.privacy3) + "</p>" +
      '<form method="dialog"><button class="btn" type="submit">' + O.esc(T.privacyOk) + "</button></form>";
  }

  function start() {
    O.Catalog.renderHeader();
    document.getElementById("catalog-title").textContent = T.catalogTitle;
    fillPrivacy();
    O.Catalog.renderLoading();
    window.addEventListener("hashchange", route);

    O.loadCatalog().then(function (raw) {
      data = normalize(raw);
      O.Catalog.render(data);
    }, function (err) {
      console.error(err);
      O.Catalog.renderError();
    }).then(function () {
      loaded = true;
      route();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window.Okno);
