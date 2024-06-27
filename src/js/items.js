
const xlsx = require('xlsx');
const csvParser = require('csv-parser');
const Swal = require('sweetalert2');
const { Readable } = require("stream");

let apiProduct = [];
let apiCategory = [];

const $targetEl = document.getElementById('editItemModal');
const $targetEl2 = document.getElementById('addNewItemModal');

const options = {
  placement: 'bottom-right',
  backdrop: 'dynamic',
  backdropClasses:
    'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

const editItemModal = new Modal($targetEl, options);
const addNewItemModal = new Modal($targetEl2, options);

function closeModal() {
  addNewItemModal.hide()
  editItemModal.hide()
}

function openEditModal(itemId) {
  const product = apiProduct.find(
    (product) => product._doc.item_no === itemId
  );
  const updateImagePreview = document.getElementById("update_image_preview");
  const updateImagePreviewIcon = document.getElementById("update_image_icon");
  const updateImageInfoText = document.getElementById("update_image_text");
  updateImageInfoText.classList.add("hidden");
  updateImagePreviewIcon.classList.add("hidden");
  updateImagePreview.src = product._doc.item_image;
  updateImagePreview.classList.remove("hidden");
  document.getElementById("item_name").value = product._doc.item_name;
  document.getElementById("rate_one").value = product._doc.rate_one;
  document.getElementById("rate_two").value = product._doc.rate_two;
  document.getElementById("rate_three").value = product._doc.rate_three;
  document.getElementById("rate_four").value = product._doc.rate_four;
  document.getElementById("rate_five").value = product._doc.rate_five;
  document.getElementById("rate_six").value = product._doc.rate_six;

  const editModal = document.getElementById("editItemModal");
  editModal.classList.remove("hidden");
  editModal.classList.add("flex");
  editModal.dataset.itemId = itemId;
}

const updaeFileInput = document.getElementById("item_image");
const updateImageInfoText = document.getElementById("update_image_text");
const updateImagePreviewIcon = document.getElementById("update_image_icon");

updaeFileInput.addEventListener("change", () => {
  const file = updaeFileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imagePreview = document.getElementById("update_image_preview");
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
      updateImageInfoText.classList.add("hidden");
      updateImagePreviewIcon.classList.add("hidden");
    };

    reader.readAsDataURL(file);
  }
});

const editItemHandler = async () => {
  const itemId = document.getElementById('editItemModal').dataset.itemId;
  const imageFile = document.getElementById("item_image").files[0];

  try {
    let itemData = {
      itemName: document.getElementById("item_name").value,
      rate_one: document.getElementById("rate_one").value,
      rate_two: document.getElementById("rate_two").value,
      rate_three: document.getElementById("rate_three").value,
      rate_four: document.getElementById("rate_four").value,
      rate_five: document.getElementById("rate_five").value,
      rate_six: document.getElementById("rate_six").value,
      categoryNo: document.getElementById("category").value,
      isActive: document.getElementById("status").value
    };

    if (imageFile) {
      const uploadPath = path.join(__dirname, '../uploads', imageFile.name);
      const existingProduct = apiProduct.find(product => String(product._doc.item_no) === String(itemId));
      if (existingProduct) {
        const existingImagePath = existingProduct._doc.item_image;
        if(existingImagePath){
          // fs.unlinkSync(existingImagePath);
        }
      }

      fs.copyFileSync(imageFile.path, uploadPath);
      itemData.itemImage = uploadPath;
    }

    ipcRenderer.send("edit-item", itemId, itemData);
    closeModal();
    location.reload(true);
    // fetchProduct();
    // ipcRenderer.on("products-data", (event, products) => {
    //   apiProduct = products;
    //   renderDropdown(apiProduct);
    //   renderProducts(products);
    // });
    

  } catch (error) {
    console.error('Error editing item:', error);
  }
};

const fileInput = document.getElementById("new_item_image");
const imageInfoText = document.getElementById("image_info_text");
const imagePreviewIcon = document.getElementById("image_preview_icon");

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imagePreview = document.getElementById("image_preview");
      imagePreview.src = e.target.result;
      imagePreview.classList.remove("hidden");
      imageInfoText.classList.add("hidden");
      imagePreviewIcon.classList.add("hidden");
    };

    reader.readAsDataURL(file);
  }
});

const newItemHandler = () => {

  const imageFile = document.getElementById("new_item_image").files[0];

  if (!imageFile) {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please select an image!',
      timer: 1000,
    })
  }
  const uploadPath = path.join(__dirname, '../uploads', imageFile.name);
  fs.copyFileSync(imageFile.path, uploadPath);
  try {
    const newItemNoInput = document.getElementById("new_item_no").value
    const newItemNameInput = document.getElementById("new_item_name").value;
    const newRateOne = document.getElementById("new_rate_one").value;
    const newRateTwo = document.getElementById("new_rate_two").value;
    const newRateTree = document.getElementById("new_rate_three").value;
    const newRateFour = document.getElementById("new_rate_four").value;
    const newRateFive = document.getElementById("new_rate_five").value;
    const newRateSix = document.getElementById("new_rate_six").value;
    const newCategoryInput = document.getElementById("new_category").value;
    const newStatusInput = document.getElementById("new_status").value;
    const newTax = document.getElementById("new_tax").value;

    if (newItemNoInput == "" || newItemNameInput == "" || newRateOne == "" || newRateTwo == "" || newRateTree == "" || newRateFour == "" || newRateFive == "" || newRateSix == "" || newCategoryInput == "" || newStatusInput == "") {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Please fill all the fields!',
        timer: 1000,
      })
    }
    else {
      const itemData = {
        item_no: newItemNoInput,
        itemName: newItemNameInput,
        itemImage: uploadPath,
        rate_one: newRateOne,
        rate_two: newRateTwo,
        rate_three: newRateTree,
        rate_four: newRateFour,
        rate_five: newRateFive,
        rate_six: newRateSix,
        categoryNo: newCategoryInput,
        isActive: newStatusInput,
        tax_perc: newTax
      }

      ipcRenderer.send("new-item", itemData)
      closeModal();
      location.reload(true);
      // fetchProduct();
      // ipcRenderer.on("products-data", (event, products) => {
      //   apiProduct = products;
      //   renderDropdown(apiProduct);
      //   renderProducts(products);
      // });
      
    }
  } catch (error) {
    ipcRenderer.on("new-item-error", (event, error) => {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: error,
        timer: 1000,
      })
      setTimeout(() => {
        location.reload(true);
      }, 1000)
    })
  }
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiProduct.filter((product) =>
    product._doc.item_name.toLowerCase().includes(searchText)
  );
  renderProducts(filteredProducts);
});

const productDropdown = document.getElementById("productDropdown");
productDropdown.addEventListener("change", (event) => {
  const selectedproduct = event.target.value;
  if (selectedproduct === "0") {
    renderProducts(apiProduct);
  }
  else {
    const filteredProducts = apiProduct.filter((product) => product._doc.item_no === Number(selectedproduct));
    renderProducts(filteredProducts);
  }
});

const renderDropdown = (products) => {
  productDropdown.innerHTML = "";
  const allproductsOption = document.createElement("option");
  allproductsOption.textContent = "All Items";
  allproductsOption.value = "0";
  productDropdown.appendChild(allproductsOption);

  products.forEach((product) => {
    const option = document.createElement("option");
    option.textContent = product._doc.item_name;
    option.value = product._doc.item_no;
    productDropdown.appendChild(option);
  });
};

const populateEditCategories = (categories) => {
  const categorySelect = document.getElementById("category");
  categorySelect.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.textContent = category._doc.category_name;
    option.value = category._doc.category_no;
    categorySelect.appendChild(option);
  });
};

const populateNewCategories = (categories) => {
  const categorySelect = document.getElementById("new_category");
  categorySelect.innerHTML = "";
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.textContent = category._doc.category_name;
    option.value = category._doc.category_no;
    categorySelect.appendChild(option);
  });
};

const renderProducts = (products) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  products.forEach((product) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
        <td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
          <div class="ps-3 max-md:w-10">
            <div class="max-md:text-xs">${product._doc.item_name}</div>
          </div>
        </td>
        <td class="px-6 py-4">₹ ${product._doc.rate_one}</td>
        <td class="px-6 py-4">₹ ${product._doc.rate_two}</td>
        <td class="px-6 py-4">₹ ${product._doc.rate_three}</td>
        <td class="px-6 py-4">₹ ${product._doc.rate_four}</td>
        <td class="px-6 py-4">₹ ${product._doc.rate_five}</td>
        <td class="px-6 py-4">₹ ${product._doc.rate_six}</td>

        <td class="px-6 py-4">
        <div class="max-md:text-xs ${product._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${product._doc.status ? "Active" : "Inactive"}</div></td>
    </td>
        <td class="px-6 py-4">
          <button type="button" 
          onClick="openEditModal(${product._doc.item_no})"
          data-modal-target="editItemModal" data-modal-show="editItemModal"
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

function fetchProduct() {
  ipcRenderer.send("fetch-products");
}

ipcRenderer.send("fetch-categories");

ipcRenderer.on("categories-data", (event, categories) => {
  apiCategory = categories;
  populateEditCategories(categories);
  populateNewCategories(apiCategory);
});

ipcRenderer.on("products-data", (event, products) => {
  apiProduct = products;
  renderDropdown(apiProduct);
  renderProducts(products);
});

const bulkInput = document.getElementById('bulkUploadInput');
const filePreview = document.getElementById('filePreview');

bulkInput.addEventListener('change', () => {
  const file = bulkInput.files[0];

  if (file) {
    filePreview.textContent = '';
    filePreview.textContent = file.name;
  } else {
    filePreview.textContent = '';
  }
});



document.getElementById('bulkUploadButton').addEventListener('click', () => {
  const fileInput = document.getElementById('bulkUploadInput');
  const file = fileInput.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      const fileType = file.name.split('.').pop();
      let data = [];

      if (fileType === 'xlsx' || fileType === 'xls') {
        const workbook = xlsx.read(new Uint8Array(arrayBuffer), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = xlsx.utils.sheet_to_json(worksheet);
      } else if (fileType === 'csv') {
        const text = new TextDecoder().decode(arrayBuffer);
        data = await parseCsv(text);
      }

      ipcRenderer.send('bulk-insert-item', data);

      ipcRenderer.on("bulk-insert-response", (event, response) => {
        if (response === 'Data inserted successfully') {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Data inserted successfully',
            timer: 1000,
          });
          setTimeout(() => {
            location.reload(true);
          }, 1000);
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Error inserting data',
            timer: 1000,
          });
          setTimeout(() => {
            location.reload(true);
          }, 1000);
        }
      })
    };

    reader.readAsArrayBuffer(file);
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'Please select a file to upload!',
      timer: 1000,
    });
  }
});

function parseCsv(data) {
  return new Promise((resolve, reject) => {
    const results = [];
    const readable = new Readable();
    readable._read = () => { };
    readable.push(data);
    readable.push(null);

    readable.pipe(csvParser())
      .on('data', (row) => results.push(row))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}


document.addEventListener("DOMContentLoaded", () => {
  fetchProduct();
  renderProducts(apiProduct);
  populateEditCategories(apiCategory);
  populateNewCategories(apiCategory);
});



