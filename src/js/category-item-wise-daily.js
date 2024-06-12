
const $ = require("jquery");
const todaysItemWisedate = document.getElementById("todaysItemWisedatepicker");
let datesByInput;
let categoryItemWiseSales = [];



document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    todaysItemWisedate.value = todayDate;
    const dateString = todaysItemWisedate.value;
    const date = new Date(dateString)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesByInput = `${year}-${month}-${day}`;

    fetchcategoryItemWiseSales(datesByInput);
    ipcRenderer.on("itemWise-sales-data", (event, data) => {
        categoryItemWiseSales = data;
        rendercategoryItemWiseSales(data);
    })
})

todaysItemWisedate.addEventListener("input", () => {
    const datesByInput = todaysItemWisedate.value;
    fetchcategoryItemWiseSales(datesByInput);
    ipcRenderer.on("itemWise-sales-data", (event, data) => {
        categoryItemWiseSales = data;
        rendercategoryItemWiseSales(data);
    })
})

const fetchcategoryItemWiseSales = async (datesByInput) => {
    try {
        ipcRenderer.send("category-item-wise-daily-table", datesByInput);
        if (ipcRenderer.on("category-item-wise-daily-table-data", (event, data) => {
            categoryItemWiseSales = data;
            rendercategoryItemWiseSales(data);
        })) {
            rendercategoryItemWiseSales(categoryItemWiseSales);
        }
    }
    catch (error) {
        console.log(error);
    }
}

const rendercategoryItemWiseSales = (data) => {
    const categoryItemWiseSalesTable = $("#category-item-wise-daily-table").DataTable({
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
    categoryItemWiseSalesTable.clear();

    let totalQuantity = 0;
    let totalAmount = 0;

    // Flatten the nested data structure
    const flatData = data.flatMap(category => category.items.map(item => ({
        category: category._id,
        item_name: item.item_name,
        quantity: item.quantity,
        total: item.total.toFixed(2)
    })));

    // Add rows to the table
    flatData.forEach(row => {
        categoryItemWiseSalesTable.row.add([
            row.category,
            row.item_name,
            row.quantity,
            row.total
        ]).draw(false);

        totalQuantity += row.quantity;
        totalAmount += parseFloat(row.total);
    });

    // Add total row
    categoryItemWiseSalesTable.row.add([
        '', // Empty cell for category name
        'Total',
        totalQuantity,
        totalAmount.toFixed(2)
    ]).draw(false);
};
