// Экран 1 «Каталог»: шапка, строки о сроках и самовывозе, карточки десертов, состояния.
window.Okno = window.Okno || {};

(function (O) {
  var T = O.TEXTS;

  function alertBox(text, kind) {
    return '<div class="alert' + (kind ? " " + kind : "") + '" role="status">' + O.icon("alert") +
      "<p>" + O.esc(text) + " " + O.contactLinks() + "</p></div>";
  }

  // Фото десерта или рисунок-заглушка, если фото нет
  O.photoHtml = function (d, cls) {
    if (d.photo) {
      return '<img class="' + cls + '" src="' + O.esc(d.photo) + '" alt="' + O.esc(O.fill(T.photoAlt, { name: d.name })) + '" loading="lazy">';
    }
    return '<div class="' + cls + ' placeholder" aria-hidden="true"><svg><use href="#cake"/></svg></div>';
  };

  O.Catalog = {
    // Шапка и строка о самовывозе — из настроек, видны сразу
    renderHeader: function () {
      var C = O.CONFIG;
      var logo = C.logo
        ? '<img class="logo" src="' + O.esc(C.logo) + '" alt="">'
        : '<div class="logo" aria-hidden="true">' + O.esc(C.initials) + "</div>";
      document.getElementById("brand").innerHTML = logo +
        "<div><h1>" + O.esc(C.name) + '</h1><p class="muted">' + O.esc(C.tagline) + "</p></div>";
      document.getElementById("info-pickup").innerHTML = O.icon("pin") + "<span>" +
        O.esc(O.fill(T.infoPickup, { address: C.pickupAddress, delivery: C.deliveryNote })) + "</span>";
      document.getElementById("contact-box").innerHTML = "<p><b>" + O.esc(T.contactTitle) + '</b></p><p class="row">' + O.contactLinks() + "</p>";
      document.title = C.name + " — " + C.tagline;
    },

    renderLoading: function () {
      var card = '<div class="card skel-card" aria-hidden="true"><div class="skel ph"></div><div class="skel" style="width:60%"></div><div class="skel" style="width:40%"></div></div>';
      document.getElementById("catalog").innerHTML = card + card +
        '<p class="small muted" role="status">' + O.esc(T.loadingCatalog) + "</p>";
    },

    renderError: function () {
      document.getElementById("catalog").innerHTML = alertBox(T.catalogError);
    },

    render: function (data) {
      document.getElementById("info-days").hidden = false;
      document.getElementById("info-days").innerHTML = O.icon("clock") + "<span>" +
        O.esc(O.fill(T.infoMinDays, { days: O.days(data.minDaysAhead) })) + "</span>";

      var box = document.getElementById("catalog");
      if (!data.desserts.length) { box.innerHTML = alertBox(T.catalogEmpty, "neutral"); return; }

      box.innerHTML = data.desserts.map(function (d) {
        return '<article class="card dessert">' + O.photoHtml(d, "photo") +
          '<div class="body">' +
            "<h3>" + O.esc(d.name) + "</h3>" +
            (d.description ? '<p class="muted">' + O.esc(d.description) + "</p>" : "") +
            '<p class="price">' + O.esc(O.unitPriceText(d)) + " <span>" + O.esc(d.unit === "кг" ? T.perKg : T.perPiece) + "</span></p>" +
            '<p class="small muted">' + O.esc(O.fill(T.minimum, { qty: O.qtyText(d.min, d.unit) })) + "</p>" +
            '<a class="btn" href="#zayavka?d=' + encodeURIComponent(d.id) + '">' + O.esc(T.choose) + "</a>" +
          "</div></article>";
      }).join("");
    }
  };
})(window.Okno);
