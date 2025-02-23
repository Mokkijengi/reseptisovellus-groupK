document.addEventListener("DOMContentLoaded", function () {

    //refers to the login form
    const loginButton = document.getElementById("loginButton");
    const userNameField = document.getElementById("username");
    const passwordField = document.getElementById("password"); //pitääkö muuttaa "password" -> "passwordField" ?

    //listen to loginbutton click
    loginButton.addEventListener("click", function (event) {
        event.preventDefault();
        //get the username and password from the form
        const username = userNameField.value;
        const password = passwordField.value;

        //simple check for empty fields
        if (!username || !password) {
            alert("Please fill in all fields");
            return;
        }

        //real check: POST info database
        fetch("http://localhost:3000/userRoute/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
          })
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Login failed");
                }
            return response.json();
            })
          
            .then((data) => {
                if (data.success) {
                    alert("Login successful");

                    localStorage.setItem("token", data.token); //store token in local storage to use in other pages
                    window.location.href = "/recipePage.html";
                } else {
                    alert("Login failed");
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("An error occurred while logging in.");
            });


        /*
        //simple check for username and password LATER: check from database
        if (username === "user" && password === "password") {
            alert("Login successful");
            window.location.href = "/recipePage.html";
        } else {
            alert("Login failed");
        }
        */
    });
});