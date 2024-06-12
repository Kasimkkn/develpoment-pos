
const $ = require("jquery");

const fromMonthDate = document.getElementById("fromMonthDate");
const toMonthDate = document.getElementById("toMonthDate");
const generateReportBtn = document.getElementById("generateMonthlyButton");


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toMonthDate.value = todayDate;
    fromMonthDate.value = todayDate;
    fetchPaymentWise(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromMonthDate.value;
    const toDate = toMonthDate.value;
    fetchPaymentWise(fromDate, toDate);
})

const fetchPaymentWise = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-paymentWise-sales",  fromDate, toDate );
        ipcRenderer.once("paymentWise-sales-data", (event, data) => {
            PaymentWise = data;
            renderPaymentWise(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const renderPaymentWise = (data) => {
    const PaymentWiseTable = $("#payment-wise-table").DataTable({
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
    PaymentWiseTable.clear();
    let totalAmount = 0;
    let totalFinalAmount = 0;
    let totalDiscountPerc = 0;
    let totalDiscount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let cashPayment = 0;
    let cardPayment = 0;
    let upiPayment = 0;
    let otherPayment = 0;

    data.forEach((sale) => {
        
        PaymentWiseTable.row
        .add([
            new Date(sale._id.date).toLocaleDateString(),
            sale.totalAmount.toFixed(2),
            sale.totalDiscountPerc ? sale.totalDiscountPerc.toFixed(2) : '',
            sale.totalDiscount.toFixed(2),
            sale.totalCgst.toFixed(2),
            sale.totalSgst.toFixed(2),
            sale.totalFinalAmount.toFixed(2),
            sale.totalCash ? Number(sale.totalCash).toFixed(2) : '',
            sale.totalCard ? Number(sale.totalCard).toFixed(2) : '',
            sale.totalUpi ? Number(sale.totalUpi).toFixed(2) : '',
            sale.totalOther ? Number(sale.totalOther).toFixed(2) : '',
          ])
          .draw(false);
    
        totalAmount += parseFloat(sale.totalAmount);
        totalFinalAmount += parseFloat(sale.totalFinalAmount);
        totalDiscountPerc += parseFloat(sale.totalDiscountPerc);
        totalDiscount += parseFloat(sale.totalDiscount);
        totalCgst += parseFloat(sale.totalCgst);
        totalSgst += parseFloat(sale.totalSgst);
    
        if (sale.totalCash) cashPayment += parseFloat(sale.totalCash);
        if (sale.totalCard) cardPayment += parseFloat(sale.totalCard);
        if (sale.totalUpi) upiPayment += parseFloat(sale.totalUpi);
        if (sale.totalOther) otherPayment += parseFloat(sale.totalOther);
      });
    
      // Add total row
      PaymentWiseTable.row
        .add([
          'Total',
          totalAmount.toFixed(2),
          totalDiscountPerc.toFixed(2),
          totalDiscount.toFixed(2),
          totalCgst.toFixed(2),
          totalSgst.toFixed(2),
          totalFinalAmount.toFixed(2),
          cashPayment.toFixed(2),
          cardPayment.toFixed(2),
          upiPayment.toFixed(2),
          otherPayment.toFixed(2),
        ])
        .draw(false);
};
