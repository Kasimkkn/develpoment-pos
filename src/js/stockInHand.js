
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
                menu._doc.quantity < menu._doc.min_stock ? `
                        <td class="px-6 py-4">
        <div class="bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded">${menu._doc.min_stock}</div>
    </td>
                ` : `${menu._doc.min_stock}`,
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
            '',
            'Total',
            totalAmount.toFixed(2),
            '',
        ]
    ).draw(false);
};

fetchStockItems();
