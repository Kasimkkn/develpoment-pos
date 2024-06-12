
const $ = require("jquery");
const todaySaleInput = document.getElementById("todaysdatepicker");
let datesByInput;
let unpaidBills = [];

document.addEventListener("DOMContentLoaded", () => {
  const todayDate = new Date().toISOString().slice(0, 10);
  todaySaleInput.value = todayDate;
  const dateString = todaySaleInput.value;
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  datesByInput = `${year}-${month}-${day}`;

  fetchunpaidBills(datesByInput);
  ipcRenderer.on("unpaid-bills-data", (event, data) => {
    unpaidBills = data;
    renderunpaidBills(data);
  });
});

todaySaleInput.addEventListener("input", () => {
  const datesByInput = todaySaleInput.value;
  fetchunpaidBills(datesByInput);
  ipcRenderer.on("unpaid-bills-data", (event, data) => {
    unpaidBills = data;
    renderunpaidBills(data);
  });
});

const fetchunpaidBills = async (datesByInput) => {
  try {
    ipcRenderer.send("fetch-unpaid-bills", datesByInput);
    if (
      ipcRenderer.on("unpaid-bills-data", (event, data) => {
        unpaidBills = data;
        renderunpaidBills(data);
      })
    ) {
      renderunpaidBills(unpaidBills);
    }
  } catch (error) {
    console.log(error);
  }
};

const renderunpaidBills = (data) => {
  const unpaidBillsTable = $("#unpaid-bills-table").DataTable({
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

  unpaidBillsTable.clear();

  let totalAmount = 0;
 
  data.forEach((sale) => {

    unpaidBillsTable.row
      .add([
        sale._doc.bill_no,
        sale._doc.location_name,
        sale._doc.table_no,
        sale._doc.final_amount.toFixed(2),
        String(sale._doc.created_at).split("T")[0],
      ])
      .draw(false);

    totalAmount += sale._doc.final_amount;
  });

  // Add total row
  unpaidBillsTable.row
    .add([
      ' ',
      ' ',
      'Total',
      totalAmount.toFixed(2),
      ' ',
    ])
    .draw(false);
};
