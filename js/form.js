// Экран 2 «Заявка»: вес или количество, цена, начинка, дата, получение, контакты,
// проверка полей и отправка. Правила — паспорт, раздел 5.
window.Okno = window.Okno || {};

(function (O) {
  var T = O.TEXTS;
  var st = null;    // то, что заполнил покупатель
  var data = null;  // сроки и занятые даты из каталога

  function $(id) { return document.getElementById(id); }
  function esc(s) { return O.esc(s); }

  function freshState() {
    return {
      dessert: null, qty: 0, filling: "", date: "", method: "pickup", address: "",
      name: "", phone: "", telegram: "", wishes: "", consent: false,
      tried: false, sending: false, sendFailed: false, dateTaken: false
    };
  }

  // ---------- Проверка полей ----------
  function phoneOk(v) { var n = v.replace(/\D/g, "").length; return n >= 10 && n <= 15; }
  // Принимаем «@anna_k», «anna_k», «t.me/anna_k» и «https://t.me/anna_k»
  function tgNick(v) { return v.trim().replace(/^(https?:\/\/)?(www\.)?t\.me\//i, "").replace(/^@/, ""); }
  function tgOk(v) { return /^[A-Za-z0-9_]{5,32}$/.test(tgNick(v)); }

  function validate() {
    var e = {}, d = st.dessert;
    var phone = st.phone.trim(), tg = st.telegram.trim();
    if (st.qty < d.min) e.qty = O.fill(T.errMin, { min: O.qtyText(d.min, d.unit) });
    if (!st.date) e.date = st.dateTaken ? T.errDateTaken : T.errDate;
    if (st.method === "delivery" && !st.address.trim()) e.address = T.errAddress;
    if (!st.name.trim()) e.name = T.errName;
    if (!phone && !tg) e.contact = T.errContact;
    if (phone && !phoneOk(phone)) e.phone = T.errPhone;
    if (tg && !tgOk(tg)) e.telegram = T.errTelegram;
    if (!st.consent) e.consent = T.errConsent;
    return e;
  }

  // Порядок ошибок сверху вниз и куда ставить курсор
  var ORDER = ["qty", "date", "address", "name", "phone", "telegram", "contact", "consent"];
  var FOCUS = { qty: "qty-plus", date: "calendar", address: "f-address", name: "f-name",
    phone: "f-phone", telegram: "f-telegram", contact: "f-phone", consent: "f-consent" };

  function showErrors() {
    var e = st.tried ? validate() : {};
    ORDER.forEach(function (k) {
      var el = $("err-" + k);
      if (!el) return;
      el.hidden = !e[k];
      el.querySelector("span").textContent = e[k] || "";
    });
    var bad = { "f-address": e.address, "f-name": e.name, "f-phone": e.phone || e.contact, "f-telegram": e.telegram || e.contact };
    Object.keys(bad).forEach(function (id) {
      var input = $(id);
      if (!input) return;
      input.setAttribute("aria-invalid", bad[id] ? "true" : "false");
      input.parentElement.classList.toggle("err", !!bad[id]);
    });
    var consent = $("f-consent");
    if (consent) consent.setAttribute("aria-invalid", e.consent ? "true" : "false");
    var cal = $("calendar");
    if (cal) cal.classList.toggle("err", !!e.date);
    return e;
  }

  // ---------- Разметка ----------
  function errP(key) {
    return '<p class="err-msg" id="err-' + key + '" hidden>' + O.icon("alert") + "<span></span></p>";
  }

  function field(id, label, type, autocomplete, errIds, placeholder) {
    return '<div class="field"><label for="' + id + '">' + esc(label) + "</label>" +
      '<input id="' + id + '" type="' + type + '"' + (type === "tel" ? ' inputmode="tel"' : "") +
      ' autocomplete="' + autocomplete + '"' + (placeholder ? ' placeholder="' + esc(placeholder) + '"' : "") +
      ' aria-describedby="' + errIds + '"></div>';
  }

  function render() {
    var d = st.dessert, C = O.CONFIG;
    var isKg = d.unit === "кг";
    var minDate = O.addDays(O.today(), data.minDaysAhead);
    var maxDate = O.addDays(O.today(), data.maxDaysAhead);
    var hint = isKg
      ? O.fill(T.hintKg, { min: O.qtyText(d.min, "кг"), step: O.qtyText(d.step, "кг") })
      : O.fill(T.hintPieces, { min: O.qtyText(d.min, "шт") });

    var html =
      '<a class="back" href="#">' + O.icon("left") + esc(T.back) + "</a>" +
      "<h1>" + esc(T.formTitle) + "</h1>" +
      '<div class="card picked">' + O.photoHtml(d, "thumb") +
        '<div class="grow"><h3>' + esc(d.name) + '</h3><p class="small muted">' +
        esc(O.unitPriceText(d) + " " + (isKg ? T.perKg : T.perPiece)) + "</p></div>" +
        '<a class="link small" href="#">' + esc(T.change) + "</a></div>" +

      "<fieldset><legend>" + esc(isKg ? T.weight : T.quantity) + "</legend>" +
        '<div class="stepper">' +
          '<button type="button" id="qty-minus" aria-label="' + esc(T.less) + '">' + O.icon("minus") + "</button>" +
          '<output id="qty" aria-live="polite"></output>' +
          '<button type="button" id="qty-plus" aria-label="' + esc(T.more) + '">' + O.icon("plus") + "</button>" +
        "</div>" +
        '<p class="hint">' + esc(hint) + "</p>" + errP("qty") +
        '<div class="pricebox"><p class="small muted">' + esc(T.priceTitle) + "</p>" +
          '<p class="big" id="price" aria-live="polite"></p>' +
          '<p class="small muted">' + esc(T.priceNote) + "</p></div>" +
      "</fieldset>";

    if (d.fillings.length) {
      html += "<fieldset><legend>" + esc(T.filling) + ' <span class="opt">' + esc(T.optional) + "</span></legend>" +
        '<div class="chips" role="radiogroup" aria-label="' + esc(T.filling) + '">' +
        d.fillings.map(function (f) {
          return '<button type="button" class="chip" role="radio" data-filling="' + esc(f) + '">' + esc(f) + "</button>";
        }).join("") + "</div></fieldset>";
    }

    html += "<fieldset><legend>" + esc(T.date) + "</legend>" +
      '<div class="card cal" id="calendar" tabindex="-1"></div>' +
      '<div id="no-dates" hidden><div class="alert neutral" role="status">' + O.icon("clock") +
        "<p>" + esc(T.noDates) + " " + O.contactLinks() + "</p></div></div>" +
      '<p class="tip" id="busy-tip" role="status" hidden></p>' +
      '<p class="picked-date" id="picked-date" hidden></p>' + errP("date") +
      "</fieldset>";

    html += "<fieldset><legend>" + esc(T.howGet) + "</legend>" +
      '<div class="seg" role="radiogroup" aria-label="' + esc(T.howGet) + '">' +
        '<button type="button" role="radio" data-method="pickup">' + esc(T.pickup) + "</button>" +
        '<button type="button" role="radio" data-method="delivery">' + esc(T.delivery) + "</button>" +
      "</div>" +
      '<p class="hint" id="pickup-box">' + esc(O.fill(T.pickupHint, { address: C.pickupAddress })) + "</p>" +
      '<div id="delivery-box">' + field("f-address", T.address, "text", "street-address", "err-address") +
        errP("address") + '<p class="hint">' + esc(T.deliveryHint) + "</p></div>" +
      "</fieldset>";

    html += "<fieldset><legend>" + esc(T.yourData) + "</legend>" +
      // Только в демо: у клиентов поля demoNotice в config.js нет
      (C.demoNotice ? '<div class="alert neutral demo-note" role="note">' + O.icon("alert") + "<p>" + esc(C.demoNotice) + "</p></div>" : "") +
      field("f-name", T.name, "text", "given-name", "err-name") + errP("name") +
      field("f-phone", T.phone, "tel", "tel", "err-phone err-contact") + errP("phone") +
      field("f-telegram", T.telegram, "text", "off", "err-telegram err-contact", T.telegramPlaceholder) + errP("telegram") +
      '<p class="hint">' + esc(T.contactHint) + "</p>" + errP("contact") +
      '<div class="field"><label for="f-wishes">' + esc(T.wishes) + ' <span class="opt">' + esc(T.optional) + "</span></label>" +
        '<textarea id="f-wishes" maxlength="500" placeholder="' + esc(T.wishesPlaceholder) + '"></textarea>' +
        '<p class="counter" id="wishes-count" aria-live="polite"></p></div>' +
      "</fieldset>";

    // Ловушка для роботов: поле не видно людям, робот его заполнит — и заявку скрипт выбросит
    html += '<div class="hp" aria-hidden="true"><label for="f-website">Сайт</label>' +
      '<input id="f-website" type="text" tabindex="-1" autocomplete="off"></div>';

    html += '<label class="consent"><input type="checkbox" id="f-consent" aria-describedby="err-consent">' +
      "<span>" + esc(T.consent) + ' <button type="button" class="linkbtn" id="privacy-open">' + esc(T.consentMore) + "</button></span></label>" +
      errP("consent");

    html += '<div class="sticky">' +
      '<div class="alert" id="send-error" role="alert" hidden>' + O.icon("alert") + "<p>" +
        O.fill(esc(T.sendError), { contact: O.contactLinks() }) + "</p></div>" +
      '<div class="sum"><span class="muted">' + esc(T.approx) + '</span><b id="price-bar"></b></div>' +
      '<button class="btn" type="button" id="submit"></button></div>';

    var root = $("screen-form");
    root.innerHTML = html;

    // Значения из состояния (если покупатель вернулся из каталога)
    $("f-address").value = st.address;
    $("f-name").value = st.name;
    $("f-phone").value = st.phone;
    $("f-telegram").value = st.telegram;
    $("f-wishes").value = st.wishes;
    $("f-consent").checked = st.consent;

    var cal = new O.Calendar($("calendar"), {
      minDate: minDate, maxDate: maxDate, busy: data.busyDates, selected: st.date,
      onSelect: function (key) { st.date = key; st.dateTaken = false; $("busy-tip").hidden = true; update(); },
      onBusy: function () {
        var tip = $("busy-tip");
        tip.innerHTML = esc(T.busyTip) + " " + O.contactLinks();
        tip.hidden = false;
      }
    });
    if (!cal.hasFreeDates()) { $("calendar").hidden = true; $("no-dates").hidden = false; }

    bind(root);
    update();
  }

  // Обновляем то, что зависит от состояния, без перерисовки всей формы
  function update() {
    var d = st.dessert, price = O.priceText(d, st.qty);
    $("qty").textContent = O.qtyText(st.qty, d.unit);
    $("qty-minus").disabled = st.qty - d.step < d.min - 1e-9;
    $("price").textContent = price;
    $("price-bar").textContent = price;

    document.querySelectorAll("[data-filling]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.filling === st.filling));
    });
    document.querySelectorAll("[data-method]").forEach(function (b) {
      b.setAttribute("aria-checked", String(b.dataset.method === st.method));
    });
    $("pickup-box").hidden = st.method !== "pickup";
    $("delivery-box").hidden = st.method !== "delivery";

    var picked = $("picked-date");
    picked.hidden = !st.date;
    if (st.date) picked.textContent = O.fill(T.pickedDate, { date: O.dateLong(O.parseKey(st.date)) });

    $("wishes-count").textContent = st.wishes.length + " / 500";

    var btn = $("submit");
    btn.disabled = st.sending;
    btn.innerHTML = st.sending
      ? '<span class="spin" aria-hidden="true"></span>' + esc(T.sending)
      : O.icon("send") + esc(st.sendFailed ? T.retry : T.submit);
    $("send-error").hidden = !st.sendFailed || st.sending;

    showErrors();
  }

  function bind(root) {
    $("qty-minus").addEventListener("click", function () {
      var d = st.dessert;
      st.qty = Math.max(d.min, Math.round((st.qty - d.step) * 100) / 100);
      update();
    });
    $("qty-plus").addEventListener("click", function () {
      st.qty = Math.round((st.qty + st.dessert.step) * 100) / 100;
      update();
    });

    root.addEventListener("click", function (e) {
      var chip = e.target.closest("[data-filling]");
      if (chip) {
        // повторное нажатие снимает выбор: начинка необязательна
        st.filling = st.filling === chip.dataset.filling ? "" : chip.dataset.filling;
        update();
        return;
      }
      var m = e.target.closest("[data-method]");
      if (m) { st.method = m.dataset.method; update(); return; }
      if (e.target.closest("#privacy-open")) { e.preventDefault(); O.openPrivacy(); return; }
      if (e.target.closest("#submit")) submit();
    });

    [["f-address", "address"], ["f-name", "name"], ["f-phone", "phone"], ["f-telegram", "telegram"], ["f-wishes", "wishes"]]
      .forEach(function (pair) {
        $(pair[0]).addEventListener("input", function (e) {
          st[pair[1]] = e.target.value;
          if (pair[1] === "wishes") $("wishes-count").textContent = st.wishes.length + " / 500";
          if (st.tried) showErrors();
        });
      });
    $("f-consent").addEventListener("change", function (e) { st.consent = e.target.checked; if (st.tried) showErrors(); });

    // Пока человек печатает (открыта клавиатура), панель с кнопкой не прилипает к низу и не закрывает поле
    root.addEventListener("focusin", function (e) {
      if (e.target.matches("input[type=text], input[type=tel], textarea")) document.body.classList.add("typing");
    });
    root.addEventListener("focusout", function () { document.body.classList.remove("typing"); });
  }

  // ---------- Отправка ----------
  function buildRequest() {
    var d = st.dessert, tg = st.telegram.trim();
    return {
      dessertId: d.id,
      dessertName: d.name,
      unit: d.unit,
      qty: st.qty,
      qtyText: O.qtyText(st.qty, d.unit),
      filling: st.filling,
      hasFillings: d.fillings.length > 0,
      priceText: O.priceText(d, st.qty),
      date: st.date,
      dateText: O.dateLong(O.parseKey(st.date)),
      method: st.method,
      address: st.method === "delivery" ? st.address.trim() : "",
      name: st.name.trim(),
      phone: st.phone.trim(),
      telegram: tg ? "@" + tgNick(tg) : "",
      wishes: st.wishes.trim(),
      consent: true,
      website: $("f-website") ? $("f-website").value : ""
    };
  }

  function submit() {
    if (st.sending) return;   // повторное нажатие во время отправки ничего не делает
    st.tried = true;
    var e = showErrors();
    var first = ORDER.filter(function (k) { return e[k]; })[0];
    if (first) {
      var target = $(FOCUS[first]);
      target.scrollIntoView({ block: "center" });
      target.focus({ preventScroll: true });
      return;
    }
    st.sending = true;
    st.sendFailed = false;
    update();
    var request = buildRequest();
    var sending = st;
    O.sendRequest(request).then(function () {
      O.lastSent = request;
      st = null;              // после отправки форма очищается
      location.hash = "#gotovo";
    }, function (err) {
      sending.sending = false;
      // Пока покупатель заполнял форму, кондитер отметил эту дату занятой
      if (err && err.code === "date_taken") {
        data.busyDates.push(sending.date);
        sending.date = "";
        sending.dateTaken = true;
        sending.sendFailed = false;
        if (st === sending) {
          render();
          var cal = $("calendar");
          cal.scrollIntoView({ block: "center" });
          cal.focus({ preventScroll: true });
        }
        return;
      }
      sending.sendFailed = true;
      if (st === sending) update();
    });
  }

  O.Form = {
    // Открыть форму для десерта. Если покупатель сменил десерт, остальные поля сохраняются.
    open: function (dessert, catalogData) {
      data = catalogData;
      if (!st) st = freshState();
      if (!st.dessert || st.dessert.id !== dessert.id) {
        st.dessert = dessert;
        st.qty = dessert.min;
        st.filling = "";
      }
      render();
    }
  };
})(window.Okno);
