
const $ = require("jquery");
const fromMonthDate = document.getElementById("fromMonthDate");
const toMonthDate = document.getElementById("toMonthDate");
const generateReportBtn = document.getElementById("generateMonthlyButton");


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toMonthDate.value = todayDate;
    fromMonthDate.value = todayDate;
    fetchPartyWisePurchase(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromMonthDate.value;
    const toDate = toMonthDate.value;
    fetchPartyWisePurchase(fromDate, toDate);
})

const fetchPartyWisePurchase = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-supplier-wise-purchase",  fromDate, toDate );
        ipcRenderer.once("supplier-wise-purchase-data", (event, data) => {
            renderPartyWisePurchase(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const renderPartyWisePurchase = (data) => {
    console.log(data);
    const PartyPurchaseTable = $("#party-wise-purchase-table").DataTable({
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
        const itemDetails = `${purchase.totalQuantity}kg x ${(purchase.totalAmount / purchase.totalQuantity).toFixed(0)} `;
        PartyPurchaseTable.row
          .add([
            purchase.purchase_no,
            supplier._id ? supplier._id : 'no name',
            new Date(purchase.date).toLocaleDateString("en-GB"),
            purchase.item_name,
            itemDetails,
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
  
