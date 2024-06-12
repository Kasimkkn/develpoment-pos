
const  Swal  = require("sweetalert2");
let apiUser = [];
function closeModal() {
  const editModal = document.getElementById("edituserModal");
  editModal.classList.add("hidden");

  const newItemModal = document.getElementById("addNewuserModal");
  newItemModal.classList.add("hidden");
}

function openEditModal(userId) {
  const user = apiUser.find((user) => user._doc.user_no === userId);

  document.getElementById("first_name").value = user._doc.first_name;
  document.getElementById("last_name").value = user._doc.last_name;
  document.getElementById("user_id").value = user._doc.user_id;
  document.getElementById("password").value = user._doc.password;
  document.getElementById("user_role").value = user._doc.user_role;
  document.getElementById("status").value = user._doc.status;

  const edituserModal = document.getElementById("edituserModal");
  edituserModal.classList.remove("hidden");
  edituserModal.classList.add("flex");
  edituserModal.dataset.userId = userId;
}

const edituserHandler = async () => {
  const userId = document.getElementById("edituserModal").dataset.userId;

  try {
    const userData = {
      firstName: document.getElementById("first_name").value,
      lastName: document.getElementById("last_name").value,
      userId: document.getElementById("user_id").value,
      Password: document.getElementById("password").value,
      Role: document.getElementById("user_role").value,
      isActive: document.getElementById("status").value,
    };
    ipcRenderer.send("edit-user", userId, userData);

    const edituserModal = document.getElementById("edituserModal");
    edituserModal.classList.add("hidden");
    edituserModal.classList.remove("flex");
    fetchuser();
  } catch (error) {
    console.error("Error editing item:", error);
  }
};

const newuserHandler = () => {
  try {
    const newFirstNameInput = document.getElementById("new_first_name").value;
    const newLastNameInput = document.getElementById("new_last_name").value;
    const newUserIdInput = document.getElementById("new_user_id").value;
    const newPasswordInput = document.getElementById("new_user_password").value;
    const newMobileInput = document.getElementById("new_mobile_no").value;
    const newRoleInput = document.getElementById("new_user_role").value;
    const newStatusInput = document.getElementById("new_status").value;

   if(newFirstNameInput == "" || newLastNameInput == "" || newUserIdInput == "" || newPasswordInput == "" ||newMobileInput == "" || newRoleInput == "" || newStatusInput == "") {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'All fields are required!',
      timer: 1000
    })
    setTimeout(() => {
      location.reload(true);
    },1000)
   }
    const userData = {
      firstName: newFirstNameInput,
      lastName: newLastNameInput,
      userId: newUserIdInput,
      newPassword: newPasswordInput,
      newMobile: newMobileInput,
      newRole: newRoleInput,
      isActive: newStatusInput,
    };

    ipcRenderer.send("new-user", userData);

    const addNewuserModal = document.getElementById("addNewuserModal");
    addNewuserModal.classList.add("hidden");
    addNewuserModal.classList.remove("flex");
    location.reload(true);
    fetchuser();
  } catch (error) {
    ipcRenderer.on("new-user-error", (event, error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error,
          timer:1000,
        })
        setTimeout(() => {
          location.reload(true);
        },1000)
      })
  }
};

const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredProducts = apiUser.filter((user) =>
    user._doc.first_name.toLowerCase().includes(searchText)
  );
  renderUser(filteredProducts);
});

const userFilterDropdown = document.getElementById("userFilterDropdown");
userFilterDropdown.addEventListener("change", (event) => {
  const selecteduser = event.target.value;
  if (selecteduser === "0") {
    renderUser(apiUser);
  } else {
    const filteredProducts = apiUser.filter(
      (user) => user._doc.user_role === selecteduser
    );
    renderUser(filteredProducts);
  }
});

const renderDropdown = (users) => {
  userFilterDropdown.innerHTML = "";
  const allusersOption = document.createElement("option");
  allusersOption.textContent = "All users";
  allusersOption.value = "0";
  userFilterDropdown.appendChild(allusersOption);

  const uniqueRoles = new Set(users.map((user) => user._doc.user_role));

  uniqueRoles.forEach((user) => {
    const option = document.createElement("option");
    option.textContent = user;
    option.value = user;
    userFilterDropdown.appendChild(option);
  });
};

const renderUser = (users) => {
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  users.forEach((user) => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-secondary", "border-b", "hover:bg-primary");

    tr.innerHTML = `
<td scope="row" class="flex items-center px-6 py-4 text-black whitespace-nowrap">
  <div class="px-6 py-4">
    <div class="max-md:text-xs">${user._doc.user_no}</div>
  </div>
</td>
<td class="px-6 py-4">
    <div class="max-md:text-xs">${user._doc.first_name}</div>
    <div class="max-md:text-xs">ID : ${user._doc.user_id}</div>
    </td>
<td class="px-6 py-4">
    
    <div class="max-md:text-xs">${user._doc.user_role}</div>
    <div class="max-md:text-xs ${user._doc.status ? "bg-green-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded" : "bg-pink-800 text-white text-xs text-center w-max font-medium me-2 px-2.5 py-0.5 rounded"
      }">${user._doc.status ? "Active" : "Inactive"}</div>
    </td>
<td class="px-6 py-4">
  <button type="button" 
  onClick="openEditModal(${user._doc.user_no})"
  data-modal-target="edituserModal" data-modal-show="edituserModal"
  class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
  Edit user</button>
</td>
`;

    tbody.appendChild(tr);
  });
};

const fetchuser = () => {
  ipcRenderer.send("fetch-user");
};

ipcRenderer.on("user-data", (event, userData) => {
  apiUser = userData;
  renderDropdown(apiUser);
  renderUser(apiUser);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchuser();
  renderUser(apiUser);
  renderDropdown(apiUser);
});
