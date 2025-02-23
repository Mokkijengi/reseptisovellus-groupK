//links to newUserPopup.html in the views folder

//load the new user registration popup
document.addEventListener("DOMContentLoaded", function () {
    fetch("html/newUserPopup.html") // Adjust path if needed
        .then(response => response.text())
        .then(data => {
            document.getElementById("newUserPopupContainer").innerHTML = data;
            console.log("New User Popup loaded successfully.");

            document.getElementById("newUserForm").addEventListener("submit", registerNewUser);
        })
        .catch(error => console.error("Error loading newUserPopup.html:", error));
});

function openNewUserPopup() {
  document.getElementById("newUserPopup").style.display = "flex";
}
function closeNewUserPopup() {
  document.getElementById("newUserPopup").style.display = "none";
}

//handles new user registration form submit
async function registerNewUser(event) { //async so we can use await to get the response
    event.preventDefault(); // Prevent form submission (page reload)

    let fullName = document.getElementById("newFullName").value;
    let username = document.getElementById("newUsername").value;
    let email = document.getElementById("newEmail").value;
    let password = document.getElementById("newPassword").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    console.log("password: ", password);
    console.log("confirmPassword: ", confirmPassword);

    if (password !== confirmPassword) {
        console.error("Passwords do not match!");
        alert("Passwords do not match! ALERT");
        return;
    }

    let newUser = {
        fullName: fullName,
        username: username,
        email: email,
        password: password
    };

    console.log("New User Registration:", newUser); //for debugging

    try {
        const response = await fetch("http://localhost:3000/userRoute/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newUser)
        });

        const result = await response.json();
        if (response.ok) {
            alert("Registration successful!");
            closeNewUserPopup();
        } else {
            alert(result.message || "Registration failed.");
        }
    } catch (error) {
        console.error("Error registering user:", error);
        alert("An error occurred while registering.");
    }
}