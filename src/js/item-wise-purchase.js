
const $ = require("jquery");
const fromMonthDate = document.getElementById("fromMonthDate");
const toMonthDate = document.getElementById("toMonthDate");
const generateReportBtn = document.getElementById("generateMonthlyButton");


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toMonthDate.value = todayDate;
    fromMonthDate.value = todayDate;
    fetchItemyWisePurchase(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromMonthDate.value;
    const toDate = toMonthDate.value;
    fetchItemyWisePurchase(fromDate, toDate);
})

const fetchItemyWisePurchase = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-item-wise-purchase",  fromDate, toDate );
        ipcRenderer.once("item-wise-purchase-data", (event, data) => {
            renderItemWisePurchase(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const renderItemWisePurchase = (data) => {
    
    const PartyPurchaseTable = $("#item-wise-purchase-table").DataTable({
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
    PartyPurchaseTable.clear();
  
    let totalAmount = 0;
  
    data.forEach((supplier) => {
      supplier.purchases.forEach((purchase) => {

        PartyPurchaseTable.row
          .add([
            purchase.purchase_no,
            new Date(purchase.date).toLocaleDateString("en-GB"),
            purchase.item_name,
            `${purchase.totalQuantity}kg`,
           `${(purchase.totalAmount / purchase.totalQuantity).toFixed(0)} `,
            purchase.totalAmount.toFixed(2),
          ])
          .draw(false);
  
        totalAmount += purchase.totalAmount;
      });
    });
  
    // Add total row
    PartyPurchaseTable.row
      .add([
        '',
        '',
        '',
        '',
        'Total',
        totalAmount.toFixed(2),
      ])
      .draw(false);
  };
  
