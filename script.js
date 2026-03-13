const itemsBody = document.getElementById("itemsBody");
const previewItemsBody = document.getElementById("previewItemsBody");

const currencySymbols = {
  BDT: "৳",
  USD: "$",
  AUD: "A$",
  GBP: "£",
  EUR: "€"
};

function setDefaultDates() {
  const today = new Date();
  const due = new Date();
  due.setDate(today.getDate() + 7);

  document.getElementById("invoiceDate").value = formatDateInput(today);
  document.getElementById("dueDate").value = formatDateInput(due);
}

function formatDateInput(date) {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function getCurrencySymbol() {
  const currency = document.getElementById("currency").value;
  return currencySymbols[currency] || "";
}

function formatMoney(value) {
  const currency = document.getElementById("currency").value;
  const symbol = getCurrencySymbol();

  const num = Number(value || 0);

  if (currency === "USD" || currency === "AUD" || currency === "GBP" || currency === "EUR") {
    return `${symbol}${num.toFixed(2)}`;
  }
  return `${symbol}${num.toFixed(2)}`;
}

function createItemRow(item = {}) {
  const tr = document.createElement("tr");
  tr.innerHTML = `
    <td>
      <input class="item-input desc" type="text" placeholder="Product or service" value="${item.desc || ""}">
    </td>
    <td>
      <input class="item-input qty" type="number" min="1" step="1" value="${item.qty || 1}">
    </td>
    <td>
      <input class="item-input price" type="number" min="0" step="0.01" value="${item.price || 0}">
    </td>
    <td class="line-total">${formatMoney(0)}</td>
    <td>
      <button class="remove-btn">Remove</button>
    </td>
  `;

  tr.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", updateInvoice);
  });

  tr.querySelector(".remove-btn").addEventListener("click", () => {
    tr.remove();
    updateInvoice();
  });

  itemsBody.appendChild(tr);
  updateInvoice();
}

function getItems() {
  const rows = [...itemsBody.querySelectorAll("tr")];
  return rows.map((row) => {
    const desc = row.querySelector(".desc").value.trim();
    const qty = parseFloat(row.querySelector(".qty").value) || 0;
    const price = parseFloat(row.querySelector(".price").value) || 0;
    const total = qty * price;

    row.querySelector(".line-total").textContent = formatMoney(total);

    return { desc, qty, price, total };
  });
}

function updateInvoice() {
  const invoiceNumber = document.getElementById("invoiceNumber").value;
  const invoiceDate = document.getElementById("invoiceDate").value;
  const dueDate = document.getElementById("dueDate").value;
  const currency = document.getElementById("currency").value;

  const fromName = document.getElementById("fromName").value;
  const fromEmail = document.getElementById("fromEmail").value;
  const fromAddress = document.getElementById("fromAddress").value;

  const clientName = document.getElementById("clientName").value;
  const clientEmail = document.getElementById("clientEmail").value;
  const clientAddress = document.getElementById("clientAddress").value;

  const paymentMethod = document.getElementById("paymentMethod").value;
  const bankName = document.getElementById("bankName").value;
  const bankDetails = document.getElementById("bankDetails").value;
  const note = document.getElementById("note").value;

  const taxPercent = parseFloat(document.getElementById("tax").value) || 0;
  const discount = parseFloat(document.getElementById("discount").value) || 0;
  const shipping = parseFloat(document.getElementById("shipping").value) || 0;

  document.getElementById("previewInvoiceNumber").textContent = invoiceNumber || "-";
  document.getElementById("previewInvoiceDate").textContent = formatDisplayDate(invoiceDate);
  document.getElementById("previewDueDate").textContent = formatDisplayDate(dueDate);
  document.getElementById("previewCurrency").textContent = currency;

  document.getElementById("previewFromName").textContent = fromName || "-";
  document.getElementById("previewFromEmail").textContent = fromEmail || "-";
  document.getElementById("previewFromAddress").textContent = fromAddress || "-";

  document.getElementById("previewClientName").textContent = clientName || "Client Name";
  document.getElementById("previewClientEmail").textContent = clientEmail || "client@email.com";
  document.getElementById("previewClientAddress").textContent = clientAddress || "Client address";

  document.getElementById("previewPaymentMethod").textContent = paymentMethod || "-";
  document.getElementById("previewBankName").textContent = bankName || "-";
  document.getElementById("previewBankDetails").textContent = bankDetails || "-";
  document.getElementById("previewNote").textContent = note || "Thank you for your business.";

  const items = getItems();
  previewItemsBody.innerHTML = "";

  let subtotal = 0;

  items.forEach((item) => {
    subtotal += item.total;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.desc || "-"}</td>
      <td>${item.qty}</td>
      <td>${formatMoney(item.price)}</td>
      <td>${formatMoney(item.total)}</td>
    `;
    previewItemsBody.appendChild(row);
  });

  const taxAmount = subtotal * (taxPercent / 100);
  const grandTotal = subtotal + taxAmount + shipping - discount;

  document.getElementById("previewSubtotal").textContent = formatMoney(subtotal);
  document.getElementById("previewTax").textContent = formatMoney(taxAmount);
  document.getElementById("previewDiscount").textContent = formatMoney(discount);
  document.getElementById("previewShipping").textContent = formatMoney(shipping);
  document.getElementById("previewGrandTotal").textContent = formatMoney(grandTotal);
}

function setupInputs() {
  const fields = document.querySelectorAll("input, textarea, select");
  fields.forEach((field) => {
    field.addEventListener("input", updateInvoice);
    field.addEventListener("change", updateInvoice);
  });
}

function setupTheme() {
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("invoiceTheme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️ Light Mode";
  }

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    const isDark = document.body.classList.contains("dark");

    themeToggle.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    localStorage.setItem("invoiceTheme", isDark ? "dark" : "light");
  });
}

async function downloadPDF() {
  const invoice = document.getElementById("invoicePreview");
  const { jsPDF } = window.jspdf;

  const originalBoxShadow = invoice.style.boxShadow;
  const originalBorderRadius = invoice.style.borderRadius;

  invoice.style.boxShadow = "none";
  invoice.style.borderRadius = "0";

  const canvas = await html2canvas(invoice, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff"
  });

  invoice.style.boxShadow = originalBoxShadow;
  invoice.style.borderRadius = originalBorderRadius;

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = 210;
  const pdfHeight = 297;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  const fileName = `${document.getElementById("invoiceNumber").value || "invoice"}.pdf`;
  pdf.save(fileName);
}

document.getElementById("addItemBtn").addEventListener("click", () => {
  createItemRow({
    desc: "",
    qty: 1,
    price: 0
  });
});

document.getElementById("downloadPdf").addEventListener("click", downloadPDF);

setDefaultDates();
setupInputs();
setupTheme();

createItemRow({ desc: "Website Design Service", qty: 1, price: 5000 });
createItemRow({ desc: "Hosting & Maintenance", qty: 1, price: 2000 });

updateInvoice();
