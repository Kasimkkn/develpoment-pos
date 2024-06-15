
const $ = require("jquery");
const todaySaleInput = document.getElementById("todaysdatepicker");
let datesByInput;
let dailySales = [];

document.addEventListener("DOMContentLoaded", () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  todaySaleInput.value = todayDate;
  const dateString = todaySaleInput.value;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  datesByInput = `${year}-${month}-${day}`;

  fetchDailySales(datesByInput);
  ipcRenderer.on("daily-sales-data", (event, data) => {
    dailySales = data;
    renderDailySales(data);
  });
});

todaySaleInput.addEventListener("input", () => {
  const datesByInput = todaySaleInput.value;
  fetchDailySales(datesByInput);
  ipcRenderer.on("daily-sales-data", (event, data) => {
    dailySales = data;
    renderDailySales(data);
  });
});

const fetchDailySales = async (datesByInput) => {
  try {
    ipcRenderer.send("fetch-daily-sales", datesByInput);
    if (
      ipcRenderer.on("daily-sales-data", (event, data) => {
        dailySales = data;
        renderDailySales(data);
      })
    ) {
      renderDailySales(dailySales);
    }
  } catch (error) {
    console.log(error);
  }
};

const renderDailySales = (data) => {
  const dailySalesTable = $("#daily-sales-table").DataTable({
    layout: {
      topStart: {
        buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
      }
    },
    responsive: true,
    destroy: true,
    paging: false,
    info: false,
    ordering: false
  });

  dailySalesTable.clear();

  let totalAmount = 0;
  let totalTax = 0;
  let totalRound = 0;
  let totalDiscountPerc = 0;
  let totalDiscount = 0;
  let totalFinal = 0;
  let cashPayment = 0;
  let cardPayment = 0;
  let upiPayment = 0;
  let otherPayment = 0;

  data[0]?.sales?.forEach((sale) => {
    dailySalesTable.row
      .add([
        sale.bill_no,
        sale.total_amount.toFixed(2),
        sale.discount_perc ? (sale.total_amount * sale.discount_perc / 100).toFixed(2) : '0.00',
        sale.discount_rupees ? sale.discount_rupees : '0.00',
        sale.total_tax.toFixed(2),
        sale.round_off ? sale.round_off : '',
        sale.final_amount.toFixed(2),
        sale.cash_pay ? sale.final_amount.toFixed(2) : '0.00',
        sale.card_pay ? sale.final_amount.toFixed(2) : '0.00',
        sale.upi_pay ? sale.final_amount.toFixed(2) : '0.00',
        sale.other_pay ? sale.final_amount.toFixed(2) : '0.00',
      ])
      .draw(false);

    if (!sale.round_off.startsWith("-")) {
      totalRound += Number(sale.round_off);
    } else if (sale.round_off.startsWith("-")) {
      totalRound -= Number(sale.round_off.split("-")[1]);
    }

    totalAmount += parseFloat(sale.total_amount);
    totalTax += parseFloat(sale.total_tax);
    totalDiscountPerc += sale.discount_perc ? parseFloat(sale.total_amount * sale.discount_perc / 100) : 0;
    totalDiscount += sale.discount_rupees ? parseFloat(sale.discount_rupees) : 0;
    totalFinal += parseFloat(sale.final_amount);

    if (sale.cash_pay) cashPayment += parseFloat(sale.final_amount);
    if (sale.card_pay) cardPayment += parseFloat(sale.final_amount);
    if (sale.upi_pay) upiPayment += parseFloat(sale.final_amount);
    if (sale.other_pay) otherPayment += parseFloat(sale.final_amount);
  });

  // Add total row
  dailySalesTable.row
    .add([
      'Total',
      totalAmount.toFixed(2),
      totalDiscountPerc.toFixed(2),
      totalDiscount.toFixed(2),
      totalTax.toFixed(2),
      totalRound.toFixed(2),
      totalFinal.toFixed(2),
      cashPayment.toFixed(2),
      cardPayment.toFixed(2),
      upiPayment.toFixed(2),
      otherPayment.toFixed(2),
    ])
    .draw(false);
};
