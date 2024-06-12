

const loggedInUserData = localStorage.getItem("loggedInUser");
if (loggedInUserData) {
  try {
    const loggedInUser = JSON.parse(loggedInUserData);
    const firstName = loggedInUser._doc.first_name;
    const lastName = loggedInUser._doc.last_name;


    const fullName = `${firstName} ${lastName}`;

    const usernameInput = document.getElementById("username");
    usernameInput.value = fullName;
    
  } catch (error) {
    console.error("Error parsing or accessing loggedInUser data:", error);
  }
} else {
  console.error("No loggedInUser data found in localStorage.");
}
