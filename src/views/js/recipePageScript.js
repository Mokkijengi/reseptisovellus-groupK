/*main content page, search bar, and filter recipes, access to user's site, quickview recipes with cards */

/* HEADER FOR ECERY PAGE, LOADED LIKE THIS! */

// JavaScript to load the header dynamically
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

    // TOKEN TEST
  // DEBUG TOKEN -> näytä devtoolssissa
  const token = localStorage.getItem("token");
  console.log("Token in localStorage:", token);

  //get token for button (admin)
  const tokenButton = document.getElementById("tokenButton");
  if (token && tokenButton) {
    try {
      // Decode the payload (the second part of the JWT)
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const decoded = JSON.parse(payloadJson);
      console.log("Decoded token:", decoded);

      // Show the token button only if the role is "admin"! 
      if (decoded.role === "admin") {
        tokenButton.style.display = "block";
      } else {
        tokenButton.style.display = "none";
      }
    } catch (err) {
      console.error("Error decoding token:", err);
      tokenButton.style.display = "none";
    }
  } else if (tokenButton) {
    tokenButton.style.display = "none";
  }

  //LOGOUT
  //const token = localStorage.getItem("token");
  const logoutButton = document.getElementById("logoutButton");
  
  if (token) {
    logoutButton.style.display = "block";
  } else {
    logoutButton.style.display = "none";
  }
});
/*HEADERS END */

/*
//Eventlistener for login token, NOW FOR BUTTON
document.addEventListener("DOMContentLoaded", () => {
  // Retrieve the token from localStorage
  const token = localStorage.getItem("token");
  
  // Get the token button element
  const tokenButton = document.getElementById("tokenButton");
  
  // If a token exists, show the button; otherwise, hide it.
  if (token) {
    tokenButton.style.display = "block"; // or "" if your CSS defines it properly
  } else {
    tokenButton.style.display = "none";
  }
});
*/


const isLoggedIn = false; // Replace with actual login check

window.onload = () => {
  const userSiteButton = document.getElementById("userSiteButton");
  if (isLoggedIn) {
    userSiteButton.classList.remove("hidden");
  }
};

// Navigate to User Site
function goToUserSite() {
  alert("Navigating to your recipes...");
  window.location.href = "/userPage.html"; // Replace with the correct URL
}

//logout button
document.getElementById("logoutButton").addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("You have been logged out.");
  //to login page when log out
  window.location.href = "/"; // or your login page
});


function filterRecipes() {
  const searchBar = document.getElementById("recipe-search-bar");
  const filter = searchBar.value.toLowerCase();
  const recipes = document.querySelectorAll(".recipe");
  recipes.forEach((recipe) => {
    const title = recipe.querySelector("h2").textContent.toLowerCase();
    recipe.style.display = title.includes(filter) ? "block" : "none";
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/recipeRoute/recipes");

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const recipes = await response.json();
    console.log("Fetched recipes:", recipes); // 🛠️ Debuggausta varten

    if (!Array.isArray(recipes)) {
      throw new Error("Invalid response format: expected an array");
    }

    const recipeList = document.getElementById("recipe-list");
    recipeList.innerHTML = ""; // Tyhjennetään vanhat sisällöt

    recipes.forEach((recipe) => {
      const article = document.createElement("article");
      article.classList.add("recipe");

      const img = document.createElement("img");
      img.src = recipe.image_url || "images/default.jpg"; // Oletuskuva
      img.alt = recipe.title; // ✅ Muutettu "name" → "title"

      const title = document.createElement("h2");
      title.textContent = recipe.title; // ✅ Muutettu "name" → "title"

      const author = document.createElement("p");
      author.textContent = `By: ${recipe.author_id || "Unknown"}`; // 🛠️ Näytetään author_id, koska "author" puuttuu

      article.appendChild(img);
      article.appendChild(title);
      article.appendChild(author);
      article.addEventListener("click", () => navigateToRecipe(recipe.id));
      recipeList.appendChild(article);
    });
  } catch (error) {
    console.error("Error fetching recipes:", error);
  }
});

function navigateToRecipe(recipeId) {
  window.location.href = `/singleRecipe.html?id=${recipeId}`;
}
