import { config } from "dotenv"
import { app, BrowserWindow, dialog, globalShortcut, ipcMain, screen } from "electron";
import { connectDB } from "./src/config/dbConfig.js";
import { connectToCloudDB } from "./src/config/dbConfig.js";
import isOnline from 'is-online'
import { syncData } from './sync.js'
import Category from "./src/models/categorySchema.js";
import Item from "./src/models/ItemSchema.js";
import Location from "./src/models/locationSchema.js";
import User from "./src/models/userSchema.js";
import LocationInfo from "./src/models/locationInfoSchema.js";
import ExistingCartItem from "./src/models/existingCartItemSchema.js";
import Bill from "./src/models/billSchema.js";
import BillBook from "./src/models/billBookSchema.js";
import Preference from "./src/models/preferenceSchema.js";
import Transaction from "./src/models/transactionSchema.js";
import SpInfo from "./src/models/spInfoSchema.js";
import RejectedItem from "./src/models/rejectedItemSchema.js";
import BillInfo from "./src/models/billInfoSchema.js";
import Loyalty from "./src/models/loyaltySchema.js";
import Stock from "./src/models/stockSchema.js";
import Receipe from "./src/models/receipeSchema.js";
import Purchase from "./src/models/purchaseSchema.js";
import UserRights from "./src/models/userRightsSchema.js";
import events from 'events'
events.EventEmitter.defaultMaxListeners = 100;
import { ThermalPrinter, PrinterTypes } from 'node-thermal-printer'

config({
  path: ".env",
})


async function createWindow() {
  const mainScreen = screen.getPrimaryDisplay();
  const dimensions = mainScreen.size;

  const win = new BrowserWindow({
    width: dimensions.width,
    height: dimensions.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.setMenuBarVisibility(false);

  win.loadFile('src/login.html');

  // const url = process.env.MONGO_URI;
  await connectDB("mongodb://localhost:27017/pos-restuarant")
  globalShortcut.register('Esc', () => {
    win.webContents.send('focus-input');
  });
  globalShortcut.register('F1', () => {
    win.webContents.send('print-bill');
  });
  globalShortcut.register('F2', () => {
    win.webContents.send('print-kot');
  });
  globalShortcut.register('F3', () => {
    win.webContents.send('open-customer-modal');
  });
}

ipcMain.on('print-bill-data', async (event, billInfoStr, productsInfo, todaysDate, customerName, customerGSTNo, bill_no, table_no, totalAmount, discountPerc, discountMoney, discountAmount, cgstAmount, sgstAmount, vat_Amount, roundOffValue, roundedNetAmount, totalTaxAmount) => {
  try {
    // Extract bill details
    const restaurantName = billInfoStr._doc.resturant_name.toUpperCase();
    const customerMobile = billInfoStr._doc.customer_mobile;
    const gstinNo = billInfoStr._doc.GSTIN_no.toUpperCase();
    const fssaiCode = billInfoStr._doc.FSSAI_code.toUpperCase();
    const billFooter = billInfoStr._doc.bill_footer.toUpperCase();

    // Format the date
    const formattedDate = new Date(todaysDate).toLocaleDateString("en-GB");

    // Initialize the printer
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.0.87:9100',
      timeout: 5000,
    });

    // Begin printing the bill
    printer.alignCenter();
    printer.setTextDoubleHeight();
    printer.println(restaurantName);
    printer.setTextNormal();
    printer.println(`MS ALI ROAD, GRANT ROAD EAST, MUMBAI`);
    printer.println(`Ph. : ${customerMobile}`);
    printer.println(`GSTIN: ${gstinNo}`);
    printer.println(`FSSAI: ${fssaiCode}`);
    printer.drawLine();

    printer.alignLeft();
    printer.println(`Date: ${formattedDate}`);
    if (customerName) printer.println(`Bill To: ${customerName}`);
    if (customerGSTNo) printer.println(`GST: ${customerGSTNo}`);

    printer.println(`Bill-No: ${bill_no}  T.No: ${table_no}`);
    printer.drawLine();

    printer.tableCustom([
      { text: 'Item', align: 'LEFT', width: 0.5 },
      { text: 'Qty', align: 'CENTER', width: 0.15 },
      { text: 'Rate', align: 'CENTER', width: 0.15 },
      { text: 'Amt', align: 'RIGHT', width: 0.15 },
    ]);

    printer.drawLine();

    // Loop through productsInfo array to print each product
    productsInfo.forEach(product => {
      printer.tableCustom([
        { text: product.item_name, align: 'LEFT', width: 0.5 },
        { text: product.quantity, align: 'CENTER', width: 0.15 },
        { text: product.price, align: 'CENTER', width: 0.15 },
        { text: product.totalAmount, align: 'RIGHT', width: 0.15 },
      ]);
    });

    printer.drawLine();

    printer.tableCustom([
      { text: 'Total:', align: 'RIGHT', width: 0.75 },
      { text: totalAmount.toFixed(2), align: 'RIGHT', width: 0.25 },
    ]);

    if (discountPerc !== 0 || (discountMoney !== 0 && discountAmount > 0)) {
      printer.tableCustom([
        { text: `Discount ${discountPerc ? discountPerc + "%" : ""}:`, align: 'RIGHT', width: 0.75 },
        { text: Number(discountAmount).toFixed(2), align: 'RIGHT', width: 0.25 },
      ]);
    }

    if (cgstAmount > 0) {
      printer.tableCustom([
        { text: `CGST ${cgstAmount}%:`, align: 'RIGHT', width: 0.75 },
        { text: (totalTaxAmount / 2).toFixed(2), align: 'RIGHT', width: 0.25 },
      ]);
    }

    if (sgstAmount > 0) {
      printer.tableCustom([
        { text: `SGST ${sgstAmount}%:`, align: 'RIGHT', width: 0.75 },
        { text: (totalTaxAmount / 2).toFixed(2), align: 'RIGHT', width: 0.25 },
      ]);
    }

    if (vat_Amount > 0) {
      printer.tableCustom([
        { text: `VAT ${vat_Amount}%:`, align: 'RIGHT', width: 0.75 },
        { text: totalTaxAmount, align: 'RIGHT', width: 0.25 },
      ]);
    }

    printer.tableCustom([
      { text: 'Round Off:', align: 'RIGHT', width: 0.75 },
      { text: roundOffValue, align: 'RIGHT', width: 0.25 },
    ]);

    printer.tableCustom([
      { text: 'Net:', align: 'RIGHT', width: 0.75, style: 'B' },
      { text: roundedNetAmount, align: 'RIGHT', width: 0.25, style: 'B' },
    ]);

    printer.drawLine();
    printer.alignCenter();
    printer.println(billFooter);
    printer.cut();

    if (await printer.isPrinterConnected()) {
      await printer.execute();
      console.log("Bill printed successfully");
    }
    else {
      console.log("Printer not connected");
    }

    event.reply('bill-saved');
  } catch (error) {
    console.error('Error printing bill:', error);
  }
});

ipcMain.on('print-kot-data', async (event, kotContent) => {
  const { table_no, location_name, loggedInUser, todaysDate, currentItemsMap, currentItemsWithSPInfo } = kotContent;

  try {
    // Initialize the printer
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.0.87:9100',
      timeout: 5000,
    });

    // Format the date
    const formattedDate = new Date(todaysDate).toLocaleDateString("en-GB");

    // Print header
    printer.alignLeft();
    printer.setTextDoubleHeight();
    printer.println(`T.No: ${table_no}`);
    printer.setTextNormal();
    printer.println(`${location_name}`);
    printer.println(`${loggedInUser._doc.first_name} ${loggedInUser._doc.last_name}`);
    printer.println(formattedDate);
    printer.drawLine();

    // Print column headers
    printer.tableCustom([
      { text: 'QTY', align: 'LEFT', width: 0.3, },
      { text: 'ITEM', align: 'LEFT', width: 0.7, },
    ]);
    printer.drawLine();

    // Loop through currentItemsMap to print each product
    Object.keys(currentItemsMap).forEach((productName) => {
      const currentQuantity = currentItemsMap[productName].quantity;
      printer.tableCustom([
        { text: currentQuantity.toString(), align: 'LEFT', width: 0.3, bold: true, },
        { text: productName.toLowerCase(), align: 'LEFT', width: 0.7, bold: true, },
      ]);
    });

    Object.keys(currentItemsWithSPInfo).forEach((productName) => {
      const currentQuantity = currentItemsWithSPInfo[productName].quantity;
      const sp_info = currentItemsWithSPInfo[productName].sp_info;
      printer.tableCustom([
        { text: currentQuantity.toString(), align: 'LEFT', width: 0.3, bold: true, },
        { text: `${productName.toLowerCase()} (${sp_info})`, align: 'LEFT', width: 0.7, bold: true, },
      ]);
    });
    printer.println('End of KOT');

    printer.cut();
    if (await printer.isPrinterConnected()) {
      await printer.execute();
      console.log("Kot printed successfully");
    }
    else {
      console.log("Printer not connected");
    }

    event.reply('bill-saved');
  } catch (error) {
    console.error('Error printing KOT:', error);
  }
});

ipcMain.on('print-cancel-kot', async (event, kotContent) => {
  const { table_no, location, loggedInUser, date, cancelItem } = kotContent;

  try {
    // Initialize the printer
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: 'tcp://192.168.0.87:9100',
      timeout: 5000,
    });

    // Format the date
    const formattedDate = new Date(date).toLocaleDateString("en-GB");

    // Print header
    printer.alignLeft();
    printer.println(`T.No: ${table_no}`);
    printer.setTextNormal();
    printer.println(`${location}`);
    printer.println(`${loggedInUser._doc.first_name} ${loggedInUser._doc.last_name}`);
    printer.println(formattedDate);
    printer.println('Cancel Items');
    printer.drawLine();
    printer.tableCustom([
      { text: 'QTY', align: 'LEFT', width: 0.3, style: 'B' },
      { text: 'ITEM', align: 'LEFT', width: 0.7, style: 'B' },
    ]);
    printer.drawLine();

    // Print cancelled item
    printer.tableCustom([
      { text: cancelItem.quantity.toString(), align: 'LEFT', width: 0.3 },
      { text: cancelItem.item_name.toLowerCase(), align: 'LEFT', width: 0.7 },
    ]);
    // Execute the print

    printer.cut();
    if (await printer.isPrinterConnected()) {
      await printer.execute();
      console.log("Cancel KOT printed successfully");
    }
    else {
      console.log("Printer not connected");
    }

    event.reply('bill-saved');
  } catch (error) {
    console.error('Error printing cancel KOT:', error);
  }
});
// 
ipcMain.on('create-only-first-user' , async (event) => {
  try {
    const getUsers = await User.find();
    if(getUsers.length == 0){
    const user = new User({
      user_no: 1,
      user_id: "admin@123",
      password: "admin@123",
      first_name: "admin",
      last_name: "new",
      address: "somewhere  on earth",
      mobile_no: 1112223334,
      GST_no: "29AE932UD9892JC02",
      tax_perc: 5,
      creation_date: Date.now(),
      user_role: "admin",
      status: true,
      __v: 0
    });
    user.save().then(() => {
      const userRight = new UserRights({
        user_no: 1,
        first_name: "admin",
        master_option: true,
        edit_bills: true,
        reports: true,
        item_wise_report: true,
        category_wise_report: true,
        item_wise_monthly_report: true,
        table_wise_report: true,
        unpaid_bills: true,
        payment_wise_report: true,
        location_wise_report: true,
        daily_sales: true,
        monthly_sales: true,
        stocks: true,
        stock_details: true,
        purchase_details: true,
        receipe_details: true,
        is_synced: true,
      })
      userRight.save().then(() => {
        console.log("User created successfully");
      }).catch((error) => {
        console.error("Error creating user right:", error);
      })
    }).catch((error) => {
      console.error("Error creating user:", error);
    })    
  }
  } catch (error) {
    console.error("Error creating user:", error);
  }
})
// check login user
ipcMain.on("login", async (event, userId, password) => {
  try {
    const user = await User.findOne({ user_id: userId, password: password });
    if (user) {
      event.reply("login-success", user);
      return;
    } else {
      event.reply("login-error", "Invalid username or password");
      return;
    }
  } catch (error) {
    console.error("Error logging in:", error);
    event.reply("login-error", "Error logging in" + error);
  }
});

// fetch location and tables
ipcMain.on("fetch-location-and-tables", async (event) => {
  try {
    const tableData = await LocationInfo.find({});
    const locationData = await Location.find({});
    event.reply("location-and-tables-data", locationData, tableData);
  } catch (error) {
    console.error("Error fetching location and tables:", error);
    event.reply("fetch-error", "Error fetching location and tables");
  }
});

// fetch products
ipcMain.on("fetch-products", async (event) => {
  try {
    const data = await Item.find().sort({ item_no: 1 });
    event.reply("products-data", data);
  } catch (error) {
    console.error("Error fetching products:", error);
    event.reply("fetch-error", "Error fetching products");
  }
});

// fetch categories
ipcMain.on("fetch-categories", async (event) => {
  try {
    const data = await Category.find({}).sort({ category_no: 1 });
    event.reply("categories-data", data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    event.reply("fetch-error", "Error fetching categories");
  }
});

// fetch location
ipcMain.on("fetch-location", async (event) => {
  try {
    const data = await Location.find({});
    event.reply("location-data", data);
  } catch (error) {
    console.error("Error fetching location:", error);
    event.reply("fetch-error", "Error fetching location");
  }
});

// fetch table or location info
ipcMain.on("fetch-table", async (event) => {
  try {
    const data = await LocationInfo.find({});
    event.reply("table-data", data);
  } catch (error) {
    console.log("error fetching table", error);
    event.reply("fetch-error", "Error fetching table");
  }
});

// fetch users
ipcMain.on("fetch-user", async (event) => {
  try {
    const data = await User.find({});
    event.reply("user-data", data);
  } catch (error) {
    console.error("Error fetching users:", error);
    event.reply("fetch-error", "Error fetching users");
  }
});

// fethc fetch-loyalty
ipcMain.on("fetch-loyalty", async (event) => {
  try {
    const data = await Loyalty.find({});
    event.reply("loyalty-data", data);
  } catch (error) {
    console.error("Error fetching loyalty:", error);
    event.reply("fetch-error", "Error fetching loyalty");
  }
});

// fetch Kot
ipcMain.on("fetch-kot", async (event) => {
  try {
    const data = await KOTBook.find();
    event.reply("kot-data", data);
  } catch (error) {
    console.error("Error fetching kot:", error);
    event.reply("fetch-error", "Error fetching kot");
  }
})

// fetch existing cart items
ipcMain.on("fetch-existing-cartItems", async (event) => {
  try {
    const data = await ExistingCartItem.find();
    event.reply("existing-cartItems-data", data);
  } catch (error) {
    console.error("Error fetching existing cartItems:", error);
    event.reply("fetch-error", "Error fetching existing cartItems");
  }
});

// fetch cartItems based on tableNo and location
ipcMain.on("fetch-cartItems", async (event, tableNo, locationName) => {
  try {
    const data = await ExistingCartItem.find({
      table_no: tableNo,
      location_name: locationName,
    });

    event.reply("cartItems-data", data);
  } catch (error) {
    console.error("Error fetching cartItems:", error);
    event.reply("fetch-error", "Error fetching cartItems");
  }
});

// add cart items
ipcMain.on("add-cartItem", async (event, newItem) => {
  try {
    const existingItem = await ExistingCartItem.findOne({
      table_no: newItem.tableNo,
      location_name: newItem.locationName,
      item_no: newItem.id,
    });

    if (existingItem) {
      if (!existingItem.is_printed) {
        existingItem.quantity += newItem.quantity;
        await existingItem.save();
      } else {
        const anotherItem = await ExistingCartItem.findOne({
          table_no: newItem.tableNo,
          location_name: newItem.locationName,
          item_no: newItem.id,
          is_printed: false,
        });

        if (anotherItem) {
          anotherItem.quantity += newItem.quantity;
          await anotherItem.save();
        } else {
          const cartItem = new ExistingCartItem({
            table_no: newItem.tableNo,
            location_name: newItem.locationName,
            item_no: newItem.id,
            item_name: newItem.name,
            item_image: newItem.image,
            quantity: newItem.quantity,
            price: newItem.price,
            is_printed: false,
          });
          await cartItem.save();
        }
      }
    } else {
      const cartItem = new ExistingCartItem({
        table_no: newItem.tableNo,
        location_name: newItem.locationName,
        item_no: newItem.id,
        item_name: newItem.name,
        item_image: newItem.image,
        quantity: newItem.quantity,
        price: newItem.price,
        is_printed: false,
      });
      await cartItem.save();
    }

    const updatedCartItems = await ExistingCartItem.find({
      table_no: newItem.tableNo,
      location_name: newItem.locationName,
    });
    const allCartItems = await ExistingCartItem.find();

    event.reply("cartItems-data", updatedCartItems);
    event.reply("existing-cartItems-data", allCartItems);

  } catch (error) {
    console.error("Error adding cart item:", error);
    event.reply("add-error", "Error adding cart item");
  }
});

// edit bills add new item
ipcMain.on("edit-bills-add-new-Item", async (event, newItem) => {
  try {
    const existingBill = await Bill.findOne({
      table_no: newItem.tableNo,
      location_name: newItem.locationName,
      bill_no: newItem.bill_no
    });

    if (!existingBill) {
      console.error(`Bill not found for Table No '${newItem.tableNo}', Location '${newItem.locationName}', and Bill No '${newItem.bill_no}'.`);
      event.reply("add-error", "Bill not found");
      return;
    }

    const existingItem = existingBill.item_details.find(item => item.item_no === Number(newItem.id));

    if (existingItem) {
      existingItem.quantity += 1;

    } else {
      existingBill.item_details.push({
        item_no: Number(newItem.id),
        item_name: newItem.name,
        item_image: newItem.image,
        quantity: 1,
        price: newItem.price,
      });
    }

    // Recalculate total amount
    let totalAmount = 0;
    existingBill.item_details.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Apply discount if applicable
    const discountAmount = existingBill.discount_perc > 0 ? totalAmount * (existingBill.discount_perc / 100) : 0;
    const discountedAmount = totalAmount - discountAmount;

    // Recalculate taxes
    const userPreferences = await Preference.findOne({});
    const taxPerc = userPreferences ? userPreferences.gst_percentage : userPreferences.vat_percentage;
    const totalTaxRate = taxPerc / 100;
    const totalTaxAmount = discountedAmount * totalTaxRate;

    // Recalculate final amount
    existingBill.final_amount = discountedAmount + totalTaxAmount;
    existingBill.total_amount = totalAmount;
    existingBill.cgst_tax = totalTaxAmount / 2;
    existingBill.sgst_tax = totalTaxAmount / 2;
    existingBill.total_tax = totalTaxAmount;

    // Round-off logic
    const finalAmount = existingBill.final_amount.toFixed(2);
    const decimalPart = Number(String(finalAmount).split(".")[1]) || 0;

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    existingBill.round_off = roundOffValue
    existingBill.updated_at = Date.now();
    existingBill.is_synced = false;
    await existingBill.save();

    const serializedData = JSON.parse(JSON.stringify(existingBill));
    event.reply("edit-bill-details-data", serializedData);
  } catch (error) {
    console.error("Error adding cart item:", error);
    event.reply("add-error", "Error adding cart item");
  }
});

// update cart items
ipcMain.on("update-cartItem-quantity", async (event, toUpdateData) => {

  try {
    const { tableNo, locationName, itemId, newQuantity } = toUpdateData;
    console.log(newQuantity);

    const existingItem = await ExistingCartItem.findOne({
      table_no: tableNo,
      location_name: locationName,
      item_no: itemId,
    });
    if (newQuantity === 0) {
      await existingItem.deleteOne();
      const updatedCartItems = await ExistingCartItem.find({
        table_no: tableNo,
        location_name: locationName,
      });
      event.reply("cartItems-data", updatedCartItems);
      return
    }

    if (!existingItem) {
      console.error(
        `Cart item not found for Table No '${tableNo}', Location '${locationName}', and itemId '${itemId}'.`
      );
      event.reply("update-cartItem-quantity-error", "Cart item not found");
      return;
    }

    if (existingItem.quantity !== 0 && newQuantity !== 0) {
      existingItem.quantity = newQuantity;
      await existingItem.save();
    }
    const updatedCartItems = await ExistingCartItem.find({
      table_no: tableNo,
      location_name: locationName,
    });
    event.reply("cartItems-data", updatedCartItems);
  } catch (error) {
    console.error(`Error updating cart item quantity:`, error);
    event.reply(
      "update-cartItem-quantity-error",
      "Error updating cart item quantity"
    );
  }
});

// update bill quantity
ipcMain.on("update-bill-quantity", async (event, toUpdateData) => {
  try {
    const { tableNo, locationName, itemId, newQuantity, bill_no } = toUpdateData;

    const existingBill = await Bill.findOne({
      table_no: tableNo,
      location_name: locationName,
      bill_no: bill_no,
    });

    if (!existingBill) {
      console.error(`Bill item not found for Table No '${tableNo}', Location '${locationName}', and Item ID '${itemId}'.`);
      event.reply("update-bill-quantity-error", "Item not found in the bill");
      return;
    }

    const itemIndex = existingBill.item_details.findIndex(item => item.item_no === itemId);

    if (itemIndex === -1) {
      console.error(`Item ID '${itemId}' not found in the bill.`);
      event.reply("update-bill-quantity-error", "Item not found in the bill");
      return;
    }

    if (existingBill.item_details.length === 1) {
      if (existingBill.item_details[0].quantity <= 1) {
        console.log(`Cannot remove the last item`);
        return;
      }
    }

    if (newQuantity <= 0) {
      existingBill.item_details.splice(itemIndex, 1);
    } else {
      existingBill.item_details[itemIndex].quantity = newQuantity;
    }

    // Recalculate total amount
    let totalAmount = 0;
    existingBill.item_details.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Apply discount if applicable
    const discountAmount = existingBill.discount_perc > 0 ? totalAmount * (existingBill.discount_perc / 100) : 0;
    const discountedAmount = totalAmount - discountAmount;

    // Recalculate taxes
    const userPreferences = await Preference.findOne({});
    const taxPerc = userPreferences ? userPreferences.gst_percentage : userPreferences.vat_percentage;
    let totalTaxAmount = 0;
    if (taxPerc > 0 && discountedAmount > 0) {
      totalTaxAmount = discountedAmount * (taxPerc / 100);
    }
    else {
      totalTaxAmount = totalAmount * (taxPerc / 100);
    }

    existingBill.final_amount = discountedAmount + totalTaxAmount;
    existingBill.total_amount = totalAmount;
    existingBill.cgst_tax = totalTaxAmount / 2;
    existingBill.sgst_tax = totalTaxAmount / 2;
    existingBill.total_tax = totalTaxAmount;

    // Round-off logic
    const finalAmount = existingBill.final_amount.toFixed(2);
    const decimalPart = Number(String(finalAmount).split(".")[1]) || 0;

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    existingBill.round_off = roundOffValue
    existingBill.is_synced = false
    await existingBill.save();

    const data = await Bill.findOne({ bill_no: existingBill.bill_no });
    const serializedData = JSON.parse(JSON.stringify(data));
    event.reply("edit-bill-details-data", serializedData);

  } catch (error) {
    console.error(`Error updating cart item quantity:`, error);
    event.reply("update-bill-quantity-error", "Error updating cart item quantity");
  }
});

// add qty to cart item and special info
ipcMain.on("add-new-quantity", async (event, toUpdateData) => {

  try {
    const LocationData = await Location.find();
    const ItemData = await Item.find({});
    const currentLocation = LocationData.find(loc => loc._doc.location_name == toUpdateData.locationName);
    const locationPriceKey = currentLocation ? "rate_" + currentLocation._doc.location_price : "rate_one";

    const product = ItemData.find(item => item._doc.item_no == toUpdateData.itemId);

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
    const cartItem = new ExistingCartItem({
      table_no: toUpdateData.tableNo,
      location_name: toUpdateData.locationName,
      item_no: toUpdateData.itemId,
      item_name: product.item_name,
      item_image: product.item_image,
      price,
      quantity: toUpdateData.newQuantity,
      sp_info: toUpdateData.specialInfo,
      is_printed: false,
    });
    await cartItem.save();
    // }
    const updatedCartItems = await ExistingCartItem.find({
      table_no: toUpdateData.tableNo,
      location_name: toUpdateData.locationName,
    });

    const getSpInfo = await SpInfo.find({
      sp_info: toUpdateData.specialInfo
    })

    if (getSpInfo.length > 0) {
      return event.reply("cartItems-data", updatedCartItems);
    }
    else {
      const spId = await SpInfo.findOne({}, { id: 1 }).sort({ id: -1 });
      let spIdNo = 0;
      if (spId) {
        spIdNo = spId.id;
      }
      const newSpId = spIdNo + 1;
      await SpInfo.create({
        id: newSpId,
        sp_info: toUpdateData.specialInfo
      })
    }

    event.reply("cartItems-data", updatedCartItems);


  } catch (error) {
    console.error("Error adding new quantity:", error);
    event.reply("add-new-quantity-error", error.message || error);
  }
});

// deelte whote cart Items
ipcMain.on("delete-whole-cartItem", async (event, locationName, tableNo, item) => {
  try {

    const parsedItem = JSON.parse(item);
    await ExistingCartItem.deleteOne({
      table_no: tableNo,
      location_name: locationName,
      item_no: parsedItem.item_no,
      quantity: parsedItem.quantity
    });

    if (parsedItem.is_printed) {
      await RejectedItem.create({
        table_no: tableNo,
        location_name: locationName,
        item_details: {
          item_no: parsedItem.item_no,
          quantity: parsedItem.quantity,
          item_name: parsedItem.item_name,
          item_image: parsedItem.item_image,
          price: parsedItem.price,
          sp_info: parsedItem.sp_info,
        },
        date: Date.now(),
        is_printed: parsedItem.is_printed,
      });
    }

    const data = await ExistingCartItem.find({
      table_no: tableNo,
      location_name: locationName,
    });
    event.reply("cartItems-data", data);

  } catch (error) {
    console.error("Error deleting whole cartItem:", error);
    event.reply("delete-whole-cartItem-error", "Error deleting whole cartItem");
  }
});

// delete whote bill Items
ipcMain.on("delete-whole-billItem", async (event, productId, locationName, tableNo, billNo) => {
  try {
    let bill = await Bill.findOne({
      table_no: tableNo,
      location_name: locationName,
      bill_no: billNo
    });

    if (!bill) {
      event.reply("delete-whole-billItem-error", "Bill not found");
      return;
    }

    const itemToRemove = bill.item_details.find(item => item.item_no === Number(productId));

    if (!itemToRemove) {
      event.reply("delete-whole-billItem-error", "Item not found in the bill");
      return;
    }

    // Remove the item
    bill.item_details = bill.item_details.filter(item => item.item_no !== Number(productId));

    // Recalculate total amount
    let totalAmount = 0;
    bill.item_details.forEach(item => {
      totalAmount += item.price * item.quantity;
    });

    // Apply discount if applicable
    const discountAmount = bill.discount_perc > 0 ? totalAmount * (bill.discount_perc / 100) : 0;
    const discountedAmount = totalAmount - discountAmount;

    // Recalculate taxes
    const userPreferences = await Preference.findOne({});
    const taxPerc = userPreferences ? userPreferences.gst_percentage : userPreferences.vat_percentage;
    const totalTaxRate = taxPerc / 100;
    const totalTaxAmount = discountedAmount * totalTaxRate;

    // Recalculate final amount
    bill.final_amount = discountedAmount + totalTaxAmount;
    bill.total_amount = totalAmount;
    bill.cgst_tax = totalTaxAmount / 2;
    bill.sgst_tax = totalTaxAmount / 2;
    bill.total_tax = totalTaxAmount;

    // Round-off logic
    const finalAmount = bill.final_amount.toFixed(2);
    const decimalPart = Number(String(finalAmount).split(".")[1]) || 0;

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    bill.round_off = roundOffValue
    bill.is_synced = false
    await bill.save();

    const serializedData = JSON.parse(JSON.stringify(bill));
    event.reply("delete-whole-billItem-success", serializedData);
  } catch (error) {
    console.error("Error deleting whole bill item:", error);
    event.reply("delete-whole-billItem-error", "Error deleting whole bill item");
  }
});

ipcMain.on("new-item", async (event, itemData) => {
  try {
    const data = await Item.create({
      item_no: itemData.item_no,
      item_name: itemData.itemName,
      item_image: itemData.itemImage,
      rate_one: itemData.rate_one,
      rate_two: itemData.rate_two,
      rate_three: itemData.rate_three,
      rate_four: itemData.rate_four,
      rate_five: itemData.rate_five,
      rate_six: itemData.rate_six,
      tax_perc: itemData.tax_perc,
      category_no: itemData.categoryNo,
      status: itemData.isActive,
    });

    const allData = await Item.find({});
    event.reply("products-data", allData);
  } catch (error) {
    console.error("Error creating new item:", error);
    event.reply("new-item-error", "Error creating new item");
  }
});

// update - item
ipcMain.on("edit-item", async (event, itemId, itemData) => {
  try {
    const data = await Item.updateOne(
      { item_no: Number(itemId) },
      {
        item_name: itemData.itemName,
        item_image: itemData.itemImage,
        rate_one: itemData.rate_one,
        rate_two: itemData.rate_two,
        rate_three: itemData.rate_three,
        rate_four: itemData.rate_four,
        rate_five: itemData.rate_five,
        rate_six: itemData.rate_six,
        category_no: itemData.categoryNo,
        status: itemData.isActive,
        is_synced: false,
      }
    );
    const allData = await Item.find({});
    event.reply("products-data", allData);
  } catch (error) {
    console.error("Error updating item:", error);
    event.reply("edit-item-error", "Error updating item");
  }
});

// new - category
ipcMain.on("new-category", async (event, categoryData) => {
  try {
    const maxCategory = await Category.findOne({}, { category_no: 1 }).sort({
      category_no: -1,
    });
    let maxCategoryNo = 0;
    if (maxCategory) {
      maxCategoryNo = maxCategory.category_no;
    }
    const newCategoryNo = maxCategoryNo + 1;

    const data = await Category.create({
      category_no: newCategoryNo,
      category_name: categoryData.categoryName,
      description: categoryData.description,
      entry_date: new Date(),
      status: categoryData.isActive,
    });
  } catch (error) {
    console.error("Error creating new category:", error);
    event.reply("new-category-error", "Error creating new category");
  }
});

// edit - category
ipcMain.on("edit-category", async (event, categoryId, categoryData) => {
  try {
    const data = await Category.updateOne(
      { category_no: Number(categoryId) },
      {
        category_name: categoryData.categoryName,
        description: categoryData.description,
        status: categoryData.isActive,
        is_synced : false,
      }
    );
    event.reply("edit-category-success", data);
  } catch (error) {
    console.error("Error updating category:", error);
    event.reply("edit-category-error", "Error updating category");
  }
});

// new - location
ipcMain.on("new-location", async (event, locationData) => {
  try {
    const maxLocation = await Location.findOne({}, { location_no: 1 }).sort({
      location_no: -1,
    });
    let maxLocationNo = 0;
    if (maxLocation) {
      maxLocationNo = maxLocation.location_no;
    }
    const newLocationNo = maxLocationNo + 1;
    const data = await Location.create({
      location_no: newLocationNo,
      location_name: locationData.locationName,
      location_price: locationData.rate,
      is_taxable: locationData.taxable,
      status: locationData.isActive,
    });

    const locationsData = await Location.find({}).sort({ location_no: 1 });
    event.reply("location-data", locationsData);
  } catch (error) {
    console.error("Error creating new location:", error);
    event.reply("new-location-error", "Error creating new location");
  }
});

// edit - location
ipcMain.on("edit-location", async (event, locationId, locationData) => {
  try {
    const data = await Location.updateOne(
      { location_no: Number(locationId) },
      {
        location_name: locationData.locationName,
        location_price: locationData.rate,
        is_taxable: locationData.isTaxable,
        status: locationData.isActive,
        is_synced : false,
      }
    );
    const locationsData = await Location.find({}).sort({ location_no: 1 });
    event.reply("location-data", locationsData);
  } catch (error) {
    console.error("Error updating location:", error);
    event.reply("edit-location-error", "Error updating location");
  }
});

// new - user
ipcMain.on("new-user", async (event, userData) => {
  try {
    const maxUser = await User.findOne({}, { user_no: 1 }).sort({
      user_no: -1,
    });
    let maxUserNo = 0;
    if (maxUser) {
      maxUserNo = maxUser.user_no;
    }
    const newUserNo = maxUserNo + 1;
    const data = await User.create({
      user_no: newUserNo,
      user_id: userData.userId,
      password: userData.newPassword,
      first_name: userData.firstName,
      last_name: userData.lastName,
      mobile_no: userData.newMobile,
      user_role: userData.newRole,
      status: userData.isActive,
      creation_date: Date.now(),
    });

    event.reply("new-user-success", data);
  } catch (error) {
    console.error("Error creating new user:", error);
    event.reply("new-user-error", "Error creating new user");
  }
});

// edit - user
ipcMain.on("edit-user", async (event, userId, userData) => {
  try {
    const data = await User.updateOne(
      { user_no: Number(userId) },
      {
        user_id: userData.userId,
        password: userData.Password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        user_role: userData.Role,
        status: userData.isActive,
        is_synced : false,
      }
    );
    event.reply("edit-user-success", data);
  } catch (error) {
    console.error("Error updating user:", error);
    event.reply("edit-user-error", "Error updating user");
  }
});

// new - table
ipcMain.on("new-table", async (event, tableData) => {
  try {
    if (!tableData.newLocationNo) {
      event.reply("new-table-error", "Please select location");
      return;
    }

    const location = await Location.findOne({
      location_no: tableData.newLocationNo,
    });
    const prefix = location.location_name.substring(0, 3).toUpperCase();
    const serial_no = `${prefix}${tableData.newTableNo}`;

    await LocationInfo.create({
      serial_no,
      table_no: tableData.newTableNo,
      location_no: tableData.newLocationNo,
      status: tableData.isActive,
    });

    const data = await LocationInfo.find({});
    event.reply("table-data", data);
  } catch (error) {
    console.error("Error creating new table:", error);
    event.reply("new-table-error", "Error creating new table");
  }
});

// edit - table
ipcMain.on("edit-table", async (event, serialNo, tableData) => {
  try {
    const tableToUpdate = await LocationInfo.findOne({ serial_no: serialNo });

    const location = await Location.findOne({
      location_no: tableData.locationNo,
    });
    const prefix = location.location_name.substring(0, 3).toUpperCase();

    const newTableNo = tableData.tableNo;
    const newSerialNo = `${prefix}${newTableNo}`;

    tableToUpdate.serial_no = newSerialNo;
    tableToUpdate.table_no = newTableNo;
    tableToUpdate.location_no = tableData.locationNo;
    tableToUpdate.status = tableData.isActive;
    tableToUpdate.is_synced = false;
    const updatedTable = await tableToUpdate.save();

    event.reply("table-data", updatedTable);
  } catch (error) {
    console.error("Error updating table:", error);
    event.reply("edit-table-error", "Error updating table");
  }
});

// bill-book-data
ipcMain.on("fetch-bill-book", async (event) => {
  try {
    const data = await BillBook.find({});
    event.reply("bill-book-data", data);
  } catch (error) {
    console.error("Error fetching bill-book data:", error);
    event.reply("bill-book-data-error", "Error fetching bill-book data");
  }
});

// new - bill-book
ipcMain.on("new-bill-book", async (event, BillBookData) => {
  try {
    const maxBillBookNo = await BillBook.findOne({}, { bill_book: 1 }).sort({ bill_book: -1 });
    let newBillBookNo = 0;
    if (maxBillBookNo) {
      newBillBookNo = maxBillBookNo.bill_book;
    }
    await BillBook.create({
      bill_book: newBillBookNo + 1,
      is_active: BillBookData.isActive
    });

    if (BillBookData.isActive) {
      const billBooks = await BillBook.find();
      for (const billBook of billBooks) {
        if (billBook.bill_book !== newBillBookNo + 1) {
          await BillBook.updateOne(
            { bill_book: billBook.bill_book },
            {
              is_active: false,
              is_synced: false
            }
          );
        }
      }
    }
    const data = await BillBook.find({});
    event.reply("bill-book-data", data);

  } catch (error) {
    console.error("Error creating new bill-book:", error);
    event.reply("new-bill-book-error", "Error creating new bill-book");
  }
})

// edit -bill-book
ipcMain.on("edit-bill-book", async (event, billBookId, billBookData) => {
  try {
    await BillBook.updateOne(
      { bill_book: Number(billBookId) },
      {
        is_active: billBookData.isActive,
        is_synced:false,
      }
    );

    const billBooks = await BillBook.find();
    for (const billBook of billBooks) {
      if (billBook.bill_book !== Number(billBookId)) {
        await BillBook.updateOne(
          { bill_book: billBook.bill_book },
          {
            is_active: false
          }
        );
      }
    }
    const data = await BillBook.find({});

    event.reply("bill-book-data", data);
  } catch (error) {
    console.error("Error editing bill-book:", error);
    event.reply("edit-bill-book-error", "Error editing bill-book");
  }
})

// merge-tables
ipcMain.on("merge-tables", async (event, newData, secondTableData) => {
  try {
    const table_no = newData[0].table_no;
    const location_name = newData[0].location_name;
    for (const item of newData) {
      const existingItem = await ExistingCartItem.findOne({
        table_no,
        location_name,
        item_no: item.item_no,
      });

      if (existingItem) {
        existingItem.quantity = item.quantity;
        await existingItem.save();
      } else {
        await ExistingCartItem.create({
          table_no,
          location_name,
          item_no: item.item_no,
          item_image: item.item_image,
          item_name: item.item_name,
          quantity: item.quantity,
          price: item.price,
          is_printed: item.is_printed
        });
      }
    }

    const secondTableID = secondTableData[0]._doc.table_no;
    const secondTableLocation = secondTableData[0]._doc.location_name;

    await ExistingCartItem.deleteMany({
      table_no: secondTableID,
      location_name: secondTableLocation,
    })
    const data = await ExistingCartItem.find({});
    event.reply("merge-tables-success", data);
  } catch (error) {
    console.error("Error merging tables:", error);
    event.reply("merge-tables-error", "Error merging tables");
  }
});

// transfer tables
ipcMain.on("transfer-table", async (event, toTransferTabledata) => {
  try {
    console.log(toTransferTabledata)
    const { activeTableNo, activeTableLocation, toTransferTableNo, toTransferTableLocation } = toTransferTabledata;

    const allData = await ExistingCartItem.find({
      table_no: activeTableNo,
      location_name: activeTableLocation
    })
    if (allData) {
      for (let i = 0; i < allData.length; i++) {
        await ExistingCartItem.findOneAndUpdate({
          table_no: activeTableNo,
          location_name: activeTableLocation,
        }, {
          table_no: toTransferTableNo,
          location_name: toTransferTableLocation,
        });
      }
    }

    const updateItems = await ExistingCartItem.find({});
    event.reply("transfer-table-success", updateItems);
  } catch (error) {
    console.log("error transfering table", error);
    event.reply("transfer-table-error", "Error transfering table");
  }
});

// new - bill
ipcMain.on("save-bill", async (event, billData) => {
  try {

    const maxBillBookNo = await BillBook.findOne({
      is_active: true
    })
    let maxBillBook = 0;
    if (maxBillBookNo) {
      maxBillBook = maxBillBookNo.bill_book;
    }

    const maxBill = await Bill.findOne({
      bill_book: maxBillBook
    }, { bill_no: 1 }).sort({
      bill_no: -1,
    });
    let maxBillNo = 0;
    if (maxBill) {
      maxBillNo = maxBill.bill_no;
    }
    const newBillNo = maxBillNo + 1;

    const finalAmount = billData.final_amount.toFixed(2);
    const decimalPart = Number(String(finalAmount).split(".")[1]) || 0;

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    billData.round_off = roundOffValue
    billData.item_details = billData.itemDetails;
    billData.bill_book = maxBillBook;
    billData.bill_no = newBillNo;
    billData.total_amount = Number(billData.parseTotalAmount).toFixed(2)
    billData.location_name = billData.location_name;
    billData.final_amount = Math.round(billData.final_amount);
    billData.cgst_tax = Number(billData.cgst_tax).toFixed(2);
    billData.sgst_tax = Number(billData.sgst_tax).toFixed(2);
    billData.discount_reason = String(billData.discount_reason);
    billData.discount_perc = Number(billData.discount_perc);
    billData.pay_mode = "unpaid";
    billData.created_at = Date.now();

    await Bill.create(billData);

    try {
      const cartItems = await ExistingCartItem.deleteMany({
        table_no: billData.table_no,
        location_name: billData.location_name,
      });
      event.reply("bill-saved", cartItems);
    } catch (error) {
      console.error("Error removing items from cart:", error);
    }
  } catch (error) {
    console.error("Error creating new bill:", error);
    event.reply("save-bill-error", "Error creating new bill");
  }
});

// updaed bill infor
ipcMain.on("updated-bill-info", async (event, toUpdateData) => {
  try {
    toUpdateData.is_synced = false
    const data = await Bill.findOneAndUpdate({
      bill_no: toUpdateData.bill_no,
    }, toUpdateData)
    event.reply("updated-bill-info-success", data)
  }
  catch (error) {
    console.log("error updating bill info", error)
    event.reply("updated-bill-info-error", "Error updating bill info")
  }
})

// new - transaction
ipcMain.on("save-transaction", async (event, transactionData) => {
  try {

    const maxBillBookNo = await BillBook.findOne({
      is_active: true
    });
    let maxBillBook = 0;
    if (maxBillBookNo) {
      maxBillBook = maxBillBookNo.bill_book;
    }
    const maxTransaction = await Transaction.findOne({
      bill_book: maxBillBook
    }, { transaction_no: 1 }).sort({
      transaction_no: -1,
    });
    let maxTransactionNo = 0;
    if (maxTransaction) {
      maxTransactionNo = maxTransaction.transaction_no;
    }
    const newTransactionNo = maxTransactionNo + 1;

    transactionData.bill_book = maxBillBook;
    transactionData.transaction_no = newTransactionNo;
    transactionData.date = Date.now();

    const data = await Transaction.create(transactionData);
    event.reply("save-transaction-success", JSON.parse(JSON.stringify(data)));
  } catch (error) {
    console.error("Error creating new transaction:", error);
    event.reply("save-transaction-error", "Error creating new transaction");
  }
})

// daily -sales report
ipcMain.on("fetch-daily-sales", async (event, datesByInput) => {
  try {
    const selectedDate = new Date(datesByInput);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCash: { $sum: { $cond: { if: { $eq: ["$cash_pay", true] }, then: "$final_amount", else: 0 } } },
          totalCard: { $sum: { $cond: { if: { $eq: ["$card_pay", true] }, then: "$final_amount", else: 0 } } },
          totalUpi: { $sum: { $cond: { if: { $eq: ["$upi_pay", true] }, then: "$final_amount", else: 0 } } },
          totalOther: { $sum: { $cond: { if: { $eq: ["$other_pay", true] }, then: "$final_amount", else: 0 } } },
          sales: { $push: "$$ROOT" }
        }
      }
    ];

    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("daily-sales-data", data);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    event.reply("fetch-daily-sales-error", "Error fetching daily sales");
  }
});

// monthly - sales report
ipcMain.on("fetch-monthly-sales", async (event, fromDate, toDate) => {
  try {
    const selectedStartDate = new Date(fromDate);
    const selectedEndDate = new Date(toDate);
    const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCash: { $sum: { $cond: { if: { $eq: ["$cash_pay", true] }, then: "$final_amount", else: 0 } } },
          totalCard: { $sum: { $cond: { if: { $eq: ["$card_pay", true] }, then: "$final_amount", else: 0 } } },
          totalUpi: { $sum: { $cond: { if: { $eq: ["$upi_pay", true] }, then: "$final_amount", else: 0 } } },
          totalOther: { $sum: { $cond: { if: { $eq: ["$other_pay", true] }, then: "$final_amount", else: 0 } } },
          sales: { $push: "$$ROOT" }
        }
      }
    ];

    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("monthly-sales-data", data);
  } catch (error) {
    console.log("error fetching monthly sales", error);
    event.reply("fetch-monthly-sales-error", "Error fetching monthly sales");
  }
});

// Table-wise report
ipcMain.on("fetch-tableWise-sales", async (event, fromDate, toDate) => {
  try {
    const selectedStartDate = new Date(fromDate);
    const selectedEndDate = new Date(toDate);
    const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          "created_at": {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: "$table_no",
          count: { $sum: 1 },
          total_final_amount: { $sum: "$final_amount" }
        }
      }
    ];

    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("tableWise-sales-data", data);
  } catch (error) {
    console.log("error fetching monthly sales", error);
    event.reply("fetch-monthly-sales-error", "Error fetching monthly sales");
  }
});

// location-wise report
ipcMain.on("fetch-locationWise-sales", async (event, fromDate, toDate, locationName) => {
  try {
    const selectedStartDate = new Date(fromDate);
    const selectedEndDate = new Date(toDate);
    const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          "created_at": {
            $gte: startDate,
            $lte: endDate
          },
          "location_name": locationName
        }
      },
      {
        $group: {
          _id: {
            location_name: "$location_name",
            bill_no: "$bill_no"
          },
          table_no: { $addToSet: "$table_no" },
          totalAmount: { $sum: "$total_amount" },
          totalDiscountPerc: { $sum: { $multiply: ["$discount_perc", { $divide: ["$total_amount", 100] }] } },
          totalDiscount: { $sum: "$discount_rupees" },
          totalTax : { $sum: "$total_tax" },
          totalFinalAmount: { $sum: "$final_amount" },
          totalCash: { $sum: { $cond: { if: { $eq: ["$cash_pay", true] }, then: "$final_amount", else: 0 } } },
          totalCard: { $sum: { $cond: { if: { $eq: ["$card_pay", true] }, then: "$final_amount", else: 0 } } },
          totalUpi: { $sum: { $cond: { if: { $eq: ["$upi_pay", true] }, then: "$final_amount", else: 0 } } },
          totalOther: { $sum: { $cond: { if: { $eq: ["$other_pay", true] }, then: "$final_amount", else: 0 } } },
        }
      }
    ];

    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("locationWise-sales-data", data);
  } catch (error) {
    console.log("error fetching monthly sales", error);
    event.reply("fetch-monthly-sales-error", "Error fetching monthly sales");
  }
});

// item-wise - daily report
ipcMain.on("fetch-itemWise-sales", async (event, datesByInput) => {
  try {
    const selectedDate = new Date(datesByInput);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
    const aggregationPipeline = [
      {
        $match: {
          "created_at": {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: "$item_details"
      },
      {
        $group: {
          _id: "$item_details.item_name",
          totalQuantity: { $sum: "$item_details.quantity" },
          totalPrice: { $sum: { $multiply: ["$item_details.price", "$item_details.quantity"] } }
        }
      },
      {
        $project: {
          _id: 0,
          item_name: "$_id",
          quantity: "$totalQuantity",
          total: "$totalPrice",
        }
      }
    ]
    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("itemWise-sales-data", data);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    event.reply("fetch-daily-sales-error", "Error fetching daily sales");
  }
})

// category - item-wise - daily report
ipcMain.on("category-item-wise-daily-table", async (event, datesByInput) => {
  try {
    const selectedDate = new Date(datesByInput);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);

    const itemAggregationPipeline = [
      {
        $match: {
          created_at: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: "$item_details"
      },
      {
        $lookup: {
          from: "items",
          localField: "item_details.item_no",
          foreignField: "item_no",
          as: "item"
        }
      },
      {
        $unwind: "$item"
      },
      {
        $lookup: {
          from: "categories",
          localField: "item.category_no",
          foreignField: "category_no",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $group: {
          _id: {
            category_name: "$category.category_name",
            item_name: "$item_details.item_name",
          },
          totalQuantity: { $sum: "$item_details.quantity" },
          totalPrice: { $sum: { $multiply: ["$item_details.price", "$item_details.quantity"] } }
        }
      },
      {
        $group: {
          _id: "$_id.category_name",
          items: {
            $push: {
              item_name: "$_id.item_name",
              quantity: "$totalQuantity",
              total: "$totalPrice"
            }
          }
        }
      }
    ];


    const itemData = await Bill.aggregate(itemAggregationPipeline);

    event.reply("category-item-wise-daily-table-data", itemData);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    event.reply("fetch-daily-sales-error", "Error fetching daily sales");
  }
});

// item wise monthly sales
ipcMain.on("fetch-ItemWise-monthly-sales", async (event, fromDate, toDate) => {
  try {
    const selectedStartDate = new Date(fromDate);
    const selectedEndDate = new Date(toDate);
    const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999);
    const aggregationPipeline = [
      {
        $match: {
          "created_at": {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $unwind: "$item_details"
      },
      {
        $group: {
          _id: "$item_details.item_name",
          totalQuantity: { $sum: "$item_details.quantity" },
          totalPrice: { $sum: { $multiply: ["$item_details.price", "$item_details.quantity"] } }
        }
      },
      {
        $project: {
          _id: 0,
          item_name: "$_id",
          quantity: "$totalQuantity",
          total: "$totalPrice",
        }
      }
    ]

    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("itemWise-sales-data", data);

  } catch (error) {
    console.log("error fetching monthly sales", error)
    event.reply("fetch-monthly-sales-error", "Error fetching monthly sales");
  }
})

// payment wise monthly sales
ipcMain.on("fetch-paymentWise-sales", async (event, fromDate, toDate) => {
  try {
    const selectedStartDate = new Date(fromDate);
    const selectedEndDate = new Date(toDate);
    const startDate = new Date(selectedStartDate.getFullYear(), selectedStartDate.getMonth(), selectedStartDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedEndDate.getFullYear(), selectedEndDate.getMonth(), selectedEndDate.getDate(), 23, 59, 59, 999);

    const aggregationPipeline = [
      {
        $match: {
          "created_at": {
            $gte: startDate,
            $lte: endDate
          },
          "pay_mode": { $ne: "unpaid" } // Exclude records where pay_mode is "unpaid"
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          },
          totalAmount: { $sum: "$total_amount" },
          totalDiscountPerc: { $sum: { $multiply: ["$discount_perc", { $divide: ["$total_amount", 100] }] } },
          totalDiscount: { $sum: "$discount_rupees" },
          totalTax: { $sum: "$total_tax" },
          totalCash: { $sum: { $cond: { if: { $eq: ["$cash_pay", true] }, then: "$final_amount", else: 0 } } },
          totalFinalAmount: { $sum: "$final_amount" },
          totalCard: { $sum: { $cond: { if: { $eq: ["$card_pay", true] }, then: "$final_amount", else: 0 } } },
          totalUpi: { $sum: { $cond: { if: { $eq: ["$upi_pay", true] }, then: "$final_amount", else: 0 } } },
          totalOther: { $sum: { $cond: { if: { $eq: ["$other_pay", true] }, then: "$final_amount", else: 0 } } },
        }
      }
    ];


    const data = await Bill.aggregate(aggregationPipeline);
    event.reply("paymentWise-sales-data", data);

  } catch (error) {
    console.log("error fetching payment-wise monthly sales", error);
    event.reply("paymentWise-sales-error", "Error fetching payment-wise monthly sales");
  }
});

// unpaid bills 
ipcMain.on("fetch-unpaid-bills", async (event, datesByInput) => {
  try {
    const selectedDate = new Date(datesByInput);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
    const data = await Bill.find({
      created_at: {
        $gte: startDate,
        $lte: endDate,
      },
      pay_mode: "unpaid",
      final_amount: { $gt: 0 }
    }).select("-item_details");

    event.reply("unpaid-bills-data", data);
  } catch (error) {
    console.error("Error fetching daily sales:", error);
    event.reply("fetch-daily-sales-error", "Error fetching daily sales");
  }
})

// fetch bill details by billNO
ipcMain.on("fetch-bill-by-billNo", async (event, billNo) => {
  try {
    const data = await Bill.findOne({ bill_no: billNo, item_details: { $exists: true, $ne: [] } });
    if (!data) {
      event.reply("bill-fetch-error", "Bill not found");
    }
    const serializedData = JSON.parse(JSON.stringify(data));
    event.reply("edit-bill-details-data", serializedData);

  } catch (error) {
    console.log("error fetching bill", error)
    event.reply("fetch-error", "Error fetching bill");
  }
})

// get location name by location no
ipcMain.on("fetch-location-name-by-no", async (event, locationNo) => {
  try {
    const data = await Location.findOne({ location_no: locationNo });
    event.reply("location-name-by-no", data.location_name);
  } catch (error) {
    console.log("error fetching location name", error)
    event.reply("fetch-error", "Error fetching location name");
  }
})

// save preference
ipcMain.on("save-preference", async (event, data) => {
  try {
    const preferenceData = {
      // user_id: data.user_id,
      currency_name: data.currency_name,
      bill_printing_type: data.bill_printing_type,
    }
    if (data.tax_option === "GST") {
      preferenceData.is_gstAvailable = true
      preferenceData.gst_percentage = data.tax_rates.gstTaxRate
      preferenceData.is_noTaxAvailable = false
      preferenceData.is_ValueAddedTaxAvailable = false
    }
    else if (data.tax_option === "Value Added Tax") {
      preferenceData.is_ValueAddedTaxAvailable = true
      preferenceData.vat_percentage = data.tax_rates.valueAddedTaxRate
      preferenceData.is_gstAvailable = false
      preferenceData.is_noTaxAvailable = false
    }
    else if (data.tax_option === "No Tax") {
      preferenceData.is_noTaxAvailable = true
      preferenceData.is_gstAvailable = false
      preferenceData.is_ValueAddedTaxAvailable = false
    }

    await Preference.create(preferenceData);

    const userData = await Preference.findOne();
    event.reply("preference-saved", userData);
  }
  catch (error) {
    console.log("error saving preference", error)
    event.reply("save-preference-error", "Error saving preference");
  }
})

// update kot status
ipcMain.on("change-kot-status", async (event, dataToShare) => {
  try {
    await ExistingCartItem.updateMany({
      table_no: dataToShare.table_no,
      location_name: dataToShare.location_name,
    }, {
      is_printed: true,
    })
    const data = await ExistingCartItem.find({
      table_no: dataToShare.table_no,
      location_name: dataToShare.location_name,
    });

    event.reply("cartItems-data", data);
  } catch (error) {
    console.log("error changing status", error)
    event.reply("change-kot-status-error", "Error changing status");
  }
})

// get bill data by bill no
ipcMain.on("get-bill-no", async (event) => {
  try {
    const maxBill = await Bill.findOne({}, { bill_no: 1 }).sort({
      bill_no: -1,
    });
    let maxBillNo = 0;
    if (maxBill) {
      maxBillNo = maxBill.bill_no;
    }
    const newBillNo = maxBillNo + 1;
    event.reply("bill-no-data", newBillNo);
  } catch (error) {
    console.log("error fetching bill no", error)
    event.reply("get-bill-no-error", "Error fetching bill no");
  }
})

// fetch user preference
ipcMain.on("fetch-user-preference", async (event, user_id) => {
  try {
    const data = await Preference.findOne();
    event.reply("fetch-user-preference-data", data);
  }
  catch (error) {
    console.log("error fetching user preference", error)
    event.reply("fetch-user-preference-error", "Error fetching user preference");
  }
})

// fetch unsettled bills
ipcMain.on("fetch-unsettled-bills", async (event, datesByInput) => {
  try {
    const selectedDate = new Date(datesByInput);
    const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0);
    const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999);
    const data = await Bill.find({
      created_at: {
        $gte: startDate,
        $lte: endDate,
      },
      item_details: { $exists: true, $ne: [] },
      final_amount: { $gt: 0 },
      pay_mode: "unpaid"
    }).select("-item_details");
    event.reply("unsettled-bills-data", data);

  } catch (error) {
    console.error("Error fetching daily sales:", error);
    event.reply("fetch-daily-sales-error", "Error fetching daily sales");
  }
})

// set pay mode
ipcMain.on("set-paymode", async (event, allBills, payMode) => {
  try {
    for (const billNo of allBills) {
      console.log(billNo)
      const billInfo = await Bill.findOne({ bill_no: billNo });

      if (!billInfo) {
        throw new Error(`Bill with number ${billNo} not found`);
      }

      if (billInfo.pay_mode === "unpaid") {
        billInfo.pay_mode = payMode;
      }

      if (payMode === "CASH") {
        billInfo.cash_pay = true;
      } else if (payMode === "CARD") {
        billInfo.card_pay = true;
      } else if (payMode === "UPI") {
        billInfo.upi_pay = true;
        billInfo.is_locked = true;
      } else if (payMode === "OTHER") {
        billInfo.other_pay = true;
        billInfo.is_locked = true;
      }
      billInfo.is_synced = false;
      await billInfo.save();
    }

    event.reply("set-paymode-success", "Payment mode set successfully");
  } catch (error) {
    console.log("Error setting payment mode", error);
    event.reply("set-paymode-error", "Error setting payment mode");
  }
});

// set single pay mode
ipcMain.on("set-single-paymode", async (event, billNo, payMode) => {
  try {
    const billDetail = await Bill.findOne({ bill_no: billNo });

    if (!billDetail) {
      throw new Error("Bill not found");
    }

    if (billDetail.pay_mode === "unpaid") {
      billDetail.pay_mode = payMode;

      if (payMode === "CASH") {
        billDetail.cash_pay = true;
      } else if (payMode === "CARD") {
        billDetail.card_pay = true;
      } else if (payMode === "UPI") {
        billDetail.upi_pay = true;
        billDetail.is_locked = true;
      } else if (payMode === "OTHER") {
        billDetail.other_pay = true;
        billDetail.is_locked = true;
      }

      billDetail.is_synced = false;
      await billDetail.save();

      event.reply("set-paymode-success", "Payment mode set successfully");
    } else {
      event.reply("set-paymode-error", "Bill is already paid");
    }
  } catch (error) {
    console.log("Error setting payment mode", error);
    event.reply("set-paymode-error", "Error setting payment mode");
  }
});

// get special info
ipcMain.on("get-special-info", async (event) => {
  try {
    const data = await SpInfo.find();
    event.reply("get-special-info-success", data);
  } catch (error) {
    console.log("Error getting special info", error);
    event.reply("get-special-info-error", "Error getting special info");
  }
})

// bulk insert
ipcMain.on('bulk-insert-item', async (event, data) => {
  try {
    const maxItem = await Item.findOne({}, { item_no: 1 }).sort({
      item_no: -1,
    });

    let maxItemNo = 0;
    if (maxItem) {
      maxItemNo = maxItem.item_no;
    }
    maxItemNo++;

    data.forEach(item => {
      item.item_no = maxItemNo++;
    });
    await Item.insertMany(data);
    event.reply('bulk-insert-response', 'Data inserted successfully');
  } catch (error) {
    console.error('Bulk insert error:', error);
    event.reply('bulk-insert-response', 'Error inserting data');
  }
});

// update bill discount
ipcMain.on("update-bill-discount", async (event, billNo, discountPerc, taxPerc) => {
  try {
    const bill = await Bill.findOne({ bill_no: billNo });
    if (!bill) {
      throw new Error(`Bill with number ${billNo} not found.`);
    }
    const totalAmount = bill.total_amount;
    const discountAmount = totalAmount * (discountPerc / 100);
    const netAmountAfterDiscount = totalAmount - discountAmount;

    const taxAmount = netAmountAfterDiscount * ((taxPerc / 2) / 100);
    const sgstAmount = taxAmount;
    const cgstAmount = taxAmount;
    const finalAmount = netAmountAfterDiscount + sgstAmount + cgstAmount;

    const decimalPart = Number(String(finalAmount.toFixed(2)).split(".")[1]);

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    // Update bill fields
    bill.round_off = roundOffValue
    bill.discount_perc = discountPerc;
    bill.sgst_tax = sgstAmount.toFixed(2);
    bill.cgst_tax = cgstAmount.toFixed(2);
    bill.final_amount = finalAmount.toFixed(2);
    bill.is_synced = false;
    await bill.save();

    const data = await Bill.findOne({ bill_no: billNo, item_details: { $exists: true, $ne: [] } });
    if (!data) {
      event.reply("bill-fetch-error", "Bill not found");
    }
    const serializedData = JSON.parse(JSON.stringify(data));
    event.reply("edit-bill-details-data", serializedData);
  } catch (error) {
    console.error("Error updating bill discount:", error);
    event.reply("update-bill-discount-error", error.message);
  }
});

// update-bill-discount-rupee
ipcMain.on("update-bill-discount-rupee", async (event, billNo, discountRupee, taxPerc) => {
  try {
    console.log("ji")
    const bill = await Bill.findOne({ bill_no: billNo });
    if (!bill) {
      throw new Error(`Bill with number ${billNo} not found.`);
    }
    const totalAmount = bill.total_amount;
    const discountAmount = discountRupee;
    const netAmountAfterDiscount = totalAmount - discountAmount;
    console.log(netAmountAfterDiscount)
    const taxAmount = netAmountAfterDiscount * ((taxPerc / 2) / 100);
    console.log(taxAmount)
    const sgstAmount = taxAmount;
    const cgstAmount = taxAmount;
    const finalAmount = netAmountAfterDiscount + sgstAmount + cgstAmount;
    console.log(finalAmount)
    const decimalPart = Number(String(finalAmount.toFixed(2)).split(".")[1]);

    let roundOffValue
    if (decimalPart < 50) {
      const roundOffNum = 100 - decimalPart;
      roundOffValue = '-0.' + roundOffNum
    } else {
      roundOffValue = '0.' + decimalPart
    }

    if (roundOffValue === '0.100' || roundOffValue === '-0.100') {
      roundOffValue = '0.00'
    }

    console.log(roundOffValue)
    // Update bill fields
    bill.round_off = roundOffValue
    bill.discount_rupees = discountRupee;
    bill.sgst_tax = sgstAmount.toFixed(2);
    bill.cgst_tax = cgstAmount.toFixed(2);
    bill.final_amount = finalAmount.toFixed(2);
    bill.is_synced = false;
    await bill.save();

    const data = await Bill.findOne({ bill_no: billNo, item_details: { $exists: true, $ne: [] } });
    if (!data) {
      event.reply("bill-fetch-error", "Bill not found");
    }
    const serializedData = JSON.parse(JSON.stringify(data));
    event.reply("edit-bill-details-data", serializedData);
  } catch (error) {
    console.error("Error updating bill discount:", error);
    event.reply("update-bill-discount-error", error.message);
  }
});

// update-bill-discount
ipcMain.on("update-bill-discount-vat", async (event, billNo, discountPerc, vatPerc) => {
  try {
    const bill = await Bill.findOne({ bill_no: billNo });
    if (!bill) {
      throw new Error(`Bill with number ${billNo} not found.`);
    }
    const totalAmount = bill.total_amount;
    const discountAmount = totalAmount * (discountPerc / 100);
    const netAmountAfterDiscount = totalAmount - discountAmount;

    const taxAmount = netAmountAfterDiscount * (vatPerc / 100);
    const vatAmount = taxAmount;
    const finalAmount = netAmountAfterDiscount + vatAmount;

    bill.discount_perc = discountPerc;
    bill.vat_tax = vatAmount.toFixed(2);
    bill.final_amount = Math.round(finalAmount);
    bill.is_synced = false
    await bill.save();

    const data = await Bill.findOne({ bill_no: billNo, item_details: { $exists: true, $ne: [] } });
    if (!data) {
      event.reply("bill-fetch-error", "Bill not found");
    }
    const serializedData = JSON.parse(JSON.stringify(data));
    event.reply("edit-bill-details-data", serializedData);
  } catch (error) {
    console.error("Error updating bill discount:", error);
    event.reply("update-bill-discount-error", error.message);
  }
});

// save-bill-info
ipcMain.on("save-bill-info", async (event, customer_id, data) => {
  try {
    data.is_synced = false
    await BillInfo.findOneAndUpdate({
      customer_id: customer_id
    }, data);
    const billData = await BillInfo.findOne();
    event.reply("save-bill-info-success", billData);
  } catch (error) {
    console.error("Error saving bill info:", error);
    event.reply("save-bill-info-error", "Error saving bill info");
  }
})

// get-bill-info
ipcMain.on("get-bill-info", async (event) => {
  try {
    const data = await BillInfo.findOne();
    event.reply("fetch-bill-info-success", data);
  } catch (error) {
    console.error("Error fetching bill info:", error);
    event.reply("fetch-bill-info-error", "Error fetching bill info");
  }
})

// save-loyalty
ipcMain.on("save-loyalty", async (event, data) => {
  try {
    const userData = await Loyalty.findOne({
      customer_no: data.customer_no
    })

    if (userData) {
      userData.total_points += data.total_points
      userData.used_points += data.used_points
      userData.remaining_points += data.remaining_points
      userData.date = Date.now()
      userData.is_synced = false
      await userData.save()
    }
    else {
      data.is_synced = false
      data.date = Date.now()
      await Loyalty.create(data)
    }

    event.reply("save-loyalty-success", JSON.stringify(data));

  } catch (error) {
    console.error("Error saving loyalty:", error);
    event.reply("save-loyalty-error", "Error saving loyalty");
  }
});

// get-loyalty-points
ipcMain.on("get-loyalty-points", async (event, customer_no) => {
  try {
    const data = await Loyalty.findOne({
      customer_no: customer_no
    })

    if (data) {
      event.reply("fetch-loyalty-points-success", data);
    }
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    event.reply("fetch-loyalty-points-error", "Error fetching loyalty points");
  }
})

// apply-loyalty-points
ipcMain.on("apply-loyalty-points", async (event, customer_no, redeemAmount) => {
  try {
    const userData = await Loyalty.findOne({
      customer_no: customer_no
    })
    if (userData) {
      if (userData.remaining_points >= redeemAmount) {
        userData.remaining_points -= Number(redeemAmount)
        userData.total_points -= Number(redeemAmount)
        userData.used_points += Number(redeemAmount)
        userData.is_synced = false
        await userData.save()

        const data = await Loyalty.findOne({
          customer_no: customer_no
        })
        if (data) {
          event.reply("fetch-loyalty-points-success", JSON.stringify(data));
        }

        event.reply("apply-loyalty-points-success", JSON.stringify(userData));

      }
      else {
        event.reply("apply-loyalty-points-error", "Insufficient points");
      }
    }

  } catch (error) {
    console.error("Error applying loyalty points:", error);
    event.reply("apply-loyalty-points-error", "Error applying loyalty points");
  }
})

// save-Stock
ipcMain.on("new-Stock", async (event, data) => {
  try {
    if (!data) {
      event.reply("new-Stock-error", "No data provided");
      return
    }
    // fetch last itemNo
    const lastItemNo = await Stock.findOne().sort({ item_no: -1 });
    let itemNo = 1
    if (lastItemNo) {
      itemNo = lastItemNo.item_no + 1;
    }
    data.item_no = itemNo
    await Stock.create(data)
    event.reply("fetch-Stock-data", data);
  } catch (error) {
    console.error("Error saving Stock:", error);
    event.reply("new-Stock-error", "Error saving Stock");
  }
})

// fetch-Stock
ipcMain.on("fetch-Stock", async (event) => {
  try {
    const data = await Stock.find();
    event.reply("fetch-Stock-data", data);
  } catch (error) {
    console.error("Error fetching Stock:", error);
    event.reply("fetch-Stock-error", "Error fetching Stock");
  }
})

// edit-Stock
ipcMain.on("edit-Stock", async (event, itemId, itemData) => {
  try {
    if (!itemData) {
      event.reply("edit-Stock-error", "No data provided");
      return
    }
    itemData.is_synced = false
    await Stock.findOneAndUpdate({ item_no: itemId }, itemData)
    event.reply("fetch-Stock-data", itemData);
  } catch (error) {
    console.error("Error editing Stock:", error);
    event.reply("edit-Stock-error", "Error editing Stock");
  }
})

// fetch-receipe
ipcMain.on("fetch-receipe", async (event) => {
  try {
    const data = await Receipe.find();
    event.reply("fetch-receipe-data", JSON.stringify(data));
  } catch (error) {
    console.error("Error fetching receipe:", error);
    event.reply("fetch-receipe-error", "Error fetching receipe");
  }
})

// new-receipe
ipcMain.on("new-receipe", async (event, data) => {
  try {
    if (!data) {
      event.reply("new-receipe-error", "No data provided");
      return
    }
    // find last receipe_no
    const lastReceipeNo = await Receipe.findOne({}, { receipe_no: 1 }).sort({ receipe_no: -1 });
    let receipeNo = 1
    if (lastReceipeNo) {
      receipeNo = lastReceipeNo.receipe_no + 1
    }
    data.receipe_no = receipeNo
    await Receipe.create(data)
    event.reply("fetch-receipe-data", data);
  } catch (error) {
    console.error("Error saving receipe:", error);
    event.reply("new-receipe-error", "Error saving receipe");
  }
})

// deduct-qty
ipcMain.on("deduct-qty", async (event, data) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      event.reply("deduct-qty-error", "No data provided or data is not in the correct format");
      return;
    }

    const itemNames = data.map(item => item.item_name);
    const rawMaterialData = await Receipe.find({
      item_name: { $in: itemNames }
    });

    if (rawMaterialData.length === 0) {
      event.reply("deduct-qty-error", "No raw material data found for the provided item names");
      return;
    }

    const stockData = await Stock.find();

    for (let rawMaterial of rawMaterialData) {
      for (let subItem of rawMaterial.sub_item_details) {
        const itemDetail = data.find(item => item.item_name === rawMaterial.item_name);
        if (itemDetail) {
          const quantityMultiplier = itemDetail.quantity; 
          const quantityMinus = (subItem.quantity * quantityMultiplier) / 1000; 
          const tobeMinusQty = stockData.find(item => item.item_name === subItem.item_name)?.quantity;

          if (tobeMinusQty !== undefined) {
            const updatedQuantity = (tobeMinusQty - quantityMinus).toFixed(2); 
            const stockItem = stockData.find(item => item.item_name === subItem.item_name);
            if (stockItem) {
              stockItem.quantity = updatedQuantity < 0 ? 0 : updatedQuantity; 
              const mrp = parseFloat(stockItem.mrp);
              const quantity = parseFloat(stockItem.quantity);
              if (isNaN(mrp) || isNaN(quantity)) {
                console.error("Invalid number for mrp or quantity", { mrp, quantity });
                continue;
              }
              stockItem.total = (mrp * quantity).toFixed(2);

              if (isNaN(stockItem.total)) {
                console.error("Error: Calculated total is NaN for stock item:", stockItem);
              } else {
                stockItem.is_synced = false;
                await stockItem.save();
              }
            }
          } else {
            console.log("Stock item not found:", subItem.item_name);
          }
        }
      }
    }

    event.reply("deduct-qty-success", "Quantity deducted and stock updated successfully");

  } catch (error) {
    console.error("Error deducting qty:", error);
    event.reply("deduct-qty-error", "Error deducting qty");
  }
});

 // delete-edit-receipe
 ipcMain.on("delete-edit-receipe", async (event, receipeId,itemIndex) => {
  try {
    const receipeData = await Receipe.findOne({
      receipe_no : receipeId
    })
    if (!receipeData) {
      event.reply("delete-edit-receipe-error", "Receipe not found");
      return;
    }

    const subItems = receipeData.sub_item_details;
    subItems.splice(itemIndex, 1);
    receipeData.sub_item_details = subItems;
    receipeData.is_synced = false;
    await receipeData.save();

    const data = await Receipe.find();
    event.reply("fetch-receipe-data", JSON.stringify(data));
  } catch (error) {
    console.error("Error deleting receipe:", error);
    event.reply("delete-edit-receipe-error", "Error deleting receipe");
  }
});

// edit-receipe
ipcMain.on("edit-receipe", async (event, itemId, itemData) => {
  try {
    if (!itemData || !Array.isArray(itemData.sub_items_details)) {
      event.reply("edit-receipe-error", "Invalid data provided");
      return;
    }

    const recipeData = await Receipe.findOne({ receipe_no: itemId });
    if (!recipeData) {
      event.reply("edit-receipe-error", "Recipe not found");
      return;
    }
    
    itemData.sub_items_details = itemData.sub_items_details.filter(subItem =>
      subItem.item_name !== '' && subItem.quantity !== '' && subItem.quantity !== 'null'
    );

    itemData.sub_items_details.forEach(subItemData => {
      const normalizedItemName = subItemData.item_name.toLowerCase();
      const subItemIndex = recipeData.sub_item_details.findIndex(subItem =>
        subItem.item_name.toLowerCase() === normalizedItemName
      );
      console.log("subItemIndex "+subItemIndex)
      if (subItemIndex === -1) {
        recipeData.sub_item_details.push({
          item_name: subItemData.item_name,
          quantity: subItemData.quantity
        });
      } 
      else {
        // Update existing sub-item's quantity
        if (subItemData.quantity !== null || subItemData.item_name !== '') {
          recipeData.sub_item_details[subItemIndex].quantity = subItemData.quantity;
        } else {
          // Remove sub-item if quantity is null
          recipeData.sub_item_details.splice(subItemIndex, 1);
        }
      }
    });
    recipeData.is_synced = false
    await recipeData.save();

    const data = await Receipe.find();
    event.reply("fetch-receipe-data", JSON.stringify(data));
  } catch (error) {
    console.error("Error editing receipe:", error);
    event.reply("edit-receipe-error", "Error editing receipe");
  }
});


// fetch-purchase
ipcMain.on("fetch-purchase", async (event) => {
  try {
    const data = await Purchase.find();
    event.reply("fetch-purchase-data", data);
  } catch (error) {
    console.error("Error fetching purchase:", error);
    event.reply("fetch-error", "Error fetching purchase");
  }
})

// new-Purchase
ipcMain.on("new-Purchase", async (event, data) => {
  try {
    if (!data) {
      event.reply("new-Purchase-error", "No data provided");
      return
    }
    // add quantity and mrp inot Stock collection
    const stockData = await Stock.find({
      item_name: data.item_name,
      item_no: Number(data.item_no)
    })
    if (stockData.length > 0 || stockData !== undefined) {
      const stockItem = stockData[0]
      stockItem.quantity = (Number(stockItem.quantity) + Number(data.quantity)).toFixed(2)
      stockItem.mrp = Number(data.mrp)
      stockItem.total = (stockItem.mrp * stockItem.quantity).toFixed(2)
      stockItem.addded_at = Date.now()
      stockItem.is_synced = false
      await stockItem.save()
      let purchaseData = {
        purchase_no: 0,
        item_details: data,
        date: Date.now()
      }
      const lastItemNo = await Purchase.findOne().sort({ purchase_no: -1 });
      let purchaseNo = 1
      if (lastItemNo) {
        purchaseNo = lastItemNo.purchase_no + 1;
      }
      purchaseData.purchase_no = purchaseNo
      await Purchase.create(purchaseData)
    }
    else {
      await Stock.create(data)
      let purchaseData = {
        purchase_no: 0,
        item_details: data,
        date: Date.now
      }
      const lastItemNo = await Purchase.findOne().sort({ purchase_no: -1 });
      let purchaseNo = 1
      if (lastItemNo) {
        purchaseNo = lastItemNo.purchase_no + 1;
      }
      purchaseData.purchase_no = purchaseNo
      await Purchase.create(purchaseData)
    }

    const newData = await Purchase.find()
    event.reply("fetch-purchase-data", newData);
  }
  catch (error) {
    console.error("Error saving Purchase:", error);
    event.reply("error-purchase-data", "error creating purchase")
  }
})

// fetch-user-rights
ipcMain.on("fetch-user-rights", async (event) => {
  try {
    const data = await UserRights.find();
    event.reply("fetch-user-rights-data", data);
  } catch (error) {
    console.error("Error fetching user rights:", error);
    event.reply("fetch-error", "Error fetching user rights");
  }
})

// fetch-user-rights by user_no
ipcMain.on("fetch-user-rights-by-user-no", async (event, user_no) => {
  try {
    const data = await UserRights.find({ user_no: user_no });
    event.reply("fetch-user-rights-data", data);
  } catch (error) {
    console.error("Error fetching user rights:", error);
    event.reply("fetch-error", "Error fetching user rights");
  }
})

// new-user-rights
ipcMain.on("new-user-right", async (event, data) => {
  try {
    if (!data) {
      event.reply("new-user-rights-error", "No data provided");
      return
    }
    await UserRights.create(data)
    const newData = await UserRights.find();
    event.reply("fetch-user-rights-data", newData);
  } catch (error) {
    console.error("Error creating user rights:", error);
    event.reply("new-user-rights-error", "Error creating user rights");
  }
})

// edit-user-rights
ipcMain.on("edit-user-rights", async (event, userID, usedData) => {
  try {
    usedData.is_synced = false
    if (!usedData) {
      event.reply("edit-user-rights-error", "No data provided");
      return
    }
    await UserRights.findOneAndUpdate({ user_no: userID }, usedData)
    const newData = await UserRights.find();
    event.reply("fetch-user-rights-data", newData);
  } catch (error) {
    console.error("Error editing user rights:", error);
    event.reply("edit-user-rights-error", "Error editing user rights");
  }
})

let cloudConnection;

ipcMain.on('sync-data', async (event) => {
  if (await isOnline()) {
    try {
      console.log("hello")
      await syncData(cloudConnection);
      event.reply('sync-data-success');
    } catch (error) {
      console.error('Error syncing data:', error);
      event.reply('sync-data-error', 'Error syncing data');
    }
  } else {
    event.reply('sync-data-error', 'No internet connection');
  }
});




const urlCloud = process.env.MONGO_URI_CLOUD
app.whenReady().then(async () => {
createWindow();
cloudConnection = await connectToCloudDB(urlCloud);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
    globalShortcut.unregisterAll();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});