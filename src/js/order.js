const urlParams = new URLSearchParams(window.location.search);
const locationName = urlParams.get("location") || "Common-Hall";
const tableNo = urlParams.get("id") || 1;
document.getElementById("locationName").innerHTML = locationName;
document.getElementById("tableNo").innerHTML = "Table No: " + tableNo;
const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";
const userLoyalty = JSON.parse(localStorage.getItem("loyaltyRedeemData"));

let userTaxPerc;

if (userPref._doc.is_gstAvailable) {
  userTaxPerc = userPref._doc.gst_percentage / 100;
}
else if (userPref._doc.is_ValueAddedTaxAvailable) {
  userTaxPerc = userPref._doc.vat_percentage / 100;
}
else {
  userTaxPerc = 0;
}

let apiProduct = [];
let cartItems = [];
let Locations = [];
let apiCategory = JSON.parse(localStorage.getItem("categories"));


let spInfList = [];
ipcRenderer.send("get-special-info");
ipcRenderer.on("get-special-info-success", (event, data) => {
  spInfList = data;
})


const updateCartUI = () => {
  const cartElement = document.getElementById("cart");
  cartElement.innerHTML = "";
  cartItems.forEach((item) => {
    const sp_info = item._doc.sp_info ? item._doc.sp_info : "none";
    const itemElement = document.createElement("div");
    itemElement.classList = "flex items-center justify-between py-2 px-3 rounded-lg";
    if (item._doc.is_printed) {
      itemElement.classList.add("bg-secondary");
    }
    else {
      itemElement.classList.add("bg-white");
    }
    itemElement.innerHTML = `
    <input type="hidden" value="${item._doc.item_no}" id="itemNo"/>
  <div class="flex flex-col gap-1 w-full">
      <div class="flex gap-1 justify-between items-center text-sm">
      <p class="text-sm flex ">${item._doc.item_name.split(" ").slice(0, 3).join(" ")} ${sp_info !== "none" ? `(${sp_info})` : ``}</p>
      <button data-modal-target="quantityAddModal" data-modal-toggle="quantityAddModal" id="quantity-${item._doc.item_no}" class="beautyBtn text-black flex items-center justify-center rounded-md  w-10 hover:cursor-pointer">note</button>
      </div>
    <div class="flex justify-between items-center">
      <div class="text-xs flex gap-2 items-center">
      <button class="text-lg text-white rounded-md beautyBtn w-8 h-8" onclick="handleIncrement('${item._doc.item_no}','${item._doc.price}', event)">+</button>
      ${item._doc.quantity} 
      <button class="text-lg text-white rounded-md beautyBtn w-8 h-8" onclick="handleDecrement(${item._doc.item_no}, '${sp_info}',event)">-</button>
      </div>
    <div class="flex gap-2 justify-end items-end">
      <p class="text-xs">${(item._doc.price * item._doc.quantity).toFixed(2)}</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" id="delete" class="hover:cursor-pointer"
      onclick='removeItemFromCart("${locationName}", "${tableNo}", ${JSON.stringify(item._doc)})'>
      <path d="M24.2,12.193,23.8,24.3a3.988,3.988,0,0,1-4,3.857H12.2a3.988,3.988,0,0,1-4-3.853L7.8,12.193a1,1,0,0,1,2-.066l.4,12.11a2,2,0,0,0,2,1.923h7.6a2,2,0,0,0,2-1.927l.4-12.106a1,1,0,0,1,2,.066Zm1.323-4.029a1,1,0,0,1-1,1H7.478a1,1,0,0,1,0-2h3.1a1.276,1.276,0,0,0,1.273-1.148,2.991,2.991,0,0,1,2.984-2.694h2.33a2.991,2.991,0,0,1,2.984,2.694,1.276,1.276,0,0,0,1.273,1.148h3.1A1,1,0,0,1,25.522,8.164Zm-11.936-1h4.828a3.3,3.3,0,0,1-.255-.944,1,1,0,0,0-.994-.9h-2.33a1,1,0,0,0-.994.9A3.3,3.3,0,0,1,13.586,7.164Zm1.007,15.151V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Zm4.814,0V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Z"></path>
      </svg>
    </div>
    </div>  
  </div>
      
  `;

    cartElement.appendChild(itemElement);
  });
  cartElement.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-modal-toggle="quantityAddModal"]');
    if (button) {
      document.getElementById("newQuantity").value = 1;
      const itemId = button.id.replace('quantity-', '');
      openQuantityModal(itemId);
    }
  });
  updateCartSummary(cartItems);
};

const updateCartSummary = (cartItems) => {
  const totalItems = cartItems.reduce(
    (total, item) => total + item._doc.quantity,
    0
  );
  let totalAmount = cartItems.reduce(
    (total, item) => total + item._doc.price * item._doc.quantity,
    0
  );

  let discountAmount = 0;
  if(userLoyalty.discount_amount && locationName == userLoyalty.location_name && tableNo == userLoyalty.table_no) {
    discountAmount = totalAmount * (userLoyalty.discount_amount / 100);
    totalAmount -= discountAmount;
  }
  const taxAmount = totalAmount * userTaxPerc;
  const netAmount = totalAmount + taxAmount;

  document.getElementById("total-items").textContent = `Total (${totalItems} Items)`;
  
  document.getElementById("total-amount").textContent = `${userCurrency} ${totalAmount.toFixed(
    2
  )}`;
  document.getElementById("tax-amount").textContent = `${userCurrency} ${taxAmount.toFixed(
    2
  )}`;
  document.getElementById("net-amount").textContent = `${userCurrency} ${netAmount.toFixed(
    2
  )}`;
  document.getElementById("Bill_amount").textContent = `${userCurrency} ${netAmount.toFixed(
    2
  )}`;
};


const addItemToCart = (product, price) => {
  const newItem = {
    tableNo: tableNo,
    locationName: locationName,
    id: product._doc.item_no,
    name: product._doc.item_name,
    image: product._doc.item_image,
    price,
    quantity: 1,
  };

  ipcRenderer.send("add-cartItem", newItem);
  if(cartItems.length === 0 ){
    renderLocationBlocks()
  }
  updateCartUI();
};

const removeItemFromCart = (locationName, tableNo, item) => {
  try {
    ipcRenderer.send(
      "delete-whole-cartItem",
      locationName,
      tableNo,
      JSON.stringify(item)
    );
    if (item.is_printed == true) {
      printCancelKot(locationName,tableNo,item);
    }
    ipcRenderer.on("cartItems-data", (event, receivedCartItems) => { // Use once to avoid multiple event listeners
      cartItems = receivedCartItems;
      updateCartUI();
    });
  } catch (error) {
    console.log("Error removing item from cart:", error);
  }
};


const handleIncrement = (productId, price, event) => {
  event.preventDefault();
  const product = apiProduct.find(
    (product) => product._doc.item_no == productId
  );
  if (product) {
    addItemToCart(product, price);
  } else {
    console.error(`Element with ID 'quantity-${productId}' not found.`);
  }
};

const handleDecrement = (productId, sp_info,event) => {
  event.preventDefault();
  const product = cartItems.find(
    (item) => item._doc.item_no === productId && item._doc.sp_info === sp_info
  )
  if (product) {
    if (product._doc.quantity == 0) {
      removeItemFromCart(locationName, tableNo, product);
      return
    }
    const toUpdateData = {
      tableNo: tableNo,
      locationName: locationName,
      item: product,
      newQuantity: product._doc.quantity === 1 ? 0 : product._doc.quantity - 1,
    };
    ipcRenderer.send("update-cartItem-quantity", toUpdateData);
    ipcRenderer.on("cartItems-data", (event, receivedCartItems) => { // Use once to avoid multiple event listeners
      cartItems = receivedCartItems;
      updateCartUI();
    })
  }
};

const isNumeric = document.getElementById("isNumeric")

const searchInput = document.getElementById("searchInput");

window.addEventListener('load', () => {
  const savedIsNumericState = localStorage.getItem('isNumeric');
  if (savedIsNumericState) {
    isNumeric.checked = JSON.parse(savedIsNumericState);
    updateSearchInputType();
  }
});

function updateSearchInputType() {
  if (isNumeric.checked) {
    searchInput.type = 'number';
  } else {
    searchInput.type = 'text';
  }
}

isNumeric.addEventListener('change', () => {
  localStorage.setItem('isNumeric', isNumeric.checked);
  updateSearchInputType();
});

searchInput.addEventListener('input', () => {
  const searchText = searchInput.value.toLowerCase();
  if (searchText === "") {
    populateProducts(apiProduct, locationName, Locations);
    return;
  }
  const filteredProducts = apiProduct.filter((product) =>
    isNumeric.checked
      ? product._doc.item_no.toString().includes(searchText)
      : product._doc.item_name.toLowerCase().includes(searchText) ||
      product._doc.item_no.toString().includes(searchText)
  );
  populateProducts(filteredProducts, locationName, Locations);
});

const getCartItemQuantity = (itemNo) => {
  let totalQuantity = 0;

  cartItems.forEach((item) => {
    if (item._doc.item_no === itemNo) {
      totalQuantity += item._doc.quantity;
    }
  });

  return totalQuantity;
};

const populateProducts = (products, locationName) => {
  const productList = document.getElementById("product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
    if (!product._doc.status) {
      return;
    }
    const currentLocation = Locations.find(loc => loc._doc.location_name == locationName);
    const locationPriceKey = currentLocation ? "rate_" + currentLocation._doc.location_price : "rate_one";


    let price;
    switch (locationPriceKey) {
      case "rate_one":
        price = product._doc.rate_one;
        break;
      case "rate_two":
        price = product._doc.rate_two;
        break;
      case "rate_three":
        price = product._doc.rate_three;
        break;
      case "rate_four":
        price = product._doc.rate_four;
        break;
      case "rate_five":
        price = product._doc.rate_five;
        break;
      case "rate_six":
        price = product._doc.rate_six;
        break;
      default:
        price = product._doc.rate_one;
    }
    const productElement = document.createElement("a");
    productElement.href = "#";
    productElement.classList.add("product", "w-40", "bg-white", "rounded-xl", "duration-500", "hover:shadow-xl");
    productElement.innerHTML = `
          <div class="flex p-1 flex-col justify-between gap-2">
          <span class="flex gap-2">
            <img src="${product._doc.item_image}" class="w-40 h-16 rounded-lg object-cover" alt="product image">
            </span>
            <div class="flex flex-col gap-1">
            <p class="text-sm font-extralight" style="text-transform: capitalize;">
            ${product._doc.item_name.split(" ").slice(0, 3).join(" ")}
            </p> 
            <p class="text-sm font-bold">
            ${userCurrency} ${price}
            </p>
            </div>
          </div>

    `;
    productElement.addEventListener('click', (event) => {
      handleIncrement(product._doc.item_no, price , event);
    })
    productList.appendChild(productElement);
  });
  productList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-modal-toggle="quantityAddModal"]');
    if (button) {
      document.getElementById("newQuantity").value = 1;
      const itemId = button.id.replace('quantity-', '');
      openQuantityModal(itemId);
    }
  });
};

const handleCategoryClick = (categoryNo) => {
  const buttonClicked = document.getElementById(categoryNo);

  if (buttonClicked) {

    buttonClicked.classList.add("beautyBtn");
    const allCategoryButtons = document.querySelectorAll("#category-list button");
    allCategoryButtons.forEach((button) => {
      if (button !== buttonClicked) {
        button.classList.remove("beautyBtn");
      }
    });
  }

  if (categoryNo === "all") {
    populateProducts(apiProduct);
  } else {
    const filteredProducts = apiProduct.filter(
      (product) => product._doc.category_no === parseInt(categoryNo)
    );
    populateProducts(filteredProducts);
  }
};

const populateCateogories = (categories) => {
  const categoryList = document.getElementById("category-list");
  categoryList.innerHTML = "";

  const allCategoryOption = document.createElement("button");
  allCategoryOption.id = "all";
  allCategoryOption.textContent = "ALL";
  allCategoryOption.className = "flex items-center justify-center rounded-md border beautyBtn border-primary p-2 text-xs bg-white";
  allCategoryOption.addEventListener("click", () => {
    handleCategoryClick("all");
  })
  categoryList.appendChild(allCategoryOption);

  const categoriesWithProducts = categories.filter((category) =>
    apiProduct.some((product) => product._doc.category_no === category._doc.category_no && product._doc.status)
  );

  categoriesWithProducts.forEach((category) => {
    const categoryElement = document.createElement("button");
    categoryElement.id = category._doc.category_no.toString();
    categoryElement.textContent = category._doc.category_name.split(" ")[0].toUpperCase();
    categoryElement.className = "flex items-center justify-center rounded-md border border-primary p-2 text-xs bg-white";

    categoryElement.addEventListener("click", () => {
      handleCategoryClick(category._doc.category_no);
    });

    categoryList.appendChild(categoryElement);
  });
};

const $targetEl = document.getElementById('quantityAddModal');
const $targetEl2 = document.getElementById('customerInfoModal');

const options = {
  placement: 'bottom-right',
  backdrop: 'dynamic',
  backdropClasses:
    'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

const quantityAddModal = new Modal($targetEl, options);
const customerInfoModal = new Modal($targetEl2, options);

const newQuantityInput = document.getElementById("newQuantity");
const specialInfoInput = document.getElementById("specialInfo");

let cartItemId = 0
const openQuantityModal = (itemId) => {
  cartItemId = itemId
  const itemOfCart = cartItems.find((item) => item._doc.item_no === Number(itemId));
  console.log(itemOfCart)
  newQuantityInput.value = itemOfCart ? itemOfCart._doc.quantity : 1;
  specialInfoInput.value = itemOfCart ? itemOfCart._doc.sp_info == "none" ? "" : itemOfCart._doc.sp_info : "";
  quantityAddModal.show();
  newQuantityInput.focus();
}

function closeModal() {
  quantityAddModal.hide();
  customerInfoModal.hide();
}


const specialInfo = document.getElementById("specialInfo");
const spInfoDatalist = document.getElementById("specialInfoSuggestions");

specialInfo.addEventListener("input", (event) => {
  const inputText = event.target.value.trim().toLowerCase();
  renderFilteredSuggestions(inputText);
});

function printCancelKot(locationName,tableNo,cancelItem) {
  const todaysDate = document.getElementById("todaysDate").textContent;
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const KOtContent = {
    table_no: tableNo,
    date: todaysDate,
    location: locationName,
    loggedInUser: loggedInUser,
    cancelItem,
    printer_ip: localStorage.getItem("printerSetting")
  }


  ipcRenderer.send("print-cancel-kot", KOtContent);
 
}


function renderFilteredSuggestions(inputText) {
  // Clear previous options
  spInfoDatalist.innerHTML = "";

  spInfList.forEach(spInf => {
    const spInfText = spInf._doc.sp_info.toLowerCase();
    if (spInfText.includes(inputText)) {
      const option = document.createElement("option");
      option.value = spInf._doc.sp_info;
      spInfoDatalist.appendChild(option);
    }
  });
}


ipcRenderer.send("fetch-cartItems", tableNo, locationName);


ipcRenderer.on("cartItems-data", (event, receivedCartItems) => {
  cartItems = receivedCartItems;
  updateCartUI();
});

document.getElementById("add-quantity-btn").addEventListener("click", () => {
  const getNewQty = parseInt(document.getElementById("newQuantity").value);
  const specialInfo = document.getElementById("specialInfo").value;
  try {
    if (getNewQty > 0) {
      let toUpdateData = {
        tableNo: tableNo,
        locationName: locationName,
        itemId: cartItemId,
        newQuantity: getNewQty,
        specialInfo: specialInfo || "none",
      };
      ipcRenderer.send("add-new-quantity", toUpdateData);
      location.reload();
    }
  } catch (error) {
    console.log(error);
    location.reload();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const productData = JSON.parse(localStorage.getItem("products"));
  const locationData = JSON.parse(localStorage.getItem("locations"));

  if (productData && locationData) {
    Locations = locationData;
    apiProduct = productData;
    populateProducts(apiProduct, locationName);
    populateCateogories(apiCategory);
  }
})
