// Календарь выбора даты: месяц, листание, свободные / занятые / недоступные дни.
// Правила (паспорт, раздел 5): нельзя выбрать прошлое, раньше минимального срока,
// дальше горизонта и даты, которые владелец отметил «занята».
window.Okno = window.Okno || {};

(function (O) {
  var T = O.TEXTS;
  var WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

  // opts: { minDate, maxDate, busy: [ключи дат], selected, onSelect(key), onBusy(key) }
  O.Calendar = function (root, opts) {
    var busy = {};
    (opts.busy || []).forEach(function (k) { busy[k] = true; });
    var minKey = O.dateKey(opts.minDate), maxKey = O.dateKey(opts.maxDate);
    var selected = opts.selected || "";
    var start = selected ? O.parseKey(selected) : opts.minDate;
    var view = new Date(start.getFullYear(), start.getMonth(), 1);

    function stateOf(key) {
      if (key < minKey || key > maxKey) return "off";
      if (busy[key]) return "busy";
      return "free";
    }

    function render() {
      var y = view.getFullYear(), m = view.getMonth();
      var title = view.toLocaleDateString("ru-RU", { month: "long", year: "numeric" }).replace(" г.", "");
      title = title.charAt(0).toUpperCase() + title.slice(1);
      var first = new Date(y, m, 1);
      var shift = (first.getDay() + 6) % 7;           // понедельник — первый день недели
      var daysInMonth = new Date(y, m + 1, 0).getDate();
      var canPrev = O.dateKey(new Date(y, m, 0)) >= minKey;     // последний день прошлого месяца
      var canNext = O.dateKey(new Date(y, m + 1, 1)) <= maxKey; // первый день следующего месяца

      var html = '<div class="cal-head">' +
        '<button type="button" data-nav="-1" aria-label="' + O.esc(T.prevMonth) + '"' + (canPrev ? "" : " disabled") + ">" + O.icon("left") + "</button>" +
        '<b aria-live="polite">' + O.esc(title) + "</b>" +
        '<button type="button" data-nav="1" aria-label="' + O.esc(T.nextMonth) + '"' + (canNext ? "" : " disabled") + ">" + O.icon("right") + "</button>" +
        '</div><div class="grid7">' +
        WEEK.map(function (w) { return '<div class="wd" aria-hidden="true">' + w + "</div>"; }).join("");

      for (var i = 0; i < shift; i++) html += '<div class="day empty" aria-hidden="true"></div>';
      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(y, m, d), key = O.dateKey(date), st = stateOf(key);
        var label = O.dateLong(date);
        if (st === "off") {
          html += '<button type="button" class="day off" disabled aria-label="' + O.esc(label) + '">' + d + "</button>";
        } else if (st === "busy") {
          html += '<button type="button" class="day busy" data-busy="' + key + '" aria-disabled="true" aria-label="' +
            O.esc(O.fill(T.busyLabel, { date: label })) + '">' + d + "</button>";
        } else {
          var sel = key === selected;
          html += '<button type="button" class="day' + (sel ? " sel" : "") + '" data-key="' + key + '" aria-pressed="' + sel + '" aria-label="' + O.esc(label) + '">' + d + "</button>";
        }
      }
      html += "</div>" +
        '<div class="legend"><span><i class="l-free"></i>' + O.esc(T.legendFree) + "</span>" +
        '<span><i class="l-sel"></i>' + O.esc(T.legendSelected) + "</span>" +
        '<span><i class="l-busy"></i>' + O.esc(T.legendBusy) + "</span>" +
        "<span>" + O.esc(T.legendOff) + "</span></div>";
      root.innerHTML = html;
    }

    root.addEventListener("click", function (e) {
      var nav = e.target.closest("[data-nav]");
      if (nav && !nav.disabled) {
        view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.nav), 1);
        render();
        return;
      }
      var b = e.target.closest("[data-busy]");
      if (b) { opts.onBusy && opts.onBusy(b.dataset.busy); return; }
      var day = e.target.closest("[data-key]");
      if (day) {
        selected = day.dataset.key;
        render();
        opts.onSelect && opts.onSelect(selected);
      }
    });

    render();

    // Есть ли хоть одна свободная дата в разрешённом промежутке
    this.hasFreeDates = function () {
      for (var d = new Date(opts.minDate); O.dateKey(d) <= maxKey; d = O.addDays(d, 1)) {
        if (!busy[O.dateKey(d)]) return true;
      }
      return false;
    };
  };
})(window.Okno);
