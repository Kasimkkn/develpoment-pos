
const Swal = require('sweetalert2')
let apiCategory = [];

function closeModal() {
  const editModal = document.getElementById("editCategoryModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewCategoryModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(categoryId) {
  const category = apiCategory.find(
    (category) => category._doc.category_no === categoryId
  );

  document.getElementById("category_name").value = category._doc.category_name;

  const editCategoryModal = document.getElementById("editCategoryModal");
  editCategoryModal.classList.remove("hidden");
  editCategoryModal.classList.add("flex");
  editCategoryModal.dataset.categoryId = categoryId;
}

const editCategoryHandler = async () => {
  const categoryId = document.getElementById('editCategoryModal').dataset.categoryId;

  try {
    const categoryData = {
      categoryName: document.getElementById("category_name").value,
      isActive: document.getElementById("status").value,
    }
    ipcRenderer.send("edit-category", categoryId, categoryData);

    const editCategoryModal = document.getElementById("editCategoryModal");
    editCategoryModal.classList.add("hidden");
    editCategoryModal.classList.remove("flex");
    fetchCategory();

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const newCategoryHandler = () => {
  try {
    const categoryNameInput = document.getElementById("new_category_name").value;
    const isActiveInput = document.getElementById("new_status").value;
    
    if(categoryNameInput === "" || isActiveInput === "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'All fields are required!',
        timer:1000,
      })
      return;
    }

    const categoryData = {
      categoryName: document.getElementById("new_category_name").value,
      isActive: document.getElementById("new_status").value,
    }

    ipcRenderer.send("new-category", categoryData)

    const addNewCategoryModal = document.getElementById("addNewCategoryModal");
    addNewCategoryModal.classList.add("hidden");
    addNewCategoryModal.classList.remove("flex");
    location.reload(true);
    fetchProduct();
  } catch (error) {
    console.log("Error inserting", error);
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiCategory.filter((category) =>
    category._doc.category_name.toLowerCase().includes(searchText)
  );
  renderCategories(filteredProducts);
});

const categoryDropdown = document.getElementById("categoryDropdown");
categoryDropdown.addEventListener("change", (event) => {
  const selectedCategory = event.target.value;
  if (selectedCategory === "0") {
    renderCategories(apiCategory);
  }
  else {
    const filteredProducts = apiCategory.filter((Category) => Category._doc.category_no === Number(selectedCategory));
    renderCategories(filteredProducts);
  }
});

const renderDropdown = (category) => {
  categoryDropdown.innerHTML = "";
  const allcategoryOption = document.createElement("option");
  allcategoryOption.textContent = "All category";
  allcategoryOption.value = "0";
  categoryDropdown.appendChild(allcategoryOption);

  category.forEach((category) => {
    const option = document.createElement("option");
    option.textContent = category._doc.category_name;
    option.value = category._doc.category_no;
    categoryDropdown.appendChild(option);
  });
};

const renderCategories = (categories) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  categories.forEach((category) => {
    if(!category._doc.status) return;
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
    <td class="px-6 py-4">
      <div class="px-6 py-4">
        <div class="max-md:text-xs">${category._doc.category_no}</div>
      </div>
    </td>
    <td class="px-6 py-4">
      <div class="px-6 py-4">
        <div class="max-md:text-xs">${category._doc.category_name}</div>
      </div>
    </td>
    <td class="px-6 py-4">
      <div class="px-6 py-4">
      <div class="max-md:text-xs ${category._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
    }">${category._doc.status ? "Active" : "Inactive"}</div>
      </div>
    </td>
    <td class="px-6 py-4">
      <button type="button" 
      onClick="openEditModal(${category._doc.category_no})"
      data-modal-target="editCategoryModal" data-modal-show="editCategoryModal"
      class="inline-flex items-center justify-between rounded-md text-sm hover:bg-ssecondary h-10 px-4 py-2 w-max mb-2 beautyBtn text-white max-md:text-xs md:max-md:h-4">
      Edit</button>
    </td>
  `;

    tbody.appendChild(tr);
  });
};

const fetchCategory = () => {
  ipcRenderer.send("fetch-categories");
}

ipcRenderer.on("categories-data", (event, categories) => {
  apiCategory = categories;
  renderCategories(apiCategory);
  renderDropdown(apiCategory);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchCategory();
  renderCategories(apiCategory);
  renderDropdown(apiCategory);
});
