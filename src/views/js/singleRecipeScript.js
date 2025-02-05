document.addEventListener("DOMContentLoaded", async function () {
  fetch("global-headers.html")
    .then((response) => response.text())
    .then((data) => {
      const globalHeader = document.querySelector("#global-header");
      if (globalHeader) globalHeader.innerHTML = data;
    })
    .catch((error) => console.error("Error loading global header:", error));

  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id"); // Get the ID from the URL query parameters

  if (!recipeId) {
    document.body.innerHTML = "<h1>Recipe not found!</h1>";
    return;
  }

  try {
    // Fetch recipe details from backend by ID
    const response = await fetch(
      `/recipeRoute/recipe/${encodeURIComponent(recipeId)}`
    );
    console.log("Response:", response);
    if (!response.ok)
      throw new Error(`Error fetching recipe: ${response.status}`);

    const recipe = await response.json();

    document.getElementById("recipe-title").textContent = recipe.title;
    document.getElementById("recipe-image").src =
      recipe.image_url || "images/default.jpg";
    document.getElementById("recipe-description").textContent =
      recipe.description;
    document.getElementById("recipe-author").textContent = `By: ${
      recipe.author || "Unknown"
    }`;

    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";
    // Ensure ingredients is an array before calling forEach
    (Array.isArray(recipe.ingredients)
      ? recipe.ingredients
      : recipe.ingredients.split(",")
    ).forEach((ingredient) => {
      const li = document.createElement("li");
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });

    const instructionsList = document.getElementById("instructions-list");
    instructionsList.innerHTML = "";
    // Ensure instructions is an array before calling forEach
    (Array.isArray(recipe.instructions)
      ? recipe.instructions
      : recipe.instructions.split(",")
    ).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      instructionsList.appendChild(li);
    });
  } catch (error) {
    console.error("Error fetching recipe:", error);
    document.body.innerHTML = "<h1>Recipe not found!</h1>";
  }
});

// Tähti-arvostelu
const stars = document.querySelectorAll("#star-rating .star");
stars.forEach((star) => {
  star.addEventListener("click", function () {
    const rating = this.getAttribute("data-value");
    stars.forEach((s) => s.classList.remove("selected"));
    for (let i = 0; i < rating; i++) {
      stars[i].classList.add("selected");
    }
    alert(`You rated this recipe ${rating} stars!`);
  });
});

// Suosikki-nappula
const favoriteButton = document.getElementById("favoriteButton");
const favoriteMessage = document.getElementById("favoriteMessage");
favoriteButton.addEventListener("click", function () {
  // Tallennetaan suosikki localStorageen
  const params = new URLSearchParams(window.location.search);
  const recipeName = params.get("name");
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  if (!favorites.includes(recipeName)) {
    favorites.push(recipeName);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    favoriteMessage.style.display = "block";
    setTimeout(() => (favoriteMessage.style.display = "none"), 2000);
  } else {
    alert("This recipe is already in your favorites!");
  }
});
