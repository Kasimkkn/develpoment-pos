
const $ = require("jquery");
const todaysItemWisedate = document.getElementById("todaysItemWisedatepicker");
let datesByInput;
let itemWiseSales = [];



document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    todaysItemWisedate.value = todayDate;
    const dateString = todaysItemWisedate.value;
    const date = new Date(dateString)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesByInput = `${year}-${month}-${day}`;

    fetchitemWiseSales(datesByInput);
    ipcRenderer.on("itemWise-sales-data", (event, data) => {
        itemWiseSales = data;
        renderitemWiseSales(data);
    })
})

todaysItemWisedate.addEventListener("input", () => {
    const datesByInput = todaysItemWisedate.value;
    fetchitemWiseSales(datesByInput);
    ipcRenderer.on("itemWise-sales-data", (event, data) => {
        itemWiseSales = data;
        renderitemWiseSales(data);
    })
})

const fetchitemWiseSales = async (datesByInput) => {
    try {
        ipcRenderer.send("fetch-itemWise-sales", datesByInput);
        if (ipcRenderer.on("itemWise-sales-data", (event, data) => {
            itemWiseSales = data;
            renderitemWiseSales(data);
        })) {
            renderitemWiseSales(itemWiseSales);
        }
    }
    catch (error) {
        console.log(error);
    }
}

const renderitemWiseSales = (data) => {
    const itemWiseSalesTable = $("#Item-Wise-Daily-table").DataTable({
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
    itemWiseSalesTable.clear();

    let totalQuantity = 0;
    let totalAmount = 0;

    data.forEach((sale) => {
        itemWiseSalesTable.row
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
    itemWiseSalesTable.row
        .add([
            'Total',
            totalQuantity,
            totalAmount.toFixed(2)
        ])
        .draw(false);
};
