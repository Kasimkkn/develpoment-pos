
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
    console.log(data)
    if(data.length > 0){
        const initialColumns = [
            { title: "Date" },
            { title: "Total" },
            { title: "Discount By %" },
            { title: "Discount" },
            { title: "Total Tax" },
            { title: "Final Amount" }
        ];
    
        const payModes = {};
        data.forEach((sale) => {
            Object.keys(sale).forEach(key => {
                if (key.startsWith('total') && !payModes[key] && key !== 'totalAmount' && key !== 'totalFinalAmount' && key !== 'totalDiscountPerc' && key !== 'totalDiscount' && key !== 'totalTax') {
                    payModes[key] = true;
                }
            });
        });
    
        Object.keys(payModes).forEach(paymode => {
            initialColumns.push({ title: paymode.split("total")[1].toLowerCase() });
        });
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
        ordering: false,
        columns: initialColumns
    });
    PaymentWiseTable.clear();
    let totalAmount = 0;
    let totalFinalAmount = 0;
    let totalDiscountPerc = 0;
    let totalDiscount = 0;
    let totalTax = 0;

    data.forEach((sale) => {
        totalAmount += parseFloat(sale.totalAmount);
        totalFinalAmount += parseFloat(sale.totalFinalAmount);
        totalDiscountPerc += parseFloat(sale.totalDiscountPerc);
        totalDiscount += parseFloat(sale.totalDiscount);
        totalTax += parseFloat(sale.totalTax);

        const rowData = [
            new Date(sale._id.date).toLocaleDateString("en-GB"),
            sale.totalAmount.toFixed(2),
            sale.totalDiscountPerc ? sale.totalDiscountPerc.toFixed(2) : '0.00',
            sale.totalDiscount? sale.totalDiscount.toFixed(2) : '0.00',
            sale.totalTax? sale.totalTax.toFixed(2) : '0.00',
            sale.totalFinalAmount? sale.totalFinalAmount.toFixed(2) : '0.00',
            
        ]
        Object.keys(payModes).forEach(paymode => {
            rowData.push(sale[paymode.toLowerCase()] ? sale[paymode.toLowerCase()].toFixed(2) : '0.00');
        });
        
        PaymentWiseTable.row.add(rowData)
  });
    
      // Add total row
      PaymentWiseTable.row
        .add([
          'Total',
          totalAmount.toFixed(2),
          totalDiscountPerc.toFixed(2),
          totalDiscount.toFixed(2),
          totalTax.toFixed(2),
          totalFinalAmount.toFixed(2),
          ...Object.keys(payModes).map(paymode => {
            const total = data.reduce((total, sale) => total + (sale[paymode.toLowerCase()] || 0), 0);
            return total.toFixed(2);
        }),
        ]).draw(false);

        PaymentWiseTable.draw();
    } else {
        const locationWiseTable = $("#payment-wise-table").DataTable({
            layout: {
                topStart: {
                    buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5', 'pdfHtml5']
                }
            },
            responsive: true,
            destroy: true,
            paging: false,
            info: false,
            ordering: false,
        });
    
        // Clear existing table data
        locationWiseTable.clear();
    
        // Draw DataTable
        locationWiseTable.draw();
        }
};
