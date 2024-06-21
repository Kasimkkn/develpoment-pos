const { default: Swal } = require("sweetalert2");
const urlParams = new URLSearchParams(window.location.search);
let locationName;
let tableNo;
let billData = {};
let apiProduct = [];
let cartItems = [];
let Locations = [];

const billNo = urlParams.get("billNo");

ipcRenderer.send("fetch-bill-by-billNo", billNo);
ipcRenderer.on("bill-fetch-error", (event, error) => {
  window.location.href = "index.html";
  console.log(error)
})

ipcRenderer.on("edit-bill-details-data", (event, data) => {
  billData = data;
  console.log(billData)
  document.getElementById("locationName").innerHTML = data.location_name;
  document.getElementById("tableNo").innerHTML = `Table No: ${data.table_no}`;
  tableNo = data.table_no;
  locationName = data.location_name;
  document.getElementById("discountPercUpdate").value = data.discount_perc;
  document.getElementById("discountAmountUpdate").value = data.discount_rupees;
  cartItems = billData.item_details;
  updateCartUI();
  populateProducts(apiProduct, locationName);
})

const userPref = JSON.parse(localStorage.getItem("userPreferences"));
const userCurrency = userPref ? userPref._doc.currency_name : "₹";

const updateCartUI = () => {
  const cartElement = document.getElementById("cart");
  cartElement.innerHTML = "";
  cartItems.forEach((item) => {
    const sp_info = item.sp_info ? item.sp_info : "none";
    const itemElement = document.createElement("div");
    itemElement.classList = "flex items-center justify-between py-2 px-3 rounded-lg";
    if (item.is_printed) {
      itemElement.classList.add("bg-secondary");
    }
    else {
      itemElement.classList.add("bg-white");
    }
    itemElement.innerHTML = `
    <input type="hidden" value="${item.item_no}" id="itemNo"/>
    <div class="flex items-center justify-center p-2">
          <span class="w-14 h-14 border beautyBtn rounded-full flex items-center justify-center" style="border:2px solid var(--common-color)">
            <p class="text-2xl">${item.item_no}</p>
          </span>
        </div>
    <div class="flex flex-col gap-2 items-start w-40 max-lg:w-32">
      <div class="flex gap-1 justify-between items-center text-sm">
      <p class="text-sm flex gap-2">${item.item_name.split(" ").slice(0, 2).join(" ")}</p>
      ${sp_info !== "none" ? `(${sp_info})` : ``}
      </div>
      <div class="text-xs flex gap-2 items-center">
      <button class="text-lg text-white rounded-md beautyBtn w-8 h-8" onclick="handleIncrement('${item.item_no}','${item.price}', event)">+</button>
      ${item.quantity} 
      <button class="text-lg text-white rounded-md beautyBtn w-8 h-8" onclick="handleDecrement(${item.item_no}, event)">-</button>
      
      </div>
    </div>
    <div class="flex flex-col gap-2 justify-center items-center">
      <p class="text-xs">${(item.price * item.quantity).toFixed(2)}</p>
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" id="delete" class="hover:cursor-pointer"
      onclick='removeItemFromCart("${locationName}", "${tableNo}", ${JSON.stringify(item)})'>
      <path d="M24.2,12.193,23.8,24.3a3.988,3.988,0,0,1-4,3.857H12.2a3.988,3.988,0,0,1-4-3.853L7.8,12.193a1,1,0,0,1,2-.066l.4,12.11a2,2,0,0,0,2,1.923h7.6a2,2,0,0,0,2-1.927l.4-12.106a1,1,0,0,1,2,.066Zm1.323-4.029a1,1,0,0,1-1,1H7.478a1,1,0,0,1,0-2h3.1a1.276,1.276,0,0,0,1.273-1.148,2.991,2.991,0,0,1,2.984-2.694h2.33a2.991,2.991,0,0,1,2.984,2.694,1.276,1.276,0,0,0,1.273,1.148h3.1A1,1,0,0,1,25.522,8.164Zm-11.936-1h4.828a3.3,3.3,0,0,1-.255-.944,1,1,0,0,0-.994-.9h-2.33a1,1,0,0,0-.994.9A3.3,3.3,0,0,1,13.586,7.164Zm1.007,15.151V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Zm4.814,0V13.8a1,1,0,0,0-2,0v8.519a1,1,0,0,0,2,0Z"></path>
      </svg>
    </div>
    <input type="hidden" value="${item.sp_info}" />
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
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  let discountAmount = 0;
  let netAmount = totalAmount;

  if (billData.discount_perc > 0) {
    discountAmount = totalAmount * (billData.discount_perc / 100);
    netAmount -= discountAmount;
  }
  else if (billData.discount_rupees > 0) {
    discountAmount = billData.discount_rupees;
    netAmount -= discountAmount;
  }
  // if (billData.discount_perc && billData.discount_perc > 0) {
  //   discountAmount = totalAmount * (billData.discount_perc / 100);
  //   netAmount -= discountAmount;
  // }

  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));
  let userGst;
  if (userPreferences._doc.is_gstAvailable && userTaxPercentage > 0) {
    userGst = userPreferences._doc.gst_percentage;
  }
  else if (userPreferences._doc.is_ValueAddedTaxAvailable && userPreferences._doc.vat_percentage > 0) {
    userGst = userPreferences._doc.vat_percentage;
  }

  const totalTaxAmount = netAmount * ((userGst > 0 ? userGst : 0) / 100);
  netAmount += totalTaxAmount;

  if (discountAmount > 0) {
    document.getElementById("disc-amount").textContent = `${userCurrency} ${discountAmount.toFixed(2)}`;
  } else {
    document.getElementById("disc-amount").textContent = `${userCurrency} 0.00`;
  }

  document.getElementById("total-items").textContent = `Total (${totalItems} Items)`;
  document.getElementById("total-amount").textContent = `${userCurrency} ${totalAmount.toFixed(2)}`;
  document.getElementById("tax-amount").textContent = `${userCurrency} ${totalTaxAmount.toFixed(2)}`;
  document.getElementById("net-amount").textContent = `${userCurrency} ${netAmount.toFixed(2)}`;
};

const addNewItemToCart = (product, price) => {

  const newItem = {
    tableNo: tableNo,
    locationName: locationName,
    id: product._doc.item_no,
    name: product._doc.item_name,
    image: product._doc.item_image,
    price: price || product._doc.common_hall,
    quantity: 1,
    bill_no: billNo,
  };

  ipcRenderer.send("edit-bills-add-new-Item", newItem);
};

const removeItemFromCart = (productId, locationName, tableNo, billNo) => {
  try {
    if (cartItems.length == 1) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Cannot remove last item from cart',
        timer: 1000
      })
    }
    else {
      ipcRenderer.send(
        "delete-whole-billItem",
        productId,
        locationName,
        tableNo,
        billNo
      );
      location.reload(true);
      updateCartUI();
    }
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
    addNewItemToCart(product, price);
  } else {
    console.error(`Element with ID 'quantity-${productId}' not found.`);
  }
};


const handleDecrement = (productId, event) => {
  event.preventDefault();
  const product = cartItems.find(
    (item) => item.item_no === productId
  )
  if (product) {
    if (product.quantity == 0) {
      removeItemFromCart(locationName, tableNo, product);
      return
    }
    const toUpdateData = {
      tableNo: tableNo,
      locationName: locationName,
      itemId: productId,
      newQuantity: product.quantity === 1 ? 0 : product.quantity - 1,
      bill_no: billNo
    };
    ipcRenderer.send("update-bill-quantity", toUpdateData);
    updateCartUI();
  }
};

const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiProduct.filter((product) =>
    product._doc.item_name.toLowerCase().includes(searchText)
  );
  populateProducts(filteredProducts);
});


const getCartItemQuantity = (itemNo) => {
  const cartItem = cartItems.find((item) => item.item_no === itemNo);
  return cartItem ? cartItem.quantity : 0;
};

const populateProducts = (products, locationName) => {

  const productList = document.getElementById("search-product-list");
  productList.innerHTML = "";

  products.forEach((product) => {
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
    const productElement = document.createElement("div");
    productElement.classList.add("product", "bg-white", "shadow-md", "rounded-xl");
    productElement.style.width = "9rem";
    productElement.innerHTML = `
     <div class="flex items-center justify-between px-2 py-2 gap-2">
          <span class="w-16 h-16 border beautyBtn rounded-full flex items-center justify-center" style="border:2px solid var(--common-color)">
            <p class="text-xl">${product._doc.item_no}</p>
            </span>
            <div class="flex flex-col gap-1 w-full">
                        <p class="text-sm font-bold " style="text-transform: capitalize;">
            ${product._doc.item_name.split(" ").slice(0, 2).join(" ")}</p> 
            <p class="text-sm font-extralight">${userCurrency}${price}</p>
            </div>
          </div>
    `;
    productElement.addEventListener('click', (event) => {
      handleIncrement(product._doc.item_no, price, event);
    })
    productList.appendChild(productElement);
  });
};

function printBill(whichBtn, billData) {
  console.log("clicke by", whichBtn)
  const bill_no = billNo;
  const billInfoStr = JSON.parse(localStorage.getItem("billInfo"));
  const table_no = billData.table_no
  let customerName = billData.customer_name ? billData.customer_name : "None";
  let customerGSTNo = billData.GST_no ? billData.GST_no : "None";
  let todaysDate = String(billData.created_at).split("T")[0];
  let discountPerc = billData.discount_perc ? billData.discount_perc : 0;
  let discountMoney = billData.discount_rupees ? billData.discount_rupees : 0;
  let userTaxPercentage = 0;

  if (userPref._doc.is_gstAvailable) {
    userTaxPercentage = userPref._doc.gst_percentage / 100;
  }
  else if (userPref._doc.is_ValueAddedTaxAvailable) {
    userTaxPercentage = userPref._doc.vat_percentage / 100;
  }

  let sgstAmount = 0;
  let cgstAmount = 0;
  let vat_Amount = 0;

  if (userPref._doc.is_gstAvailable && userTaxPercentage > 0) {
    sgstAmount = userTaxPercentage / 2 * 100;
    cgstAmount = userTaxPercentage / 2 * 100;
  } else if (userPref._doc.is_ValueAddedTaxAvailable && userPref._doc.vat_percentage > 0) {
    vat_Amount = userTaxPercentage;
  }


  let totalAmount = 0;
  let itemDetails = [];

  billData.item_details.forEach((item) => {
    const productNo = item.item_no;
    const productName = item.item_name;
    const sp_info = item.sp_info ? item.sp_info : "none";
    const quantity = item.quantity;
    const price = item.price;
    const totalAmountofItem = quantity * price;
    totalAmount += totalAmountofItem;
    itemDetails.push({
      item_no: productNo,
      item_name: productName,
      sp_info: sp_info,
      quantity: quantity,
      price: price,
      totalAmount: quantity * price
    })

  });


  let discountAmount = 0;
  if (discountPerc > 0) {
    discountAmount = (discountPerc / 100) * totalAmount;
  }
  if (discountMoney > 0) {
    discountAmount = discountMoney;
  }

  let netAmountWithDiscount = totalAmount - discountAmount;
  let totalTaxAmount = 0;

  if (sgstAmount > 0 || cgstAmount > 0) {
    const gstAmount = netAmountWithDiscount * (userTaxPercentage / 100);
    totalTaxAmount = gstAmount;
    netAmountWithDiscount += gstAmount;
  } else if (vat_Amount > 0) {
    const vatAmount = netAmountWithDiscount * vat_Amount;
    totalTaxAmount = vatAmount;
    netAmountWithDiscount += vatAmount;
  }

  const roundedNetAmount = Math.round(netAmountWithDiscount);
  const decimalPart = Number(String(netAmountWithDiscount.toFixed(2)).split(".")[1]);

  let roundOffValue;
  if (decimalPart < 50) {
    roundOffValue = `-0.${(100 - decimalPart)}`;
  }
  else {
    roundOffValue = `0.${decimalPart}`;
  }

  if (roundOffValue === '-0.100' || roundOffValue === '0.100') {
    roundOffValue = '0.00';
  }

  console.log(netAmountWithDiscount, roundOffValue, totalAmount)
  let updatedbillData = {
    bill_no: billData.bill_no,
    item_details: billData.item_details,
    final_amount: Math.round(netAmountWithDiscount),
    total_amount: totalAmount.toFixed(2),
    round_off: roundOffValue,
  }


  if (whichBtn == 1) {
    console.log("clicked by 1", whichBtn)
    try {
      ipcRenderer.send("print-duplicate-bill", billInfoStr, itemDetails, todaysDate, customerName, customerGSTNo, bill_no, table_no, totalAmount, discountPerc, discountMoney, discountAmount, cgstAmount, sgstAmount, vat_Amount, roundOffValue, roundedNetAmount, totalTaxAmount);
    }
    catch (err) {
      console.log(err)
    }
  }
  if (whichBtn == 2) {
    console.log("clicke by 2", whichBtn)
    try {
      ipcRenderer.send("updated-bill-info", updatedbillData);
      ipcRenderer.send("fetch-bill-by-billNo", billNo);
      ipcRenderer.send("deduct-qty", itemDetails);
    }
    catch (err) {
      console.log(err)
    }
  }
}

const dublicateBillBtn = document.getElementById("duplicate-bill-btn");
dublicateBillBtn.addEventListener("click", () => {
  printBill(1, billData)
})


const saveBillBtn = document.getElementById("save-bill-btn")
saveBillBtn.addEventListener("click", () => {
  printBill(2, billData)
})

const updateDiscountBtn = document.getElementById("updateDiscountBtn");
updateDiscountBtn.addEventListener("click", () => {
  const userPreferences = JSON.parse(localStorage.getItem("userPreferences"));
  const discountPerc = document.getElementById("discountPercUpdate").value;
  const discountRupees = document.getElementById("discountAmountUpdate").value;
  const tax_perc = userPreferences._doc.is_gstAvailable ? userPreferences._doc.gst_percentage : 0;
  const vat_tax = userPreferences._doc.is_vatAvailable ? userPreferences._doc.vat_percentage : 0;

  if (discountPerc > 0) {
    ipcRenderer.send("update-bill-discount", billNo, discountPerc, tax_perc, vat_tax);
  }
  if (discountRupees > 0) {
    ipcRenderer.send("update-bill-discount-rupee", billNo, discountRupees, tax_perc);
  }
  if (tax_perc > 0) {
    ipcRenderer.send("update-bill-discount", billNo, discountPerc, tax_perc, vat_tax);
  }
  if (vat_tax > 0) {
    ipcRenderer.send("update-bill-discount-vat", billNo, discountPerc, vat_tax);
  }
  ipcRenderer.send("fetch-bill-by-billNo", billNo);
})


document.addEventListener("DOMContentLoaded", () => {
  const productData = JSON.parse(localStorage.getItem("products"));
  const locationData = JSON.parse(localStorage.getItem("locations"));

  if (productData && locationData) {
    apiProduct = productData;
    Locations = locationData;
    populateProducts(apiProduct, locationName);
  }
})

