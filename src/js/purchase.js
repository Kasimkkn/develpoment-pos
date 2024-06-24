const Swal = require('sweetalert2');

let apiStock = [];
let apiPurchase = [];
let apiSupplier = [];
function closeModal() {
  const editSupplierModal = document.getElementById("editStockModal");
  editSupplierModal.classList.add("hidden");
  const addNewPurchaseModal = document.getElementById("addNewPurchaseModal");
  addNewPurchaseModal.classList.add("hidden");
  addNewPurchaseModal.classList.remove("flex");
}

function openEditModal(stockId) {
  const stock = apiStock.find(stock => stock.item_no === stockId);

  if (stock) {
    document.getElementById("item_name").value = stock.item_name;
    document.getElementById("item_quantity").value = stock.quantity;
    document.getElementById("item_mrp").value = stock.mrp;
    document.getElementById("item_min").value = stock.min_stock;

    const editStockModal = document.getElementById("editStockModal");
    editStockModal.classList.remove("hidden");
    editStockModal.classList.add("flex");
    editStockModal.dataset.StockId = stockId;
  } else {
    console.error("Stock not found");
  }
}
const editPurchaseHandler = async () => {
  const stockId = document.getElementById('editStockModal').dataset.StockId;

  try {
    const purchaseData = {
      item_name: document.getElementById("item_name").value,
      quantity: Number(document.getElementById("item_quantity").value),
      mrp: Number(document.getElementById("item_mrp").value),
      total: Number(document.getElementById("item_quantity").value) * Number(document.getElementById("item_mrp").value),
      min_stock: Number(document.getElementById("item_min").value),
    };
    ipcRenderer.send("edit-Stock", stockId, purchaseData);
    closeModal();
    location.reload(true);
    fetchPurchase();
  } catch (error) {
    console.error('Error editing item:', error);
  }
};

// Function to render dropdown for stock
const renderStockDropdown = (stockList , supplierList) => {
  const newItemDropdown = document.getElementById("item_name_list");
  const supplierDropdwon = document.getElementById("supplier_name_list");

  newItemDropdown.innerHTML = "";
  stockList.forEach((stock) => {
    const option = document.createElement("option");
    option.textContent = stock.item_name;
    newItemDropdown.appendChild(option);
  });

  supplierDropdwon.innerHTML = "";
  supplierList.forEach((supplier) => {
    const option = document.createElement("option");
    option.textContent = supplier.supplier_name;
    supplierDropdwon.appendChild(option);
  });
};




// Function to handle new purchase
const newPurchaseHandler = () => {
  try {
    const newItem = document.getElementById("new_item_name").value;
    const newStockQty = document.getElementById("new_item_quantity").value;
    const newStockMRP = document.getElementById("new_item_mrp").value;
    const supplier_name = document.getElementById("supplier_name").value;
    
    if (newItem === "" || newStockQty === "" || newStockMRP === "" || supplier_name === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer: 1000,
      });
      return;
    }

    const purchaseData = {
      item_name: newItem,
      quantity: newStockQty,
      mrp: newStockMRP,
      supplier_name: supplier_name,
      total: newStockQty * newStockMRP,
    };

    ipcRenderer.send("new-Purchase", purchaseData);
    closeModal();
    location.reload(true);
    fetchPurchase();
  } catch (error) {
    console.error("Error inserting", error);
  }
};

// Function to render purchase table
const renderPurchase = (purchaseList) => {
  console.log(purchaseList)
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  purchaseList.forEach((purchase) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");
    tr.innerHTML = `
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase.purchase_no}</div>
      </td>
            <td class="px-6 py-4">
        <div class="max-md:text-xs">${new Date(purchase.date).toLocaleDateString('en-GB')}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase.supplier_name}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase.item_details[0].item_name}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase.item_details[0].total}</div>
      </td>
    `;

    tbody.appendChild(tr);
  });
};

// Event listener for search input
const searchInput = document.getElementById("table_search_item");
searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredPurchase = apiPurchase.filter((purchase) =>
    purchase.item_details.item_name.toLowerCase().includes(searchText)
  );
  renderPurchase(filteredPurchase);
});
const fetchPurchase = () => {
  ipcRenderer.send("fetch-purchase");
};

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("fetch-Stock");
  ipcRenderer.send("fetch-supplier");
  ipcRenderer.send("fetch-purchase");
  fetchPurchase();
});

// IPC event listeners
ipcRenderer.on("fetch-Stock-data", (event, stock) => {
  apiStock = stock;
});

ipcRenderer.on("supplier-data", (event, supplier) => {
  apiSupplier = supplier;
  renderStockDropdown(apiStock, apiSupplier);
});

ipcRenderer.on("fetch-purchase-data", (event, purchase) => {
  apiPurchase = JSON.parse(purchase);
  renderPurchase(apiPurchase);
});
