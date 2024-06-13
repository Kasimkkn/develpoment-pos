
const { default: Swal } = require("sweetalert2");
let apiLocation = [];

function closeModal() {
  const editModal = document.getElementById("editLocationModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewLocationModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(locationId) {
  const location = apiLocation.find(
    (location) => location._doc.location_no === locationId
  );

  document.getElementById("location_name").value = location._doc.location_name;
  document.getElementById("status").value = location._doc.status;
  document.getElementById("taxable").value = location._doc.is_taxable;
  document.getElementById("location_price").value =location._doc.location_price;


  const editLocationModal = document.getElementById("editLocationModal");
  editLocationModal.classList.remove("hidden");
  editLocationModal.classList.add("flex");
  editLocationModal.dataset.locationId = locationId;
}

const editLocationHandler = async () => {
  const locationId = document.getElementById('editLocationModal').dataset.locationId;

  try {
    const locationData = {
      locationName: document.getElementById("location_name").value,
      rate: document.getElementById("location_price").value,
      isTaxable: document.getElementById("taxable").value,
      isActive: document.getElementById("status").value,
    }
    ipcRenderer.send("edit-location", locationId, locationData);

    const editLocationModal = document.getElementById("editLocationModal");
    editLocationModal.classList.add("hidden");
    editLocationModal.classList.remove("flex");
    fetchLocation();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newLocationHandler = () => {
  try {
    const locationNameInput = document.getElementById("new_location_name").value;
    if (locationNameInput === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer: 1000
      })
    }
    else {
      const location = apiLocation.find(
        (location) => location._doc.location_name === locationNameInput
      );
      if (location) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Location name already exists!',
          timer: 1000
        })
        return;
      }
      const locationData = {
        locationName: document.getElementById("new_location_name").value,
        rate: document.getElementById("new_location_price").value,
        taxable: document.getElementById("new_taxable").value,
        isActive: document.getElementById("new_status").value,
      }
      ipcRenderer.send("new-location", locationData)

      const addNewLocationModal = document.getElementById("addNewLocationModal");
      addNewLocationModal.classList.add("hidden");
      addNewLocationModal.classList.remove("flex");
      window.location.reload(true);
      fetchLocation();
    }
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiLocation.filter((location) =>
    location._doc.location_name.toLowerCase().includes(searchText)
  );
  renderLocation(filteredProducts);
});

const locationDropdown = document.getElementById("locationDropdown");
locationDropdown.addEventListener("change", (event) => {
  const selectedLocation = event.target.value;
  if (selectedLocation === "0") {
    renderLocation(apiLocation);
  }
  else {
    const filteredProducts = apiLocation.filter((location) => location._doc.location_no === Number(selectedLocation));
    renderLocation(filteredProducts);
  }
});

const renderDropdown = (locations) => {
  locationDropdown.innerHTML = "";
  const allLocationsOption = document.createElement("option");
  allLocationsOption.textContent = "All Locations";
  allLocationsOption.value = "0";
  locationDropdown.appendChild(allLocationsOption);

  locations.forEach((location) => {
    const option = document.createElement("option");
    option.textContent = location._doc.location_name;
    option.value = location._doc.location_no;
    locationDropdown.appendChild(option);
  });
};

const renderLocation = (locations) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  locations.forEach((location) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
        <td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
          <div class="px-6 py-4">
            <div class="max-md:text-xs">${location._doc.location_no}</div>
          </div>
        </td>
        <td class="px-6 py-4">${location._doc.location_name}</td>
        <td class="px-6 py-4">${location._doc.location_price.toUpperCase()}</td>
        <td class="px-6 py-4">
        <div class="max-md:text-xs ${location._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${location._doc.status ? "Active" : "Inactive"}</div></td>
    </td>
        <td class="px-6 py-4">
        <div class="max-md:text-xs ${location._doc.is_taxable ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${location._doc.is_taxable ? "Active" : "Inactive"}</div></td>
    </td>
        <td class="px-6 py-4">
          <button type="button" 
          onClick="openEditModal(${location._doc.location_no})"
          data-modal-target="editLocationModal" data-modal-show="editLocationModal"
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

const fetchLocation = () => {
  ipcRenderer.send("fetch-location");
}

ipcRenderer.on("location-data", (event, categories) => {
  apiLocation = categories;
  renderLocation(apiLocation);
  renderDropdown(apiLocation);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchLocation();
  renderLocation(apiLocation);
  renderDropdown(apiLocation);
});