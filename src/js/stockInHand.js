
const $ = require("jquery");

let StockItems = [];
const fetchStockItems = async () => {
    try {
        ipcRenderer.send("fetch-Stock");
        ipcRenderer.on("fetch-Stock-data", (event, data) => {
            StockItems = data;
            renderStockItems(StockItems);
        });
    } catch (error) {
        console.log(error);
    }
}

const renderStockItems = (data) => {
    const StockItemsTable = $("#stock-in-hand-table").DataTable({
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
    StockItemsTable.clear();
    let totalAmount = 0;
    data.forEach((menu) => {
        StockItemsTable.row
            .add([
                menu._doc.item_no,
                menu._doc.item_name,
                menu._doc.quantity,
                menu._doc.mrp,
                menu._doc.total,
                menu._doc.addded_at ? new Date(menu._doc.addded_at).toLocaleDateString('en-GB') : '',
            ])
            .draw(false);
      totalAmount += menu._doc.total;      
    });
    StockItemsTable.row.add(
        [
            '',
            '',
            '',
            'Total',
            totalAmount.toFixed(2),
            '',
        ]
    ).draw(false);
};

fetchStockItems();
