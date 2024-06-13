const todaySaleInput = document.getElementById("todaysBIlldatepicker");
let datesByInput;
let dailySales = [];


const fetchDailySales = async (datesByInput) => {
    try {
        await ipcRenderer.send("fetch-daily-sales", datesByInput);
        ipcRenderer.on("daily-sales-data", (event, data) => {
            dailySales = data;
            renderDailySales(data);
        })
    }
    catch (error) {
        console.log(error);
    }
}


document.addEventListener("DOMContentLoaded", () => {
    const todayDate = new Date().toISOString().slice(0, 10);

    todaySaleInput.value = todayDate;
    const dateString = todaySaleInput.value;
    const date = new Date(dateString)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    datesByInput = `${year}-${month}-${day}`;

    fetchDailySales(datesByInput);
    ipcRenderer.on("daily-sales-data", (event, data) => {
        dailySales = data;
        renderDailySales(data);
    })
})

todaySaleInput.addEventListener("input", () => {
    const datesByInput = todaySaleInput.value;
    fetchDailySales(datesByInput);
    ipcRenderer.on("daily-sales-data", (event, data) => {
        dailySales = data;
        renderDailySales(data);
    })
})


const renderDailySales =(data) => {
    const dailySalesTable = document.getElementById("daily-bills-table");
    dailySalesTable.innerHTML = "";

    data[0]?.sales.forEach((sale) => {
        const tr = document.createElement("tr");
        tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");
        tr.innerHTML = `
            <td class="px-6 py-4">
                ${sale.bill_no}        
            </td>
            <td class="px-6 py-4">
                    <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale.customer_name ? sale.customer_name : '-'}
            </td>
            <td class="px-6 py-4">
                    <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale.discount_perc}%
            </td>
            <td class="px-6 py-4">
                    <div class="h-2.5 w-2.5 rounded-full me-2"></div> ${sale.final_amount.toFixed(2)}
            </td>
            ${sale.is_locked ? `<td class="px-6 py-4">
            <a href="#" class="font-medium text-common ">Cannot Edit</a>
        </td>` 
            :
             `
             <td class="px-6 py-4">
                <a href="edit-bill.html?billNo=${sale.bill_no}" data-bill-no="${sale.bill_no}" class="font-medium text-common ">Edit</a>
            </td>
             `}
        `;
        dailySalesTable.appendChild(tr);
    });
};
