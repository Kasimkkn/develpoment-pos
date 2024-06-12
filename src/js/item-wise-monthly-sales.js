
const $ = require("jquery");
const fromItemWiseMonthDate = document.getElementById("fromItemWiseMonthDate");
const toItemWiseMonthDate = document.getElementById("toItemWiseMonthDate");
const generateReportBtn = document.getElementById("generateItemWiseMonthlyButton");

let itemWiseMonthlySales = [];

document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toItemWiseMonthDate.value = todayDate;
    fromItemWiseMonthDate.value = todayDate;
    fetchItemWiseMonthlySales(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromItemWiseMonthDate.value;
    const toDate = toItemWiseMonthDate.value;
    fetchItemWiseMonthlySales(fromDate, toDate);
})

const fetchItemWiseMonthlySales = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-ItemWise-monthly-sales",  fromDate, toDate );
        ipcRenderer.once("itemWise-sales-data", (event, data) => {
            itemWiseMonthlySales = data;
            rendermonthlySales(data);
        });
    } catch (error) {
        console.error("Error fetching monthly sales:", error);
    }
};

const rendermonthlySales = (data) => {
    const monthlySalesTable = $("#item-wise-monthly-table").DataTable({
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

    let totalQuantity = 0;
    let totalAmount = 0;

    data.forEach((sale) => {
        monthlySalesTable.row
            .add([
                sale.item_name,
                sale.quantity,
                sale.total.toFixed(2)
            ])
            .draw(false);

        // Accumulate totals
        totalQuantity += sale.quantity;
        totalAmount += sale.total;
    });

    // Add total row
    monthlySalesTable.row
        .add([
            'Total ',
            totalQuantity,
            totalAmount.toFixed(2)
        ])
        .draw(false);
};
