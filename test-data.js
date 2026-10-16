// ТЕСТОВЫЕ данные для этапа 3. На этапе 4 их заменит Google Таблица кондитера.
// Поля те же, что будут в таблице.
window.Okno = window.Okno || {};

(function (O) {
  // Занятые даты считаем от сегодняшнего дня, чтобы тест работал в любой день
  function inDays(n) { return O.dateKey(O.addDays(O.today(), n)); }

  O.TEST_DATA = {
    minDaysAhead: 2,   // раньше чем через 2 дня заявку не принимаем
    maxDaysAhead: 60,  // дальше чем через 60 дней — тоже
    busyDates: [inDays(4), inDays(8), inDays(9)],
    desserts: [
      {
        id: "prazdnik", show: true,
        name: "Торт на праздник",
        description: "Бисквит с кремом и ягодами, декор по вашему желанию",
        photo: "",
        unit: "кг", priceFrom: 2500, priceTo: 3200, min: 1.5, step: 0.5,
        fillings: ["Ваниль и вишня", "Шоколад и карамель", "Сливочный сыр и малина"]
      },
      {
        id: "bento", show: true,
        name: "Бенто-торт",
        description: "Маленький торт на 2–3 человека в коробочке",
        photo: "",
        unit: "шт", priceFrom: 1800, priceTo: 2300, min: 1, step: 1,
        fillings: ["Ваниль и вишня", "Шоколад и карамель"]
      },
      {
        id: "kapkeyki", show: true,
        name: "Капкейки",
        description: "С кремовой шапочкой, можно в цвет праздника",
        photo: "",
        unit: "шт", priceFrom: 250, priceTo: 350, min: 6, step: 1,
        fillings: ["Ваниль", "Шоколад", "Красный бархат"]
      },
      {
        id: "medovik", show: true,
        name: "Медовик",
        description: "Тонкие медовые коржи и сметанный крем",
        photo: "",
        unit: "кг", priceFrom: 2200, priceTo: 2200, min: 1, step: 0.5,
        fillings: []   // начинок нет — поле «Начинка» не показываем
      },
      {
        id: "kulich", show: false,   // скрыт владельцем — в каталоге его быть не должно
        name: "Кулич",
        description: "Скрытый десерт для проверки",
        photo: "",
        unit: "шт", priceFrom: 900, priceTo: 900, min: 1, step: 1,
        fillings: []
      }
    ]
  };
})(window.Okno);
