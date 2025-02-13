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

// Open modal when clicking "Add Recipe"
document.getElementById("openModal").addEventListener("click", () => {
  const modal = document.getElementById("customModal");
  modal.show("Add New Recipe", generateRecipeForm());
});

// Generate dynamic form for adding a new recipe
function generateRecipeForm() {
  return `
        <form id="recipeForm">
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
            
            <label for="author">Author:</label>
            <input type="text" id="author" name="author" required>
            
            <label for="ingredients">Ingredients:</label>
            <textarea id="ingredients" name="ingredients" required></textarea>
            
            <label for="instructions">Instructions:</label>
            <textarea id="instructions" name="instructions" required></textarea>
            
            <label for="image_url">Image URL:</label>
            <input type="text" id="image_url" name="image_url">
            
            <label for="keywords">Keywords (comma separated):</label>
            <input type="text" id="keywords" name="keywords">
            
            <button type="submit" class="button">Submit</button>
        </form>
    `;
}

// Handle form submission to add a new recipe
document.addEventListener("submit", async function (event) {
  if (event.target.id === "recipeForm") {
    event.preventDefault();

    const formData = {
      title: document.getElementById("title").value,
      author_id: document.getElementById("author").value,
      ingredients: document.getElementById("ingredients").value,
      instructions: document.getElementById("instructions").value,
      image_url: document.getElementById("image_url").value || "images/default.jpg",
      keywords: document.getElementById("keywords").value,
      is_private: false,
    };

    try {
      const response = await fetch("/recipeRoute/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Recipe added successfully!");
        location.reload(); // Reload page to show the new recipe
      } else {
        const errorData = await response.json();
        alert("Error: " + errorData.error);
      }
    } catch (error) {
      console.error("Error submitting recipe:", error);
    }
  }
});
