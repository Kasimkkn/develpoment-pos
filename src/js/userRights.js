
const  Swal  = require("sweetalert2");

let apiUserRights = [];
function closeModal() {
  const edituserRightsModal = document.getElementById("edituserRightsModal");
  edituserRightsModal.classList.add("hidden");

  const userRightsModal = document.getElementById("userRightsModal");
  userRightsModal.classList.add("hidden");
}


const renderUserRightsOptions = (user) => {
  const UserRigthsOptions = document.getElementById("UserRigthsOptions")
  UserRigthsOptions.innerHTML = "";

  Object.entries(user._doc).forEach(([key, value]) => {
    if (typeof value === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced') {
      const displayName = key.replace(/_/g, " ");
      const statusSymbol = value ? "✅" : "❌";
      const optionContainer = document.createElement("div");
      optionContainer.classList.add("flex", "items-center", "gap-3");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = key;
      checkbox.id = key;
      if(statusSymbol == "✅"){
        checkbox.checked = true;
      }
      checkbox.name = "user_rights_options";
      optionContainer.appendChild(checkbox);

      const label = document.createElement("label");
      label.textContent = displayName; 
      label.setAttribute("for", key);
      optionContainer.appendChild(label);

      const status = document.createElement("span");
      status.textContent = statusSymbol;
      optionContainer.appendChild(status);

      UserRigthsOptions.appendChild(optionContainer);
    }
  });
}

function openEditUserRightsModal(userId) {
  const user = apiUserRights.find((user) => user._doc.user_no === userId);

  document.getElementById("first_name").value = user._doc.first_name;
  renderUserRightsOptions(user);

  const edituserRightsModal = document.getElementById("edituserRightsModal");
  edituserRightsModal.classList.remove("hidden");
  edituserRightsModal.classList.add("flex");
  edituserRightsModal.dataset.userId = userId;
}

const edituserRightsHandler = async () => {
  const userId = document.getElementById("edituserRightsModal").dataset.userId;

  try {
    const userRightsOptions = Array.from(document.querySelectorAll('input[name="user_rights_options"]:checked')).map(checkbox => checkbox.value);
    const userData = {
        ...userRightsOptions.reduce((acc, option) => {
            acc[option] = true;
            return acc;
        }, {})
    };
    ipcRenderer.send("edit-user-rights", userId, userData);

    const edituserRightsModal = document.getElementById("edituserRightsModal");
    edituserRightsModal.classList.add("hidden");
    edituserRightsModal.classList.remove("flex");
    fetchuser();
  } catch (error) {
    console.error("Error editing item:", error);
  }
};

const renderUserDropown = (userData) => {
    const userName = document.getElementById("new_first_name");
    userName.innerHTML = "";
    userData.forEach((user) => {
        // const userAlreadyExisits = apiUserRights.find((u) => u._doc.user_no == user._doc.user_no);
        // console.log(userAlreadyExisits)
        // if(userAlreadyExisits){
        //   console.log("User already exisits")
        //   return
        // }
        const option = document.createElement("option");
        option.value = `${user._doc.user_no} ${user._doc.first_name}`;
        option.textContent = user._doc.first_name;
        userName.appendChild(option);
    })
}

ipcRenderer.send("fetch-user");

ipcRenderer.on("user-data" , (event, data) => {
   renderUserDropown(data)
   renderDropdown(data);
});

const renderUserOptions = (userData) => {
    const userOptions = document.getElementById("UserOptions");
    userOptions.innerHTML = "";

    if (!userData || userData.length === 0) {
        console.error("No user data provided.");
        return;
    }

    const user = userData[0]._doc; 
    const userRights = Object.keys(user).filter(key => typeof user[key] === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced');

    userRights.forEach(right => {
        const optionContainer = document.createElement("div");
        optionContainer.classList.add("flex", "items-center" , "gap-3");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = right;
        checkbox.id = right;
        checkbox.name = "user_rights";
        optionContainer.appendChild(checkbox);

        const label = document.createElement("label");
        label.textContent = right.replace(/_/g, " "); // Convert underscore to space for display
        label.setAttribute("for", right);
        optionContainer.appendChild(label);

        userOptions.appendChild(optionContainer);
    });
};

const userRightsModalOpen = (userNo) => {
    const userRightsModal = document.getElementById("userRightsModal");
    userRightsModal.classList.remove("hidden");
    userRightsModal.classList.add("flex");
    const userRightsModalBody = document.getElementById("userRightsModalBody");
  
    const user = apiUserRights.find((user) => user._doc.user_no == userNo);
  
    const userRightsModalTitle = document.getElementById("userRightsModalTitle");
    userRightsModalTitle.innerHTML = `User Rights: ${user._doc.first_name} ${user._doc.last_name}`;
    
    const rightsHTML = Object.entries(user._doc).map(([key, value]) => {
      if (typeof value === 'boolean' && key !== 'user_no' && key !== 'first_name' && key !== 'is_synced') {
        const displayName = key.replace(/_/g, " "); 
        const statusSymbol = value ? "✅" : "❌";
        return `<span class="font-bold w-max flex items-center">${displayName}: ${statusSymbol}</span>`;
      }
      return ''; 
    }).join("");
  
    userRightsModalBody.innerHTML = `${rightsHTML}`;
  };
    
  const newUserRightsHandler = () => {
    try {
        const newUser = document.getElementById("new_first_name").value;
        const newUserNo = newUser.split(" ")[0];
        const newUserName = newUser.split(" ")[1];

        const userRightsOptions = Array.from(document.querySelectorAll('input[name="user_rights"]:checked')).map(checkbox => checkbox.value);
        
        if (newUserNo === "" || userRightsOptions.length === 0) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'All fields are required!',
                timer: 1000
            });

            return;
        }

        const userData = {
            user_no: newUserNo,
            first_name: newUserName,
            ...userRightsOptions.reduce((acc, option) => {
                acc[option] = true;
                return acc;
            }, {})
        };

        ipcRenderer.send("new-user-right", userData);

        const newUserRightsModal = document.getElementById("newUserRightsModal");
        newUserRightsModal.classList.add("hidden");
        newUserRightsModal.classList.remove("flex");
        window.location.reload(true);
        fetchuser();
    } catch (error) {
        ipcRenderer.on("new-user-error", (event, error) => {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error,
                timer: 1000,
            });
            setTimeout(() => {
                location.reload(true);
            }, 1000);
        });
    }
};


const searchInput = document.getElementById("table_search_item");

searchInput.addEventListener("input", () => {
  const searchText = searchInput.value.toLowerCase();
  const filteredUser = apiUserRights.filter((user) =>
    user._doc.first_name.toLowerCase().includes(searchText)
  );
  renderUser(filteredUser);
});

const userFilterDropdown = document.getElementById("userFilterDropdown");
userFilterDropdown.addEventListener("change", (event) => {
  const selecteduser = event.target.value;
  if (selecteduser === "0") {
    renderUser(apiUserRights);
  } else {
    const filteredUser = apiUserRights.filter(
      (user) => user._doc.user_role === selecteduser
    );
    renderUser(filteredUser);
  }
});

const renderDropdown = (users) => {
  userFilterDropdown.innerHTML = "";
  const allusersOption = document.createElement("option");
  allusersOption.textContent = "All users";
  allusersOption.value = "0";
  userFilterDropdown.appendChild(allusersOption);

  users.forEach((user) => {
    const option = document.createElement("option");
    option.textContent = user._doc.first_name + " " + user._doc.last_name;
    option.value = user._doc.user_no;
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
    </td>
<td class="px-6 py-4">
<button type="button" 
onClick="userRightsModalOpen(${user._doc.user_no})"
data-modal-target="userRightsModal" data-modal-show="userRightsModal"
class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
 User Rights</button>
<td class="px-6 py-4">
  <button type="button" 
  onClick="openEditUserRightsModal(${user._doc.user_no})"
  data-modal-target="edituserRightsModal" data-modal-show="edituserRightsModal"
  class="inline-flex items-center justify-between rounded-md text-sm  h-10 px-4 py-2 w-max mb-2 beautyBtn text-white">
  Edit user</button>
</td>
`;

    tbody.appendChild(tr);
  });
};

const fetchuser = () => {
  ipcRenderer.send("fetch-user-rights");
};

ipcRenderer.on("fetch-user-rights-data", (event, userData) => {
  apiUserRights = userData;
  renderUser(apiUserRights);
  renderUserOptions(apiUserRights);
});

document.addEventListener("DOMContentLoaded", () => {
  fetchuser();
  renderDropdown(apiUserRights);
  renderUserOptions(apiUserRights);
});
