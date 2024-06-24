
const $ = require("jquery");
const fromMonthDate = document.getElementById("fromMonthDate");
const toMonthDate = document.getElementById("toMonthDate");
const generateReportBtn = document.getElementById("generateMonthlyButton");


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toMonthDate.value = todayDate;
    fromMonthDate.value = todayDate;
    fetchMonthlyPurchase(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromMonthDate.value;
    const toDate = toMonthDate.value;
    fetchMonthlyPurchase(fromDate, toDate);
})

const fetchMonthlyPurchase = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-monthly-purchase",  fromDate, toDate );
        ipcRenderer.once("monthly-purchase-data", (event, data) => {
            rendermonthlyPurchase(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const rendermonthlyPurchase = (data) => {
  console.log(data);
  const monthlyPurchaseTable = $("#monthly-purchase-table").DataTable({
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
  monthlyPurchaseTable.clear();

  let totalAmount = 0;

  data.forEach((sale) => {
    let totalItemAmount = 0;
    monthlyPurchaseTable.row
      .add([
        sale.purchase_no,
        sale.supplier_name ? sale.supplier_name : 'no name',
        new Date(sale.date).toLocaleDateString("en-GB"),
        `${sale.item_details[0].quantity} x ${sale.item_details[0].mrp} ${sale.item_details[0].item_name}`,
        `${sale.item_details[0].quantity * sale.item_details[0].mrp}`,
      ])
      .draw(false);
      totalItemAmount += sale.item_details[0].quantity * sale.item_details[0].mrp;
      totalAmount += totalItemAmount;
    });

  // Add total row
  monthlyPurchaseTable.row
    .add([
      '',
      '',
      '',
      'Total',
      totalAmount.toFixed(2),
    ])
    .draw(false);
};
