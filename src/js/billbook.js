
const { default: Swal } = require("sweetalert2");
let apiBillBook = [];

function closeModal() {
  const editBillBookModal = document.getElementById("editBillBookModal");
  editBillBookModal.classList.add("hidden");

  const addNewBillBookModal = document.getElementById("addNewBillBookModal");
  addNewBillBookModal.classList.add("hidden");
}

function openEditModal(billBookId) {
  const Bill = apiBillBook.find(
    (bill) => bill._doc.bill_book === billBookId
  );

  document.getElementById("BillBoook").value = Bill._doc.bill_book;
  document.getElementById("status").value = Bill._doc.is_active;

  const editBillBookModal = document.getElementById("editBillBookModal");
  editBillBookModal.classList.remove("hidden");
  editBillBookModal.classList.add("flex");
  editBillBookModal.dataset.billBookId = billBookId;
}

const editBillBookHandler = async () => {
  const billBookId = document.getElementById('editBillBookModal').dataset.billBookId;

  try {
    const billBookData = {
      bill_book: document.getElementById("BillBoook").value,
      isActive: document.getElementById("status").value,
    }
    ipcRenderer.send("edit-bill-book", billBookId, billBookData);

    const editBillBookModal = document.getElementById("editBillBookModal");
    editBillBookModal.classList.add("hidden");
    editBillBookModal.classList.remove("flex");
    fetchBillBook();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newBillBookHandler = () => {
  try {
    const new_BillBoook = document.getElementById("new_BillBoook").value;
    if (new_BillBoook === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer: 1000
      })
    }
    else {
      const bills = apiBillBook.find(
        (bill) => bill._doc.bill_book === new_BillBoook
      );
      if (bills) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Bill Book already exists!',
          timer: 1000
        })
        return;
      }
      const billBookData = {
        bill_book: document.getElementById("new_BillBoook").value,
        isActive: document.getElementById("new_status").value,
      }
      ipcRenderer.send("new-bill-book", billBookData)

      const addNewBillBookModal = document.getElementById("addNewBillBookModal");
      addNewBillBookModal.classList.add("hidden");
      addNewBillBookModal.classList.remove("flex");
      window.location.reload();  
      fetchBillBook();
    }
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredBook = apiBillBook.filter((bill) =>
    bill._doc.bill_book.toLowerCase().includes(searchText)
  );
  renderBillBooks(filteredBook);
});

const billBookDropdown = document.getElementById("billBookDropdown");
billBookDropdown.addEventListener("change", (event) => {
  const selectedBillBook = event.target.value;
  if (selectedBillBook === "0") {
    renderBillBooks(apiBillBook);
  }
  else {
    const filteredBooks = apiBillBook.filter((bills) => bills._doc.bill_book === Number(selectedBillBook));
    renderBillBooks(filteredBooks);
  }
});

const renderDropdown = (bills_books) => {
  billBookDropdown.innerHTML = "";
  const allBookOption = document.createElement("option");
  allBookOption.textContent = "All bill books";
  allBookOption.value = "0";
  billBookDropdown.appendChild(allBookOption);

  bills_books.forEach((bill) => {
    const option = document.createElement("option");
    option.textContent = bill._doc.bill_book;
    option.value = bill._doc.bill_book;
    billBookDropdown.appendChild(option);
  });
};

const renderBillBooks = (bill_books) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  bill_books.forEach((bill) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
        <td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
          <div class="px-6 py-4">
            <div class="max-md:text-xs">${bill._doc.bill_book}</div>
          </div>
        </td>
        <td class="px-6 py-4">
        <div class="max-md:text-xs ${bill._doc.is_active ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${bill._doc.is_active ? "Active" : "Inactive"}</div></td>
    </td>
        
        <td class="px-6 py-4">
          <button type="button" 
          onClick="openEditModal(${bill._doc.bill_book})"
          data-modal-target="editBillBookModal" data-modal-show="editBillBookModal"
          class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
          Edit </button>
        </td>
      `;

    tbody.appendChild(tr);
  });
};

const fetchBillBook = () => {
  ipcRenderer.send("fetch-bill-book");
}

ipcRenderer.on("bill-book-data", (event, data) => {
  apiBillBook = data;
  renderBillBooks(apiBillBook);
  renderDropdown(apiBillBook);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchBillBook();
  renderBillBooks(apiBillBook);
  renderDropdown(apiBillBook);
});