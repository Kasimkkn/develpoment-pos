
const $ = require("jquery");
const fromMonthDate = document.getElementById("fromMonthDate");
const toMonthDate = document.getElementById("toMonthDate");
const generateReportBtn = document.getElementById("generateMonthlyButton");


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toMonthDate.value = todayDate;
    fromMonthDate.value = todayDate;
    fetchMonthlySales(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromMonthDate.value;
    const toDate = toMonthDate.value;
    fetchMonthlySales(fromDate, toDate);
})

const fetchMonthlySales = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-monthly-sales",  fromDate, toDate );
        ipcRenderer.once("monthly-sales-data", (event, data) => {
            monthlySales = data;
            rendermonthlySales(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const rendermonthlySales = (data) => {
  const monthlySalesTable = $("#monthly-sales-table").DataTable({
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
  monthlySalesTable.clear();

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
    monthlySalesTable.row
      .add([
        sale.bill_no,
        new Date(sale.created_at).toLocaleDateString("en-GB"),
        sale.total_amount.toFixed(2),
        `${sale.discount_perc ? (sale.total_amount * (sale.discount_perc / 100)).toFixed(2)  : '0.00'}`,
        `${sale.discount_rupees ? sale.discount_rupees.toFixed(2) : '0.00'}`,
        `${sale.total_tax ? sale.total_tax.toFixed(2) : '0.00'}`,
        `${sale.round_off}`,
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
  monthlySalesTable.row
    .add([
      '',
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
