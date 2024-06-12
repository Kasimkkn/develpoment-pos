const { default: Swal } = require("sweetalert2");
const saveBtn = document.getElementById("saveBtn");



const billInfoStr = localStorage.getItem("billInfo");

if (billInfoStr == null) {
    ipcRenderer.send("get-bill-info");
    ipcRenderer.on("fetch-bill-info-success", (event, data) => {
        localStorage.setItem("billInfo", JSON.stringify(data));
        const billInfo = data;
    document.getElementById("customer_Id").value = billInfo._doc.customer_id || "";
    document.getElementById("customer_Restuarant").value = billInfo._doc.resturant_name || "";
    document.getElementById("customer_name").value = billInfo._doc.customer_name || "";
    document.getElementById("customer_no").value = billInfo._doc.customer_mobile || "";
    document.getElementById("bill_footer").value = billInfo._doc.bill_footer || "";
    document.getElementById("hsn_code").value = billInfo._doc.HSN_code || "";
    document.getElementById("gstin_no").value = billInfo._doc.GSTIN_no || "";
    document.getElementById("fssai_code").value = billInfo._doc.FSSAI_code || "";
    document.getElementById("loyalty_amount").value = billInfo._doc.loyalty_amount || "";
    document.getElementById("loyalty_points").value = billInfo._doc.loyalty_points || "";
    document.getElementById("how_much_points").value = billInfo._doc.how_much_points || "";
    document.getElementById("how_much_amount").value = billInfo._doc.how_much_amount || "";
    
    });
}
else{
    const billInfo = JSON.parse(billInfoStr);
    document.getElementById("customer_Id").value = billInfo._doc.customer_id || "";
    document.getElementById("customer_Restuarant").value = billInfo._doc.resturant_name || "";
    document.getElementById("customer_name").value = billInfo._doc.customer_name || "";
    document.getElementById("customer_no").value = billInfo._doc.customer_mobile || "";
    document.getElementById("bill_footer").value = billInfo._doc.bill_footer || "";
    document.getElementById("hsn_code").value = billInfo._doc.HSN_code || "";
    document.getElementById("gstin_no").value = billInfo._doc.GSTIN_no || "";
    document.getElementById("fssai_code").value = billInfo._doc.FSSAI_code || "";
    document.getElementById("loyalty_amount").value = billInfo._doc.loyalty_amount || "";
    document.getElementById("loyalty_points").value = billInfo._doc.loyalty_points || "";
    document.getElementById("how_much_points").value = billInfo._doc.how_much_points || "";
    document.getElementById("how_much_amount").value = billInfo._doc.how_much_amount || "";
}

saveBtn.addEventListener("click", () => {
    const customer_id = JSON.parse(localStorage.getItem("billInfo"))._doc.customer_id;
    const customerId = document.getElementById("customer_Id").value;
    const customerRestaurant = document.getElementById("customer_Restuarant").value;
    const customerName = document.getElementById("customer_name").value;
    const customerNo = document.getElementById("customer_no").value;
    const billFooter = document.getElementById("bill_footer").value;
    const hsnCode = document.getElementById("hsn_code").value;
    const gstinNo = document.getElementById("gstin_no").value;
    const fssaiCode = document.getElementById("fssai_code").value;
    const loyalty_amount = document.getElementById("loyalty_amount").value;
    const loyalty_points = document.getElementById("loyalty_points").value;
    const how_much_points = document.getElementById("how_much_points").value;
    const how_much_amount = document.getElementById("how_much_amount").value;
    const billInfo = {
        customer_id: customerId,
        resturant_name: customerRestaurant,
        customer_name: customerName,
        customer_mobile: customerNo,
        bill_footer: billFooter,
        HSN_code: hsnCode,
        GSTIN_no: gstinNo,
        FSSAI_code: fssaiCode,
        loyalty_amount,
        loyalty_points,
        how_much_amount,
        how_much_points
    };

    try {
        ipcRenderer.send("save-bill-info",customer_id,billInfo);
        ipcRenderer.on("save-bill-info-error", () => {
            console.log("Error saving bill info");
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error saving bill info',
                timer: 1000
            })
            // empty all the input fields
            setTimeout(() => {
                location.reload();
            }, 1000)
        })
        ipcRenderer.on("save-bill-info-success", (event, data) => {
            localStorage.setItem("billInfo", JSON.stringify(data));
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Bill info saved successfully',
                timer: 1000
            })
            setTimeout(() => {
                location.reload();
            }, 1000)
        })
    } catch (error) {
        console.log("Error saving bill info:", error);
    }
})