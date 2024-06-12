const Swal = require('sweetalert2')
let apiStock = [];
let apiProduct = [];
let apiRawMaterial = [];

const new_item_nameDropdown = document.getElementById("new_item_name");
const new_sub_item_nameDropdown = document.getElementById("new_sub_item_name");

const renderProductDropdown = (apiProduct) => {
    new_item_nameDropdown.innerHTML = "";
    apiProduct.forEach((Product) => {
        const option = document.createElement("option");
        option.value = `${Product._doc.item_no} ${Product._doc.item_name}`;
        option.textContent = Product._doc.item_name;
        new_item_nameDropdown.appendChild(option);
    })
}
const fetchItemsAndRawMaterials = () => {
    ipcRenderer.send("fetch-products");
    ipcRenderer.send("fetch-Stock");
}

ipcRenderer.on("products-data", (event, products) => {
    console.log("fetching done")
    apiProduct = products;
    renderProductDropdown(apiProduct);
})
ipcRenderer.on("fetch-Stock-data", (event, stock) => {
    console.log("fetching done")
    apiStock = stock;
    renderRawMaterialsDropdown(apiStock);
})


function closeModal() {
    const editModal = document.getElementById("editStockModal");
    editModal.classList.add("hidden");
}

function openEditModal(receipeId) {
    const Stock = apiRawMaterial.find(receipe => receipe.receipe_no === receipeId);
    document.getElementById("item_name").value = Stock.item_name;

    const subItemsContainer = document.getElementById("edit_sub_items_container");
    subItemsContainer.innerHTML = ""; 

    Stock.sub_item_details.forEach((subItem, index) => {
        const subItemElement = document.createElement("div");
        subItemElement.classList.add("grid", "grid-cols-6", "gap-6", "sub_item", "mt-4");

        subItemElement.innerHTML = `
            <div class="col-span-6 sm:col-span-3">
                <label for="edit_sub_item_name_${index}" class="block mb-2 text-sm font-medium text-black">Sub Item Name</label>
                <input name="edit_sub_item_name_${index}" id="edit_sub_item_name_${index}" value="${subItem.item_name}" class="shadow-sm bg-primary border text-black text-sm rounded-lg border-primary focus:outline-none block w-full p-2.5" required="true" />
            </div>
            <div class="col-span-6 sm:col-span-3">
                <label for="edit_sub_item_quantity_${index}" class="block mb-2 text-sm font-medium text-black">Quantity</label>
                <input name="edit_sub_item_quantity_${index}" id="edit_sub_item_quantity_${index}" value="${subItem.quantity}" class="shadow-sm bg-primary border text-black text-sm rounded-lg border-primary focus:outline-none block w-full p-2.5" required="true" />
            </div>
        `;
        subItemsContainer.appendChild(subItemElement);
    });

    const editStockModal = document.getElementById("editStockModal");
    editStockModal.classList.remove("hidden");
    editStockModal.classList.add("flex");
    editStockModal.dataset.receipeId = receipeId;
}



const addNewSubItemForEdit = () => {
    const subItemsContainer = document.getElementById("edit_sub_items_container");
    const newSubItem = document.createElement("div");
    newSubItem.classList.add("grid", "grid-cols-6", "gap-6", "sub_item", "mt-4");

    // find the index of prevoius input tag
    const lastIndex = subItemsContainer.children.length - 1;
    const newIndex = lastIndex + 1;
    newSubItem.innerHTML = `
        <div class="col-span-6 sm:col-span-3">
            <label for="edit_sub_item_name_${newIndex}" class="block mb-2 text-sm font-medium text-black">Select Sub Item</label>
            <select name="edit_sub_item_name_${newIndex}" id="edit_sub_item_name_${newIndex}" class="shadow-sm bg-primary border text-black text-sm rounded-lg border-primary focus:outline-none block w-full p-2.5" required="true">
                ${apiStock.map(stock => `<option value="${stock._doc.item_no}">${stock._doc.item_name}</option>`).join('')}
            </select>
        </div>
        <div class="col-span-6 sm:col-span-3">
            <label for="edit_sub_item_quantity_${newIndex}" class="block mb-2 text-sm font-medium text-black">Quantity</label>
            <input name="edit_sub_item_quantity_${newIndex}" id="edit_sub_item_quantity_${newIndex}" class="shadow-sm bg-primary border text-black text-sm rounded-lg border-primary focus:outline-none block w-full p-2.5" placeholder="Enter Quantity" required="true" />
        </div>
    `;

    subItemsContainer.appendChild(newSubItem);

};



const editStockHandler = () => {
    const receipeId = document.getElementById('editStockModal').dataset.receipeId;

    try {
        const itemName = document.getElementById("item_name").value;
        const subItems = [];
        const subItemElements = document.getElementsByClassName("sub_item");

        for (let i = 0; i < subItemElements.length; i++) {
            const subItemNameInput = subItemElements[i].querySelector("input[name^='edit_sub_item_name']");
            const subItemNameSelect = subItemElements[i].querySelector("select[name^='edit_sub_item_name']");

            // were gettinh the subItemNameSelect as number so we ahve to find the name from apiStock
            const subItemNameNumber = subItemNameSelect ? Number(subItemNameSelect.value) : 0;
            const subItemNameSelected = apiStock.find(stock => stock._doc.item_no === subItemNameNumber)?._doc.item_name;
            const subItemName = subItemNameInput ? subItemNameInput.value : (subItemNameSelect ? subItemNameSelected : '');
            const subItemQuantityInput = subItemElements[i].querySelector("input[name^='edit_sub_item_quantity']");
            const subItemQuantity = subItemQuantityInput ? subItemQuantityInput.value : '';

            if(subItemNameNumber){
                subItems.push({
                    item_no: subItemNameNumber,
                    item_name: subItemName,
                    quantity: subItemQuantity
                })
            }
            subItems.push({
                item_name: subItemName,
                quantity: subItemQuantity
            });
            
        }
        // check the subItems any elemnt is no empty if emply remove it
        subItems.forEach((subItem, index) => {
            if (subItem.name === '' || subItem.quantity === '') {
                subItems.splice(index, 1);
            }
        });
        console.log(subItems)
        const receipeData = {
            item_name: itemName,
            sub_items_details: subItems
        };

        ipcRenderer.send("edit-receipe", receipeId, receipeData);

        const editStockModal = document.getElementById("editStockModal");
        editStockModal.classList.add("hidden");
        editStockModal.classList.remove("flex");
        fetchReceipe();
    } catch (error) {
        console.error('Error editing item:', error);
    }
};


let subItemCount = 1;

const addNewSubItem = () => {
    const subItemsContainer = document.getElementById("sub_items_container");
    const newSubItem = document.createElement("div");
    newSubItem.classList.add("grid", "grid-cols-6", "gap-6", "sub_item","mt-4");

    newSubItem.innerHTML = `
    <div class="col-span-6 sm:col-span-3">
      <label for="new_sub_item_name_${subItemCount}" class="block mb-2 text-sm font-medium text-black">Select Ingredients</label>
      <select id="new_sub_item_name_${subItemCount}"
        class="block py-2.5 w-full text-sm text-black bg-primary px-3 border-0 appearance-none rounded-lg border-primary focus:ring-0 border-primary focus:outline-none peer new_sub_item_name">
      </select>
    </div>
    <div class="col-span-6 sm:col-span-3">
      <label for="new_sub_item_quantity_${subItemCount}" class="block mb-2 text-sm font-medium text-black">Item Quantity</label>
      <input name="new_sub_item_quantity_${subItemCount}" id="new_sub_item_quantity_${subItemCount}" max="1000" maxlength="1000"
        class="shadow-sm bg-primary border text-black text-sm rounded-lg border-primary focus:outline-none block w-full p-2.5 new_sub_item_quantity"
        placeholder="e.g. 100, 200" required="true" />
    </div>
  `;

    subItemsContainer.appendChild(newSubItem);

    // Populate the new dropdown with options from the initial dropdown
    const initialDropdown = document.getElementById("new_sub_item_name_0");
    const newDropdown = document.getElementById(`new_sub_item_name_${subItemCount}`);
    newDropdown.innerHTML = initialDropdown.innerHTML;

    subItemCount++;
};

const renderRawMaterialsDropdown = (apiStock) => {
    const initialDropdown = document.getElementById("new_sub_item_name_0");
    initialDropdown.innerHTML = "";
    apiStock.forEach((Stock) => {
        const option = document.createElement("option");
        option.value = `${Stock._doc.item_no} ${Stock._doc.item_name}`;
        option.textContent = Stock._doc.item_name;
        initialDropdown.appendChild(option);
    });
};

renderRawMaterialsDropdown(apiStock);


const newReceipeHandler = () => {
    try {
        const newItem = document.getElementById("new_item_name").value;
        const newItemNo = newItem.split(" ")[0];
        const newItemName = newItem.split(" ").slice(1).join(" ");

        const subItems = [];
        const subItemElements = document.getElementsByClassName("sub_item");

        for (let i = 0; i < subItemElements.length; i++) {
            const newSubItem = subItemElements[i].querySelector(".new_sub_item_name").value;
            const newSubItemNo = newSubItem.split(" ")[0];
            const newSubItemName = newSubItem.split(" ").slice(1).join(" ");
            const newQty = subItemElements[i].querySelector(".new_sub_item_quantity").value;

            if (newSubItemNo == "" || newSubItemName == "" || newQty == "") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'All fields are required!',
                    timer: 1000,
                });
                return;
            }

            subItems.push({
                item_no: Number(newSubItemNo),
                item_name: newSubItemName,
                quantity: Number(newQty),
            });
        }

        if (newItemNo == "" || newItemName == "") {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All fields are required!',
                timer: 1000,
            });
            return;
        }

        const receipeData = {
            item_name: newItemName,
            item_no: Number(newItemNo),
            sub_item_details: subItems
        };

        ipcRenderer.send("new-receipe", receipeData);

        const addNewStockModal = document.getElementById("addNewReceipeModal");
        addNewStockModal.classList.add("hidden");
        addNewStockModal.classList.remove("flex");
        location.reload(true);
        fetchReceipe();
    } catch (error) {
        console.log("Error inserting", error);
    }
};

const openIngredientModal = (receipe_no) => {
    const IngredientModal = document.getElementById("IngredientModal");
    IngredientModal.classList.add("flex");
    IngredientModal.classList.remove("hidden");

    const ingredient_container = document.getElementById("ingredient_container");
    const ingredientData = apiRawMaterial.find((item) => item.receipe_no == receipe_no);
    ingredient_container.innerHTML = "";
    const item_title = document.getElementById("item_title")
    item_title.textContent = ingredientData.item_name;
    ingredientData.sub_item_details.forEach((item) => {
        const span = document.createElement("span");
        span.textContent = `${item.item_name} - ${item.quantity}gm`;
        span.classList.add("text-sm" , "text-darkish", "font-medium");
        ingredient_container.appendChild(span);
    })
}

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const filteredStocks = apiStock.filter((Stock) =>
        Stock._doc.item_name.toLowerCase().includes(searchText)
    );
    renderRawMaterials(filteredStocks);
});

const renderRawMaterials = (RawMaterial) => {
    console.log(RawMaterial)
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    RawMaterial.forEach((raw) => {
        const tr = document.createElement("tr");
        tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

        tr.innerHTML = `
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${raw.receipe_no}</div>
    </td>
    <td class="px-6 py-4">
        <div class="max-md:text-xs">${raw.item_name}</div>
    </td>
    <td class="px-6 py-4">
    <button type="button" 
    onClick="openIngredientModal(${raw.receipe_no})"
    data-modal-target="IngredientModal" data-modal-show="IngredientModal"
    class="inline-flex items-center justify-between rounded-md text-sm hover:bg-ssecondary h-10 px-4 py-2 w-max mb-2 beautyBtn text-white max-md:text-xs md:max-md:h-4">
    Ingredients</button>
    </td>
    <td class="px-6 py-4">
      <button type="button" 
      onClick="openEditModal(${raw.receipe_no})"
      data-modal-target="editStockModal" data-modal-show="editStockModal"
      class="inline-flex items-center justify-between rounded-md text-sm hover:bg-ssecondary h-10 px-4 py-2 w-max mb-2 beautyBtn text-white max-md:text-xs md:max-md:h-4">
      Edit Receipe</button>
    </td>
  `;

        tbody.appendChild(tr);
    });
};

const fetchReceipe = () => {
    ipcRenderer.send("fetch-receipe");
}

ipcRenderer.on("fetch-receipe-data", (event, stock) => {
    apiRawMaterial = JSON.parse(stock);
    renderRawMaterials(apiRawMaterial);
});

document.addEventListener("DOMContentLoaded", () => {
    fetchReceipe();
    fetchItemsAndRawMaterials();
    renderRawMaterials(apiRawMaterial);
});
