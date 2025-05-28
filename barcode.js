
document.addEventListener("DOMContentLoaded", function () {
  const input = document.getElementById("num_doc");
  const canvas = document.getElementById("barcode");

  input.addEventListener("input", () => {
    JsBarcode(canvas, input.value, {
      format: "CODE128",
      displayValue: false,
      height: 40
    });
  });
});
