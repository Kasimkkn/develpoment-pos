
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
          class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
          Edit Location</button>
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