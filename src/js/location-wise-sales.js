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
        ipcRenderer.send("fetch-locationWise-sales",  fromDate, toDate , locationName );
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
        selectlocationWise.addEventListener("change" , (e)=>{
            locationName = e.target.value
        })
    })
})

const renderlocationWise = (data) => {
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
        ordering: false
    });

    locationWiseTable.clear();

    let totalAmount = 0;
    let totalFinalAmount = 0;
    let totalDiscountPerc = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let cashPayment = 0;
    let cardPayment = 0;
    let upiPayment = 0;
    let otherPayment = 0;

    data.forEach((sale) => {
        locationWiseTable.row
        .add([
            sale._id.bill_no,
            sale.table_no[0], 
            sale.totalAmount.toFixed(2),
            sale.totalDiscountPerc ? sale.totalDiscountPerc.toFixed(2) : '0.00',
            sale.totalDiscount ? sale.totalDiscount.toFixed(2) : '0.00',
            sale.totalTax ? sale.totalTax.toFixed(2) : '0.00',
            sale.totalFinalAmount.toFixed(2),
            sale.totalCash ? Number(sale.totalCash).toFixed(2) : '0.00',
            sale.totalCard ? Number(sale.totalCard).toFixed(2) : '0.00',
            sale.totalUpi ? Number(sale.totalUpi).toFixed(2) : '0.00',
            sale.totalOther ? Number(sale.totalOther).toFixed(2) : '0.00',
        ])
        .draw(false);

        totalAmount += parseFloat(sale.totalAmount);
        totalFinalAmount += parseFloat(sale.totalFinalAmount);
        totalDiscountPerc += parseFloat(sale.totalDiscountPerc);
        totalDiscount += parseFloat(sale.totalDiscount);
        totalTax += parseFloat(sale.totalTax);
        cashPayment += parseFloat(sale.totalCash || 0);
        cardPayment += parseFloat(sale.totalCard || 0);
        upiPayment += parseFloat(sale.totalUpi || 0);
        otherPayment += parseFloat(sale.totalOther || 0);
    });

    // Add total row
    locationWiseTable.row
    .add([
        ' ',
        'Total',
        totalAmount.toFixed(2),
        totalDiscountPerc.toFixed(2),
        totalDiscount.toFixed(2),
        totalTax.toFixed(2),
        totalFinalAmount.toFixed(2),
        cashPayment.toFixed(2),
        cardPayment.toFixed(2),
        upiPayment.toFixed(2),
        otherPayment.toFixed(2),
    ])
    .draw(false);
};
