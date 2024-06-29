
const { default: Swal } = require("sweetalert2");
let apitable = [];

function closeModal() {
  const editModal = document.getElementById("editTableModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewtableModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(serialNo) {
  const table = apitable.find(
    (table) => table._doc.serial_no === serialNo
  );

  document.getElementById("table_no").value = table._doc.table_no;
  document.getElementById("location").value = table._doc.location_no;
  document.getElementById("status").value = table._doc.status;

  const editTableModal = document.getElementById("editTableModal");
  editTableModal.classList.remove("hidden");
  editTableModal.classList.add("flex");
  editTableModal.dataset.serialNo = serialNo;
}

const edittableHandler = async () => {
  const serialNo = document.getElementById('editTableModal').dataset.serialNo;

  try {
    const tableData = {
      tableNo: document.getElementById("table_no").value,
      locationNo: document.getElementById("location").value,
      isActive: document.getElementById("status").value,
    }
    ipcRenderer.send("edit-table", serialNo, tableData);

    const editTableModal = document.getElementById("editTableModal");
    editTableModal.classList.add("hidden");
    editTableModal.classList.remove("flex");
    fetchtable();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newtableHandler = () => {
  try {
    const newTableNoInput = document.getElementById("new_table_no").value;
    const newLocationNoInput = document.getElementById("new_location").value;
    const isActiveInput = document.getElementById("new_status").value;

    if (newLocationNoInput === "" || newTableNoInput === "" || isActiveInput === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer: 1000
      })
    }
    else {
      // check that table no is unique and not in apitable
      const table = apitable.find(
        (table) => table._doc.table_no === newTableNoInput
      );
      if (table) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No duplicate table!',
          timer: 1000
        })
        return;
      }
      const tableData = {
        newTableNo: document.getElementById("new_table_no").value,
        newLocationNo: document.getElementById("new_location").value,
        isActive: document.getElementById("new_status").value,
      }

      ipcRenderer.send("new-table", tableData)
      const addNewtableModal = document.getElementById("addNewtableModal");
      addNewtableModal.classList.add("hidden");
      addNewtableModal.classList.remove("flex");
      location.reload();
      fetchtable();
    }
  } catch (error) {
    ipcRenderer.on("new-table-error", (event, error) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error,
        timer: 1000
      })
    })
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filterTables = apitable.filter((table) => {
    const table_no = table._doc.table_no;
    return String(table_no).toLowerCase().includes(searchText);
  }
  );
  rendertable(filterTables);
});

const tableDropdown = document.getElementById("tableDropdown");

tableDropdown.addEventListener("change", (event) => {
  const selectedtable = event.target.value;
  if (selectedtable === "0") {
    rendertable(apitable);
  }
  else {
    const filterTables = apitable.filter((table) => table._doc.location_no === Number(selectedtable));
    rendertable(filterTables);
  }
});

const renderDropdown = (tables) => {
  tableDropdown.innerHTML = "";
  const alltablesOption = document.createElement("option");
  alltablesOption.textContent = "Locations";
  alltablesOption.value = "0";
  tableDropdown.appendChild(alltablesOption);

  tables.forEach((table) => {
    if(!table._doc.status) return;
    const option = document.createElement("option");
    option.textContent = table._doc.location_name;
    option.value = table._doc.location_no;
    tableDropdown.appendChild(option);
  });
};

const renderFormLocation = (locations) => {
  const locationDropdown = document.getElementById("new_location");
  const locationDropdown2 = document.getElementById("location");
  locationDropdown.innerHTML = "";
  locationDropdown2.innerHTML = "";

  const allLocationsOption = document.createElement("option");
  allLocationsOption.textContent = "Select Location";
  allLocationsOption.value = "0";
  locationDropdown.appendChild(allLocationsOption.cloneNode(true));
  locationDropdown2.appendChild(allLocationsOption.cloneNode(true));

  locations.forEach((location) => {
    if(!location._doc.status) return;
    const option1 = document.createElement("option");
    option1.textContent = location._doc.location_name;
    option1.value = location._doc.location_no;
    locationDropdown.appendChild(option1);

    const option2 = document.createElement("option");
    option2.textContent = location._doc.location_name;
    option2.value = location._doc.location_no;
    locationDropdown2.appendChild(option2);
  });
};


const rendertable = (tables) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  tables.forEach((table) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
        <td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
          <div class="px-6 py-4">
            <div class="max-md:text-xs">${table._doc.serial_no}</div>
          </div>
        </td>
        <td class="px-6 py-4 text-black">Table No:${table._doc.table_no}</td>
        
        <td class="px-6 py-4">
        <div class="max-md:text-xs ${table._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${table._doc.status ? "Active" : "Inactive"}</div></td>
        <td class="px-6 py-4">
          <button type="button" 
          onClick="openEditModal('${table._doc.serial_no}')"
          data-modal-target="editTableModal" data-modal-show="editTableModal"
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

const fetchtable = () => {
  ipcRenderer.send("fetch-location")
  ipcRenderer.send("fetch-table");
}

ipcRenderer.on("location-data", (event, data) => {
  renderDropdown(data)
  renderFormLocation(data)
})

ipcRenderer.on("table-data", (event, tables) => {
  apitable = tables;
  rendertable(apitable);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchtable();
});