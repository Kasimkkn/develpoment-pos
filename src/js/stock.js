
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
      class="inline-flex items-center justify-between rounded-md text-sm hover:bg-ssecondary h-10 px-4 py-2 w-max mb-2 beautyBtn text-white max-md:text-xs md:max-md:h-4">
      Edit Stock</button>
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
