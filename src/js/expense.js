
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
