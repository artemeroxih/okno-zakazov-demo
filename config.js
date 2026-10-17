// Настройки кондитерской. Под нового клиента меняете только этот файл.
// Десерты, цены и занятые даты сюда не пишем: на этапе 4 они придут из Google Таблицы.
window.Okno = window.Okno || {};

Okno.CONFIG = {
  name: "Сладкая мастерская",
  initials: "СМ",                      // буквы в кружке вместо логотипа
  logo: "",                            // ссылка на картинку логотипа; пусто — показываем буквы
  tagline: "Торты и десерты на заказ",
  telegram: "@sladkaya_masterskaya",   // ник кондитера для связи (не бот)
  phone: "+7 900 000-00-00",
  pickupAddress: "ул. Садовая, 12",
  deliveryNote: "Доставка — по договорённости",

  // Только для демо: надпись над полями «Ваши данные». У страниц клиентов этого поля нет.
  demoNotice: "Это пример страницы. Не вводите настоящий телефон и адрес: пробная заявка придёт автору примера, а не кондитеру.",

  // Адрес скрипта Google при таблице кондитера (заканчивается на /exec).
  // Пусто — демо-режим: тестовые десерты, заявки никуда не уходят.
  apiUrl: "https://script.google.com/macros/s/AKfycbwI6pf6PSxQRWEre6YXOezKvmfS8sizRIMWsVK7IEaSC4Q50nqg5ca6QvhGP7_ATuL-NA/exec",

  // Быстрый каталог: ссылки на листы «Десерты», «Занятые даты», «Настройки»,
  // опубликованные в формате CSV (Файл → Поделиться → Опубликовать в интернете).
  // Лист «Заявки» НЕ публикуем. Пусто — каталог берётся через скрипт (медленнее).
  catalogCsv: {
    desserts: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvCYx9z1LlWEoTWSw6WTdgj4pKwFpuE2gZeaWhWENqJcT3TRIfQPYNfxmM66tzR3c7tIxghvS-nyOx/pub?gid=1873632063&single=true&output=csv",
    busy: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvCYx9z1LlWEoTWSw6WTdgj4pKwFpuE2gZeaWhWENqJcT3TRIfQPYNfxmM66tzR3c7tIxghvS-nyOx/pub?gid=1374354375&single=true&output=csv",
    settings: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQvCYx9z1LlWEoTWSw6WTdgj4pKwFpuE2gZeaWhWENqJcT3TRIfQPYNfxmM66tzR3c7tIxghvS-nyOx/pub?gid=310636172&single=true&output=csv"
  }
};
