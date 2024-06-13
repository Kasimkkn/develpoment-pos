
const Swal = require('sweetalert2')
let apiStock = [];

function closeModal() {
  const editModal = document.getElementById("editStockModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewStockModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(StockId) {
  const Stock = apiStock.find(
    (Stock) => Stock._doc.item_no === StockId
  );

  document.getElementById("item_name").value = Stock._doc.item_name;
  document.getElementById("item_quantity").value = Stock._doc.quantity;
  document.getElementById("item_mrp").value = Stock._doc.mrp;
  document.getElementById("item_min").value = Stock._doc.min_stock;

  const editStockModal = document.getElementById("editStockModal");
  editStockModal.classList.remove("hidden");
  editStockModal.classList.add("flex");
  editStockModal.dataset.StockId = StockId;
}

const editStockHandler = async () => {
  const StockId = document.getElementById('editStockModal').dataset.StockId;

  try {
    const StockData = {
      item_name: document.getElementById("item_name").value,
      quantity: Number(document.getElementById("item_quantity").value),
      mrp: Number(document.getElementById("item_mrp").value),
      total: Number(document.getElementById("item_quantity").value) * Number(document.getElementById("item_mrp").value),
      min_stock: Number(document.getElementById("item_min").value),
    }
    ipcRenderer.send("edit-Stock", StockId, StockData);

    const editStockModal = document.getElementById("editStockModal");
    editStockModal.classList.add("hidden");
    editStockModal.classList.remove("flex");
    fetchStock();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newStockHandler = () => {
  try {
    const newStcockItem = document.getElementById("new_item_name").value;
    const newStockQty = document.getElementById("new_item_quantity").value;
    const newStcockMRP = document.getElementById("new_item_mrp").value;
    const newStcockMin = document.getElementById("new_item_min").value;
    
    if(newStcockItem == "" || newStockQty == "" || newStcockMRP == "" || newStcockMin == ""){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer:1000,
      })
      return;
    }

    const StockData = {
        item_name: newStcockItem,
        quantity: newStockQty,
        mrp: newStcockMRP,
        min_stock: newStcockMin,
        total: newStockQty * newStcockMRP,
        addded_at: Date.now()
    }

    ipcRenderer.send("new-Stock", StockData)

    const addNewStockModal = document.getElementById("addNewStockModal");
    addNewStockModal.classList.add("hidden");
    addNewStockModal.classList.remove("flex");
    location.reload(true);
    fetchStock();
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredStocks = apiStock.filter((Stock) =>
    Stock._doc.item_name.toLowerCase().includes(searchText)
  );
  renderstock(filteredStocks);
});

const renderstock = (stock) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  stock.forEach((Stock) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Stock._doc.item_no}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Stock._doc.item_name}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Stock._doc.quantity}kg</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Stock._doc.mrp}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Stock._doc.total}</div>
    </td>
    <td class="px-6 py-4">
      <button type="button" 
      onClick="openEditModal(${Stock._doc.item_no})"
      data-modal-target="editStockModal" data-modal-show="editStockModal"
          class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 max-md:text-xs">
          <svg fill="var(--common-color)" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
	 viewBox="0 0 348.882 348.882" xml:space="preserve">
<g>
	<path d="M333.988,11.758l-0.42-0.383C325.538,4.04,315.129,0,304.258,0c-12.187,0-23.888,5.159-32.104,14.153L116.803,184.231
		c-1.416,1.55-2.49,3.379-3.154,5.37l-18.267,54.762c-2.112,6.331-1.052,13.333,2.835,18.729c3.918,5.438,10.23,8.685,16.886,8.685
		c0,0,0.001,0,0.001,0c2.879,0,5.693-0.592,8.362-1.76l52.89-23.138c1.923-0.841,3.648-2.076,5.063-3.626L336.771,73.176
		C352.937,55.479,351.69,27.929,333.988,11.758z M130.381,234.247l10.719-32.134l0.904-0.99l20.316,18.556l-0.904,0.99
		L130.381,234.247z M314.621,52.943L182.553,197.53l-20.316-18.556L294.305,34.386c2.583-2.828,6.118-4.386,9.954-4.386
		c3.365,0,6.588,1.252,9.082,3.53l0.419,0.383C319.244,38.922,319.63,47.459,314.621,52.943z"/>
	<path d="M303.85,138.388c-8.284,0-15,6.716-15,15v127.347c0,21.034-17.113,38.147-38.147,38.147H68.904
		c-21.035,0-38.147-17.113-38.147-38.147V100.413c0-21.034,17.113-38.147,38.147-38.147h131.587c8.284,0,15-6.716,15-15
		s-6.716-15-15-15H68.904c-37.577,0-68.147,30.571-68.147,68.147v180.321c0,37.576,30.571,68.147,68.147,68.147h181.798
		c37.576,0,68.147-30.571,68.147-68.147V153.388C318.85,145.104,312.134,138.388,303.85,138.388z"/>
</g>
</svg>
      </button>
    </td>
  `;

    tbody.appendChild(tr);
  });
};

const fetchStock = () => {
  ipcRenderer.send("fetch-Stock");
}

ipcRenderer.on("fetch-Stock-data", (event, stock) => {
  apiStock = stock;
  renderstock(apiStock);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchStock();
  renderstock(apiStock);
});
