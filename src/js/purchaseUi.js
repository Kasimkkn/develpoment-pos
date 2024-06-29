const { Modal } = require("flowbite");
const { default: Swal } = require("sweetalert2");

let apiRawProduct = [];
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";

const initializeModal = (id) => {
    const $targetEl = document.getElementById(id);
    const options = {
        placement: "center",
        backdrop: "dynamic",
        backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
        closable: true,
    };

    const modal = new Modal($targetEl, options);
    return modal;
};

const quantityAddModal = initializeModal("quantityAddModal");

let cartItemId;

const openQuantityModal = (itemId) => {
    const newQuantity = document.getElementById("newQuantity");
    const newPrice = document.getElementById("newPrice");
    
    // Set item values
    cartItemId = itemId;
    const itemOfCart = cartItems.find((item) => item.item_no === Number(itemId));
    const rawMaterialPrice = apiRawProduct.find((item) => item._doc.item_no == itemId);
    newQuantity.value = itemOfCart ? itemOfCart.quantity : 1;
    newPrice.value = itemOfCart ? itemOfCart.price : rawMaterialPrice._doc.mrp;

    // Show the modal
    quantityAddModal.show();

    // Set focus and move cursor to the end of input value
    newQuantity.focus();
    newQuantity.setSelectionRange(newQuantity.value.length, newQuantity.value.length);
};

const updateCartUI = () => {
    const cartElement = document.getElementById("cart");
    cartElement.innerHTML = "";
    cartItems.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.classList = "flex items-center justify-between py-2 px-3 rounded-lg bg-white";
        itemElement.innerHTML = `
      <input type="hidden" value="${item.item_no}" id="itemNo"/>
      <div class="flex flex-col gap-2 items-start w-40 max-lg:w-32">
        <div class="flex gap-1 justify-between items-center text-sm">
          <p class="text-sm flex uppercase gap-2">${item.item_name} <span class="font-medium text-xs">${item.quantity}kg * ${item.price}</span></p>
        </div>
        <div class="text-xs flex gap-2 items-center">
          <button class=" text-white p-1  rounded-md beautyBtn text-sm" onclick="openQuantityModal('${item.item_no}')">Update</button>
        </div>
      </div>
      <div class="flex flex-col gap-2 justify-center items-center">
        <p class="text-xs">${(item.price * item.quantity).toFixed(2)}</p>
        <button class=" text-white p-1 rounded-md beautyBtn text-sm" onclick="removeItemFromCart('${item.item_no}')">delete</button>
      </div>
    `;

        cartElement.appendChild(itemElement);
    });
    updateCartSummary(cartItems);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
};

const updateCartSummary = (cartItems) => {
    const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
    const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);


    document.getElementById("total-items").textContent = `Total (${totalItems} Items)`;
    document.getElementById("total-amount").textContent = `${userCurrency} ${totalAmount.toFixed(2)}`;
    document.getElementById("net-amount").textContent = `${userCurrency} ${totalAmount.toFixed(2)}`;
};

document.getElementById("add-quantity-btn").addEventListener("click", () => {
    const newQuantity = parseInt(document.getElementById("newQuantity").value, 10);
    const newPrice = parseFloat(document.getElementById("newPrice").value);

    if (isNaN(newQuantity) || newQuantity <= 0 || isNaN(newPrice) || newPrice <= 0) {
        alert("Please enter valid quantity and price.");
        return;
    }

    const existingItem = cartItems.find((item) => item.item_no == cartItemId);
    if (existingItem) {
        existingItem.quantity += newQuantity;
        existingItem.price = newPrice;
    } else {
        const productFromApi = apiRawProduct.find((item) => item._doc.item_no == cartItemId);
        if (productFromApi) {
            cartItems.push({
                item_no: cartItemId,
                item_name: productFromApi._doc.item_name,
                quantity: newQuantity,
                price: newPrice,
            });
        }
    }

    quantityAddModal.hide();
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartUI();
});

const searchInput = document.getElementById("searchInput");
searchInput.addEventListener("input", () => {
    const searchText = searchInput.value.toLowerCase();
    const filteredProducts = apiRawProduct.filter((product) =>
        product._doc.item_name.toLowerCase().includes(searchText)
    );
    populateProducts(filteredProducts);
});

const getCartItemQuantity = (itemNo) => {
    const cartItem = cartItems.find((item) => item.item_no === itemNo);
    return cartItem ? cartItem.quantity : 0;
};

const populateProducts = (products) => {
    const productList = document.getElementById("search-product-list");
    productList.innerHTML = "";

    products.forEach((product) => {
        const productElement = document.createElement("div");
        productElement.classList.add("product", "w-64", "bg-white", "rounded-xl", "duration-500", "hover:shadow-xl");
        productElement.innerHTML = `
      <div class="flex p-1 flex-col justify-between gap-2">
        <div class="flex flex-col gap-1">
          <p class="text-sm font-extralight" style="text-transform: Uppercase;">
            ${product._doc.item_name.split(" ").slice(0, 3).join(" ")}
          </p> 
          <p class="text-sm font-bold">
            ${userCurrency} ${product._doc.mrp}
          </p>
        </div>
      </div>
    `;
        productElement.addEventListener('click', () => {
            openQuantityModal(product._doc.item_no);
        });
        productList.appendChild(productElement);
    });
};

const removeItemFromCart = (productId) => {
    cartItems = cartItems.filter((item) => item.item_no != productId);
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
    updateCartUI();
};

const saveBill = () => {
    const cartData = JSON.parse(localStorage.getItem("cartItems"));
    const supplier_name = document.getElementById("supplier_name").value;
    ipcRenderer.send("save-purchase-data", cartData, supplier_name);
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Purchase successfully',
        timer: 1000
    })
    localStorage.removeItem("cartItems");
    cartItems = [];
    updateCartUI();
};

ipcRenderer.on("purchase-save-success", () => {
    Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Purchase successfully',
        timer: 1000
    })
    localStorage.removeItem("cartItems");
    cartItems = [];
    updateCartUI();
})

const saveBillBtn = document.getElementById("save-bill-btn");
saveBillBtn.addEventListener("click", () => {
    if(document.getElementById("supplier_name").value == "" || cartItems.length == 0){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Please select supplier And Items',
            timer: 800
        })
        return;
    }
    else{
        saveBill();
    }
    // printBill(2, billData);
});

const renderStockDropdown = (supplierList) => {
    const supplierDropdwon = document.getElementById("supplier_name_list");

    supplierDropdwon.innerHTML = "";
    supplierList.forEach((supplier) => {
        const option = document.createElement("option");
        option.textContent = supplier._doc.supplier_name;
        supplierDropdwon.appendChild(option);
    });
};


document.addEventListener("DOMContentLoaded", () => {
    ipcRenderer.send("fetch-Stock");
    ipcRenderer.send("fetch-supplier");
    ipcRenderer.on("fetch-Stock-data", (event, stock) => {
        apiRawProduct = stock;
        populateProducts(apiRawProduct);
        updateCartUI();
    });

    ipcRenderer.on("supplier-data", (event, supplier) => {
        renderStockDropdown(supplier);
    })
});
