// ЗАГЛУШКИ этапа 3: вместо Google Таблицы и Telegram.
// На этапе 4 этот файл заменим настоящими подключениями.
//
// Для проверки состояний добавьте к адресу страницы:
//   ?test=load-error  — каталог не загрузился
//   ?test=empty       — нет десертов
//   ?test=no-dates    — нет свободных дат
//   ?test=send-error  — заявка не отправилась
window.Okno = window.Okno || {};

(function (O) {
  var mode = new URLSearchParams(location.search).get("test") || "";

  function later(ms, fn) { return new Promise(function (resolve) { setTimeout(resolve, ms); }).then(fn); }

  // Загрузка каталога, занятых дат и сроков
  O.loadCatalog = function () {
    return later(500, function () {
      if (mode === "load-error") throw new Error("Тест: каталог не загрузился");
      var data = JSON.parse(JSON.stringify(O.TEST_DATA));
      if (mode === "empty") data.desserts = [];
      if (mode === "no-dates") {
        data.busyDates = [];
        for (var i = 0; i <= data.maxDaysAhead; i++) data.busyDates.push(O.dateKey(O.addDays(O.today(), i)));
      }
      return data;
    });
  };

  // Отправка заявки. Пока только показываем сообщение в консоли браузера (F12 → Console).
  O.sendRequest = function (request) {
    return later(800, function () {
      if (mode === "send-error") throw new Error("Тест: заявка не отправилась");
      var text = O.buildTelegramMessage(request);
      O.lastTelegramText = text;   // для проверки
      console.info("[Заглушка] Это сообщение получил бы кондитер в Telegram:\n\n" + text);
      return { ok: true };
    });
  };
})(window.Okno);
