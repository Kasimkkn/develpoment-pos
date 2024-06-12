
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
    console.log("Error inserting", error);
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
          class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
          Edit table</button>
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