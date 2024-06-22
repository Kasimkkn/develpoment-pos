const $ = require("jquery");

const fromlocationWiseDate = document.getElementById("fromlocationWiseDate");
const tolocationWiseDate = document.getElementById("tolocationWiseDate");
const generateReportBtn = document.getElementById("generatelocationWiseButton");
const selectlocationWise = document.getElementById("selectlocationWise");

let locationName = "Common-Hall";

document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    tolocationWiseDate.value = todayDate;
    fromlocationWiseDate.value = todayDate;
    fetchlocationWise(todayDate, todayDate);
});

generateReportBtn.addEventListener("click", () => {
    const fromDate = fromlocationWiseDate.value;
    const toDate = tolocationWiseDate.value;
    fetchlocationWise(fromDate, toDate);
})

const fetchlocationWise = async (fromDate, toDate) => {
    try {
        ipcRenderer.send("fetch-locationWise-sales", fromDate, toDate, locationName);
        ipcRenderer.once("locationWise-sales-data", (event, data) => {
            renderlocationWise(data);
        });
    } catch (error) {
        console.error("Error fetching locationWise sales:", error);
    }
};

ipcRenderer.send("fetch-location");
ipcRenderer.on("location-data", (event, data) => {
    selectlocationWise.innerHTML = ''
    data.forEach((location) => {
        const option = document.createElement("option");
        option.textContent = location._doc.location_name;
        option.value = location._doc.location_name;

        selectlocationWise.appendChild(option);
        selectlocationWise.addEventListener("change", (e) => {
            locationName = e.target.value
        })
    })
})


const renderlocationWise = (data) => {
    console.log(data)
    if(data.length > 0) {
    const initialColumns = [
        { title: "Bills" },
        { title: "Table No" },
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

    // Initialize DataTable with all columns
    const locationWiseTable = $("#location-wise-table").DataTable({
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
        columns: initialColumns // Set all columns during initialization
    });

    // Clear existing table data
    locationWiseTable.clear();

    let totalAmount = 0;
    let totalFinalAmount = 0;
    let totalDiscountPerc = 0;
    let totalDiscount = 0;
    let totalTax = 0;

            // Populate rows in DataTable
    data.forEach((sale) => {
        totalAmount += sale.totalAmount;
        totalFinalAmount += sale.totalFinalAmount;
        totalDiscountPerc += sale.totalDiscountPerc || 0;
        totalDiscount += sale.totalDiscount || 0;
        totalTax += sale.totalTax || 0;

        const rowData = [
            sale._id.bill_no,
            sale.table_no[0],
            sale.totalAmount.toFixed(2),
            sale.totalDiscountPerc ? sale.totalDiscountPerc.toFixed(2) : '0.00',
            sale.totalDiscount ? sale.totalDiscount.toFixed(2) : '0.00',
            sale.totalTax ? sale.totalTax.toFixed(2) : '0.00',
            sale.totalFinalAmount.toFixed(2)
        ];

        Object.keys(payModes).forEach(paymode => {
            rowData.push(sale[paymode.toLowerCase()] ? sale[paymode.toLowerCase()].toFixed(2) : '0.00');
        });

        locationWiseTable.row.add(rowData);
    });
    // Add overall totals row
    locationWiseTable.row.add([
        '',
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

    // Draw DataTable
    locationWiseTable.draw();
    }
    else{
    const locationWiseTable = $("#location-wise-table").DataTable({
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


