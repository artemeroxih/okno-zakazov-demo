// Текст сообщения кондитеру в Telegram (формат — паспорт, раздел 6).
window.Okno = window.Okno || {};

(function (O) {
  O.buildTelegramMessage = function (r) {
    var T = O.TEXTS;
    var qtyLabel = r.unit === "кг" ? T.weight : T.quantity;
    var method = r.method === "delivery" ? T.delivery.toLowerCase() + " — " + r.address : T.pickup.toLowerCase();

    var lines = [
      T.msgTitle,
      "",
      T.sumDessert + ": " + r.dessertName,
      qtyLabel + ": " + r.qtyText
    ];
    // У десерта без начинок строку «Начинка» не пишем
    if (r.hasFillings) lines.push(T.sumFilling + ": " + (r.filling || T.notChosen));
    lines.push(
      T.msgPrice + ": " + r.priceText,
      "",
      T.sumDate + ": " + r.dateText,
      T.sumMethod + ": " + method,
      "",
      T.msgName + ": " + r.name
    );
    if (r.phone) lines.push(T.msgPhone + ": " + r.phone);
    if (r.telegram) lines.push(T.msgTelegram + ": " + r.telegram);
    lines.push(T.msgWishes + ": " + (r.wishes || "—"));
    lines.push("", T.msgFooter);
    return lines.join("\n");
  };
})(window.Okno);
