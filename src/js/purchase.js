const Swal = require('sweetalert2');

let apiStock = [];
let apiPurchase = [];

// Function to close modals
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  modal.classList.add("hidden");
}

// Function to open edit modal
function openEditModal(stockId) {
  const stock = apiStock.find(stock => stock._doc.item_no === stockId);

  if (stock) {
    document.getElementById("item_name").value = stock._doc.item_name;
    document.getElementById("item_quantity").value = stock._doc.quantity;
    document.getElementById("item_mrp").value = stock._doc.mrp;
    document.getElementById("item_min").value = stock._doc.min_stock;

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

    closeModal("editStockModal");
    fetchPurchase();
    window.location.reload();
  } catch (error) {
    console.error('Error editing item:', error);
  }
};

// Function to render dropdown for stock
const renderStockDropdown = (stockList) => {
  const newItemDropdown = document.getElementById("new_item_name");
  newItemDropdown.innerHTML = "";

  stockList.forEach((stock) => {
    const option = document.createElement("option");
    option.value = `${stock._doc.item_no} ${stock._doc.item_name}`;
    option.textContent = stock._doc.item_name;
    newItemDropdown.appendChild(option);
  });
};

// Function to handle new purchase
const newPurchaseHandler = () => {
  try {
    const newItem = document.getElementById("new_item_name").value;
    const newItemNo = newItem.split(" ")[0];
    const newItemName = newItem.split(" ").slice(1).join(" ");
    const newStockQty = document.getElementById("new_item_quantity").value;
    const newStockMRP = document.getElementById("new_item_mrp").value;
    
    if (newItem === "" || newStockQty === "" || newStockMRP === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer: 1000,
      });
      return;
    }

    const purchaseData = {
      item_no: newItemNo,
      item_name: newItemName,
      quantity: newStockQty,
      mrp: newStockMRP,
      total: newStockQty * newStockMRP,
    };

    ipcRenderer.send("new-Purchase", purchaseData);
    closeModal("addNewPurchaseModal");
    fetchPurchase();
    window.location.reload();
  } catch (error) {
    console.error("Error inserting", error);
  }
};

// Function to render purchase table
const renderPurchase = (purchaseList) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  purchaseList.forEach((purchase) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");
    tr.innerHTML = `
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase._doc.purchase_no}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${new Date(purchase._doc.date).toLocaleDateString('en-GB')}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase._doc.item_details.item_name}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase._doc.item_details.quantity}kg</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase._doc.item_details.mrp}</div>
      </td>
      <td class="px-6 py-4">
        <div class="max-md:text-xs">${purchase._doc.item_details.total}</div>
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
  fetchPurchase();
});

// IPC event listeners
ipcRenderer.on("fetch-Stock-data", (event, stock) => {
  apiStock = stock;
  renderStockDropdown(apiStock);
});

ipcRenderer.on("fetch-purchase-data", (event, purchase) => {
 
  apiPurchase = purchase;
  renderPurchase(apiPurchase);
});
