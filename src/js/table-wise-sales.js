
const $ = require("jquery");

const fromTableWiseDate = document.getElementById("fromTableWiseDate");
const toTableWiseDate = document.getElementById("toTableWiseDate");
const generateReportBtn = document.getElementById("generateTableWiseButton");

let TableWise = [];

document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    toTableWiseDate.value = todayDate;
    fromTableWiseDate.value = todayDate;
    fetchTableWise(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromTableWiseDate.value;
    const toDate = toTableWiseDate.value;
    fetchTableWise(fromDate, toDate);
})

const fetchTableWise = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-tableWise-sales",  fromDate, toDate );
        ipcRenderer.once("tableWise-sales-data", (event, data) => {
            TableWise = data;
            renderTableWise(data);
        });
    } catch (error) {
        console.error("Error fetching tableWise sales:", error);
    }
};

const renderTableWise = (data) => {
    const TableWiseTable = $("#table-wise-report-table").DataTable({
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

    TableWiseTable.clear();

    let totalBills = 0;
    let totalAmount = 0;

    data.forEach((sale) => {
        TableWiseTable.row
            .add([
                sale._id,
                sale.count,
                sale.total_final_amount.toFixed(2)
            ])
            .draw(false);

        totalBills += sale.count;
        totalAmount += sale.total_final_amount;
    });

    TableWiseTable.row.add(['Total',totalBills, totalAmount.toFixed(2)]).draw(false);
};
