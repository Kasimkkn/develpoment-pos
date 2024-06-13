const { default: Swal } = require("sweetalert2");
let apiTable = [];
let apiLocation = [];
let activeTables = [];

ipcRenderer.on('focus-input', () => {
  document.getElementById('searchInput').focus();
});
ipcRenderer.on("print-bill" , () => {
  const printBillBtn = document.getElementById('print-bill-btn');
      if (printBillBtn) {
        printBillBtn.click();
      }
})
ipcRenderer.on("print-kot" , () => {
  const printKotBtn = document.getElementById('print-KOt-btn');
      if (printKotBtn) {
        printKotBtn.click();
      }
})
ipcRenderer.on("open-customer-modal" , () => {
  const customerInfoBtn = document.getElementById('get-customer-info-btn');
      if (customerInfoBtn) {
        customerInfoBtn.click();
      }
})


ipcRenderer.on("location-and-tables-data", (event, locationData, tableData) => {
  apiLocation = locationData;
  apiTable = tableData;
  renderLocationBlocks();
});

ipcRenderer.send("fetch-existing-cartItems");

ipcRenderer.on("existing-cartItems-data", (event, data) => {
  activeTables = data;
  renderLocationBlocks();
});

const firstTableDropdown = document.getElementById("firstTable");
const secondTableDropdown = document.getElementById("secondTable");
const mergeTableButton = document.getElementById("mergeTableButton");

mergeTableButton.addEventListener("click", () => {
  const firstTableComplete = firstTableDropdown.value;
  const secondTableComplete = secondTableDropdown.value;

  const firstTableLocation = firstTableComplete.split(" ")[0];
  const firstTableNO = firstTableComplete.split(" ")[1];
  const secondTableLocation = secondTableComplete.split(" ")[0];
  const secondTableNO = secondTableComplete.split(" ")[1];

  if (firstTableNO === "0" || secondTableNO === "0") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please select both tables",
      timer: 800,
    });
  } else {
    const firstTableData = activeTables.filter(
      (table) =>
        table._doc.table_no === firstTableNO &&
        table._doc.location_name === firstTableLocation
    );

    const secondTableData = activeTables.filter(
      (table) =>
        table._doc.table_no === secondTableNO &&
        table._doc.location_name === secondTableLocation
    );

    const mergedDataIntoFirstTable = mergeTablesData(
      firstTableData,
      secondTableData
    );

    ipcRenderer.send("merge-tables", mergedDataIntoFirstTable, secondTableData);
    ipcRenderer.on("merge-tables-success", (event, data) => {
      activeTables = data;
      location.reload();
      renderLocationBlocks();
    });


  }
});

function mergeTablesData(firstTableData, secondTableData) {
  const mergedData = [];

  firstTableData.forEach((firstItem) => {
    const existingItem = mergedData.find(
      (item) => item.item_name === firstItem._doc.item_name
    );

    if (existingItem) {
      existingItem.quantity += firstItem._doc.quantity;
    } else {
      mergedData.push({
        table_no: firstItem._doc.table_no,
        location_name: firstItem._doc.location_name,
        item_no: firstItem._doc.item_no,
        item_name: firstItem._doc.item_name,
        item_image: firstItem._doc.item_image,
        quantity: firstItem._doc.quantity,
        price: firstItem._doc.price,
        is_printed:firstItem._doc.is_printed
      });
    }
  });
  secondTableData.forEach((secondItem) => {
    const existingItem = mergedData.find(
      (item) => item.item_name === secondItem._doc.item_name
    );

    if (existingItem) {
      existingItem.quantity += secondItem._doc.quantity;
    } else {
      mergedData.push({
        item_no: secondItem._doc.item_no,
        item_name: secondItem._doc.item_name,
        item_image: secondItem._doc.item_image,
        quantity: secondItem._doc.quantity,
        price: secondItem._doc.price,
        is_printed: secondItem._doc.is_printed
      });
    }
  });

  return mergedData;
}

const activeTableDropdwon = document.getElementById("activeTable");
const toTransferTableDropdown = document.getElementById("toTransferTable");
const transferTableButton = document.getElementById("transferTableButton");

transferTableButton.addEventListener("click", (event) => {
  event.preventDefault();
  const activeTableComplete = activeTableDropdwon.value;
  const toTransferTableComplete = toTransferTableDropdown.value;

  const activeTableLocation = activeTableComplete.split(" ")[0];
  const activeTableNO = activeTableComplete.split(" ")[1];
  const toTransferTableLocation = toTransferTableComplete.split(" ")[0];
  const toTransferTableNO = toTransferTableComplete.split(" ")[1];

  if (activeTableNO === "0" || toTransferTableNO === "0") {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Please select both tables",
      timer: 800,
    });
  }
  else {
    if (toTransferTableLocation === activeTableLocation) {
      const toTransferTableData = {
        toTransferTableNo: toTransferTableNO,
        toTransferTableLocation: toTransferTableLocation,
        activeTableNo: activeTableNO,
        activeTableLocation: activeTableLocation
      }
      ipcRenderer.send("transfer-table", toTransferTableData);
      ipcRenderer.on("transfer-table-success", (event, data) => {
        activeTables = data;
        location.reload();
        renderLocationBlocks();
      })
    }
    else {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please select same location",
        timer: 800,
      });
    }
  }
})

const renderLocationBlocks = () => {

  const locationTablesContainer = document.getElementById("locationTables");
  locationTablesContainer.innerHTML = "";

  apiLocation.forEach((location) => {
    if(!location._doc.status) return;
    const locationSection = document.createElement("section");
    locationSection.classList.add(  "mt-4",)
    const locationTitle = document.createElement("h5");
    locationTitle.classList.add("font-medium", "text-black");
    locationTitle.style.fontSize = "15px";
    locationTitle.style.fontWeight = "700";
    locationTitle.textContent = location._doc.location_name.toUpperCase();
    locationSection.appendChild(locationTitle);

    const locationTables = document.createElement("div");
    locationTables.classList.add("mt-4", "flex", "flex-wrap", "gap-2");

    apiTable.forEach((table) => {
      if(!table._doc.status) return;
      if (table._doc.location_no === location._doc.location_no) {
        const isActive = activeTables.some(
          (item) =>
            item._doc.table_no === table._doc.table_no &&
            item._doc.location_name === location._doc.location_name
        );

        const tableLink = document.createElement("a");
        tableLink.href = `index.html?id=${table._doc.table_no}&location=${location._doc.location_name}`;
        tableLink.classList.add("flex", "justify-center", "items-center", "h-14", "w-16", "p-4",
          "bg-white", "rounded-lg", "shadow", "hover:shadow-2xl", "hover:border-slate-300", "hover:cursor-pointer");

          if (isActive) {
            tableLink.classList.add("beautyBtn");
            tableLink.classList.add("text-white");
            tableLink.classList.add("bg-common");
            const option = document.createElement("option");
            option.value = `${location._doc.location_name} ${table._doc.table_no}`;
            option.textContent = `${location._doc.location_name} ${table._doc.table_no}`;
            firstTableDropdown.appendChild(option.cloneNode(true));
            secondTableDropdown.appendChild(option.cloneNode(true));
            activeTableDropdwon.appendChild(option.cloneNode(true));

            activeTableDropdwon.addEventListener("change", function() {
              const selectedLocation = this.value.split(' ')[0];
              Array.from(toTransferTableDropdown.options).forEach(option => {
                const locationName = option.value.split(' ')[0];
                if (locationName === selectedLocation || option.value === "") {
                  option.style.display = "block";
                } else {
                  option.style.display = "none";
                }
                if (option.value === this.value) {
                  option.style.display = "none";
                }
              });
            });
          }
          if (!isActive) {
            const allTablesOption = document.createElement("option");
            allTablesOption.value = `${location._doc.location_name} ${table._doc.table_no}`;
            allTablesOption.textContent = `${location._doc.location_name} ${table._doc.table_no}`;
            toTransferTableDropdown.appendChild(allTablesOption.cloneNode(true));
          }
          

        const tableSpan = document.createElement("span");
        tableSpan.classList.add("text-lg", "font-medium");
        tableSpan.textContent = table._doc.table_no;
        tableLink.appendChild(tableSpan);
        locationTables.appendChild(tableLink);
      }
    });

    locationSection.appendChild(locationTables);
    locationTablesContainer.appendChild(locationSection);
  });
  firstTableDropdown.addEventListener("change", function() {
    const selectedLocation = this.value.split(' ')[0];
    Array.from(secondTableDropdown.options).forEach(option => {
      const locationName = option.value.split(' ')[0];
      if (locationName === selectedLocation || option.value === ""  ) {
        option.style.display = "block";
      } else {
        option.style.display = "none";
      }
      if (option.value === this.value) {
        option.style.display = "none";
      }
    });
  });
};

const fetchLocationAndTables = () => {
  ipcRenderer.send("fetch-location-and-tables");
};
document.addEventListener("DOMContentLoaded", () => {
  fetchLocationAndTables();
});
