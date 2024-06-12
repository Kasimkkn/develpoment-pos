
const { default: Swal } = require("sweetalert2");
let apiExpense = [];

function closeModal() {
  const editModal = document.getElementById("editExpenseModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewExpenseModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(expenseId) {
  const expense = apiExpense.find(
    (expense) => expense._doc.expense_no === expenseId
  );

  document.getElementById("expense_name").value = expense._doc.expense_name;

  const editExpenseModal = document.getElementById("editExpenseModal");
  editExpenseModal.classList.remove("hidden");
  editExpenseModal.classList.add("flex");
  editExpenseModal.dataset.expenseId = expenseId;
}

const editExpenseHandler = async () => {
  const expenseId = document.getElementById('editExpenseModal').dataset.expenseId;

  try {
    const expenseData = {
      expenseName: document.getElementById("expense_name").value,
    }
    ipcRenderer.send("edit-expense", expenseId, expenseData);

    const editExpenseModal = document.getElementById("editExpenseModal");
    editExpenseModal.classList.add("hidden");
    editExpenseModal.classList.remove("flex");
    fetchExpense();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newExpenseHandler = () => {
  try {

    const expenseNameInput = document.getElementById("new_expense_name").value;
    if(expenseNameInput === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Expense name is required!',
        timer: 1000
      })
    }
    else{
      const expenseData = {
        expenseName: expenseNameInput,
      }
      ipcRenderer.send("new-expense", expenseData)
      
      const addNewExpenseModal = document.getElementById("addNewExpenseModal");
      addNewExpenseModal.classList.add("hidden");
      addNewExpenseModal.classList.remove("flex");
      location.reload(true);
      fetchProduct();
    }
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredExpense = apiExpense.filter((expense) =>
    expense._doc.expense_name.toLowerCase().includes(searchText)
  );
  renderExpense(filteredExpense);
});

const expenseDropdown = document.getElementById("expenseDropdown");
expenseDropdown.addEventListener("change", (event) => {
  const selectedexpense = event.target.value;
  if (selectedexpense === "0") {
    renderExpense(apiExpense);
  }
  else {
    const filteredExpense = apiExpense.filter((expense) => expense._doc.expense_no === Number(selectedexpense));
    renderExpense(filteredExpense);
  }
});

const renderDropdown = (expense) => {
  expenseDropdown.innerHTML = "";
  const allexpenseOption = document.createElement("option");
  allexpenseOption.textContent = "All expense";
  allexpenseOption.value = "0";
  expenseDropdown.appendChild(allexpenseOption);

  expense.forEach((expense) => {
    const option = document.createElement("option");
    option.textContent = expense._doc.expense_name;
    option.value = expense._doc.expense_no;
    expenseDropdown.appendChild(option);
  });
};


const renderExpense = (expense) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  expense.forEach((expense) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
    <td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
      <div class="px-6 py-4">
        <div class="max-md:text-xs">${expense._doc.expense_no}</div>
      </div>
    </td>
    <td class=" max-md:text-xs">${expense._doc.expense_name}</td>
    <td class="px-6 py-4">
      <button type="button" 
      onClick="openEditModal(${expense._doc.expense_no})"
      data-modal-target="editExpenseModal" data-modal-show="editExpenseModal"
      class="inline-flex items-center justify-between rounded-md text-sm h-10 px-4 py-2 w-max mb-2 beautyBtn text-white max-md:text-xs md:max-md:h-4">
      Edit expense</button>
    </td>
  `;

    tbody.appendChild(tr);
  });
};

const fetchExpense = () => {
  ipcRenderer.send("fetch-expense");
}

ipcRenderer.on("expense-data", (event, expense) => {
  apiExpense = expense;
  renderExpense(apiExpense);
  renderDropdown(apiExpense);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchExpense();
  renderExpense(apiExpense);
  renderDropdown(apiExpense);
});
