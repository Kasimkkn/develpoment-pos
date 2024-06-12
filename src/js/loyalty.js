const $ = require("jquery")
let loyaltyCustomer = [];
const fetchloyaltyCustomer = async () => {
    try {
        ipcRenderer.send("fetch-loyalty");
        ipcRenderer.on("loyalty-data", (event, data) => {
            loyaltyCustomer = data;
            renderloyaltyCustomer(loyaltyCustomer);
        });
    } catch (error) {
        console.log(error);
    }
}

const renderloyaltyCustomer = (data) => {
    const loyaltyCustomerTable = $("#loyal-customers-table").DataTable({
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
    loyaltyCustomerTable.clear();

    let totalCustomer = 0;
    let totalPoints = 0;
    let usedPoints = 0;
    let remainingPoints = 0;
    data.forEach((cus) => {
        loyaltyCustomerTable.row
            .add([
                cus._doc.customer_no,
                cus._doc.customer_name,
                cus._doc.total_points,
                cus._doc.used_points ? cus._doc.used_points : 0,
                cus._doc.remaining_points,
            ])
            .draw(false);

        totalCustomer += 1;
        totalPoints += cus._doc.total_points;
        usedPoints += cus._doc.used_points ? cus._doc.used_points : 0;
        remainingPoints += cus._doc.remaining_points;      
    });
    loyaltyCustomerTable
        .row
        .add([
            "Total",
            totalCustomer,
            totalPoints,
            usedPoints,
            remainingPoints
        ])
        .draw(false);

};

fetchloyaltyCustomer();
