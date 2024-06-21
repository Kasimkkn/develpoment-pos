const Swal = require('sweetalert2')
let apiSupplier = [];

function closeModal() {
  const editSupplierModal = document.getElementById("editSupplierModal");
  editSupplierModal.classList.add("hidden");

  const addNewSupplierModal = document.getElementById("addNewSupplierModal");
  addNewSupplierModal.classList.add("hidden");
}

function openEditModal(SupplierId) {
  const Supplier = apiSupplier.find(
    (Supplier) => Supplier._doc.supplier_no === SupplierId
  );

  document.getElementById("supplier_name").value = Supplier._doc.supplier_name;
  document.getElementById("supplier_mobile_no").value = Supplier._doc.mobile_no;
  document.getElementById("Status").value = Supplier._doc.status;

  const editSupplierModal = document.getElementById("editSupplierModal");
  editSupplierModal.classList.remove("hidden");
  editSupplierModal.classList.add("flex");
  editSupplierModal.dataset.SupplierId = SupplierId;
}

const editSupplierHandler = async () => {
  const SupplierId = document.getElementById('editSupplierModal').dataset.SupplierId;

  try {
    const SupplierData = { 
      supplier_name: document.getElementById("supplier_name").value,
      mobile_no: document.getElementById("supplier_mobile_no").value,
      status: document.getElementById("Status").value,
    }
    ipcRenderer.send("edit-supplier", SupplierId, SupplierData);
    closeModal()
    fetchSupplier();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newSupplierHandler = () => {
  try {
    const newSuppliename = document.getElementById("new_supplier_name").value;
    const newSupplierAddress = document.getElementById("new_supplier_address").value;
    const newSupplieMobile = document.getElementById("new_mobile_no").value;
    const newStatus = document.getElementById("new_status").value;
    
    if(newSuppliename == "" || newSupplierAddress == "" || newSupplieMobile == "" || newStatus == ""){
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer:1000,
      })
      return;
    }

    const SupplierData = {
        supplier_name: newSuppliename,
        mobile_no: newSupplieMobile,
        address: newSupplierAddress,
        status: newStatus,
        is_synced: false
    }

    ipcRenderer.send("new-Supplier", SupplierData)

    closeModal();
    fetchSupplier();
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredSuppliers = apiSupplier.filter((Supplier) =>
    Supplier._doc.item_name.toLowerCase().includes(searchText)
  );
  renderSupplier(filteredSuppliers);
});

const renderSupplier = (Supplier) => {

  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  Supplier.forEach((Supplier) => {
    console.log(Supplier);
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Supplier._doc.supplier_no}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Supplier._doc.supplier_name}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${Supplier._doc.mobile_no}</div>
    </td>
    <td class="px-6 py-4">
    <div class="max-md:text-xs ${Supplier._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${Supplier._doc.status ? "Active" : "Inactive"}</div>
    </td>
    <td class="px-6 py-4">
      <button type="button" 
      onClick="openEditModal(${Supplier._doc.supplier_no})"
      data-modal-target="editSupplierModal" data-modal-show="editSupplierModal"
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

const fetchSupplier = () => {
  ipcRenderer.send("fetch-supplier");
}

ipcRenderer.on("supplier-data", (event, Supplier) => {
  apiSupplier = Supplier;
  renderSupplier(apiSupplier);
});

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("fetch-supplier")  
  renderSupplier(apiSupplier);
});
