/* HEADER FOR ECERY PAGE, LOADED LIKE THIS! */
// JavaScript to load the header dynamically
/*
document.addEventListener("DOMContentLoaded", function () {
    fetch("headers.html")
        .then(response => response.text())
        .then(data => {
            document.querySelector("header").innerHTML = data;
        })
        .catch(error => console.error("Error loading header:", error));
});
/*HEADERS END */

/* log in page, login, new user, forgot password popup, access to site without log in */

document.addEventListener("DOMContentLoaded", function () {
  fetch("global-headers.html")
    .then((response) => response.text())
    .then((data) => {
      const globalHeader = document.querySelector("#global-header");
      if (globalHeader) {
        globalHeader.innerHTML = data;
      } else {
        console.error("No element with ID 'global-header' found.");
      }
    })
    .catch((error) => console.error("Error loading global header:", error));

});

function openLoginPopup() {
  document.getElementById("loginModal").style.display = "flex";
}

function closeLoginPopup() {
  document.getElementById("loginModal").style.display = "none";
}

function newUser() {
  alert("Redirecting to new user registration...");
}

// Prevent form from submitting (for demo purposes)
document
  .getElementById("loginForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    alert("Login form submitted!");
    closeLoginPopup();
  });

// Open the modal
function openLoginPopup() {
  document.getElementById("loginModal").style.display = "flex";
}

// Close the modal
function closeLoginPopup() {
  document.getElementById("loginModal").style.display = "none";
}

function openForgotPasswordPopup() {
  document.getElementById("forgotPasswordPopup").style.display = "flex";
}

function closeForgotPasswordPopup() {
  document.getElementById("forgotPasswordPopup").style.display = "none";
}

function handleForgotPassword(event) {
  event.preventDefault(); // Prevent form submission
  alert("If your email was correct, the link has been sent to it.");
  closeForgotPasswordPopup();
}

//SEND TEST EMAIL FORGOT PASSWORD
async function sendResetEmail(event) {
  event.preventDefault();
  const email = document.getElementById("resetEmail").value;

  try {
    const response = await fetch("http://localhost:3000/send-reset-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();
    if (response.ok) {
      alert("If your email is correct, a password reset link has been sent.");
      console.log("Preview URL:", result.previewURL); // Useful for testing
    } else {
      alert(result.message || "Failed to send email.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("An error occurred while sending the email.");
  }
}

function basicUserSite() {
  alert("Taking you to the NOM's...");
  // Replace with the actual path to your recipe or main content page
  window.location.href = "/recipePage.html";
  //window.location.href = "https://www.google.com/";
}
