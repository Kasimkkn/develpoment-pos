
const $ = require("jquery");

let menuItems = [];
const fetchmenuItems = async () => {
    try {
        ipcRenderer.send("fetch-products");
        ipcRenderer.on("products-data", (event, data) => {
            menuItems = data;
            rendermenuItems(menuItems);
        });
    } catch (error) {
        console.log(error);
    }
}

const rendermenuItems = (data) => {
    const menuItemsTable = $("#menu-print-table").DataTable({
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
    menuItemsTable.clear();

    data.forEach((menu) => {
        menuItemsTable.row
            .add([
                menu._doc.item_no,
                menu._doc.item_name,
                menu._doc.rate_one,
                menu._doc.rate_two,
                menu._doc.rate_three,
                menu._doc.rate_four,
                menu._doc.rate_five,
                menu._doc.rate_six,
            ])
            .draw(false);

    });
};

fetchmenuItems();
