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
});
/*HEADERS END */

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
