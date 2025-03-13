document.addEventListener("DOMContentLoaded", async function () {
  fetch("global-headers.html")
    .then((response) => response.text())
    .then((data) => {
      const globalHeader = document.querySelector("#global-header");
      if (globalHeader) globalHeader.innerHTML = data;
    })
    .catch((error) => console.error("Error loading global header:", error));

  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id");

  if (!recipeId) {
    document.body.innerHTML = "<h1>Recipe not found!</h1>";
    return;
  }

  try {
    // Haetaan reseptin tiedot
    const response = await fetch(`/recipeRoute/recipe/${encodeURIComponent(recipeId)}`);
    if (!response.ok) throw new Error(`Error fetching recipe: ${response.status}`);
    const recipe = await response.json();

    document.getElementById("recipe-title").textContent = recipe.title;
    document.getElementById("recipe-image").src = recipe.image_url || "images/default.jpg";
    document.getElementById("recipe-description").textContent = recipe.description;
    document.getElementById("recipe-author").textContent = `By: ${recipe.author || "Unknown"}`;

    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";
    (Array.isArray(recipe.ingredients) ? recipe.ingredients : recipe.ingredients.split(",")).forEach((ingredient) => {
      const li = document.createElement("li");
      li.textContent = ingredient;
      ingredientsList.appendChild(li);
    });

    const instructionsList = document.getElementById("instructions-list");
    instructionsList.innerHTML = "";
    (Array.isArray(recipe.instructions) ? recipe.instructions : recipe.instructions.split(",")).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      instructionsList.appendChild(li);
    });

    displayReviews(recipeId);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    document.body.innerHTML = "<h1>Recipe not found!</h1>";
  }
});

// ⭐ TÄHTI-ARVOSTELUN TALLENNUS
document.querySelectorAll("#star-rating .star").forEach((star) => {
  star.addEventListener("click", async function () {
    const rating = this.getAttribute("data-value");
    const comment = prompt("Leave a comment for your review:");
    if (!comment) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to leave a review.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get("id");

    try {
      const response = await fetch("/reviewRoute/addReview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId, rating, comment }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      alert(`You rated this recipe ${rating} stars!`);
      displayReviews(recipeId);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review.");
    }
  });
});

// 🔥 HAE JA NÄYTÄ ARVOSTELUJEN KOOSTE
async function displayReviews(recipeId) {
  try {
    const response = await fetch(`/reviewRoute/reviews/${recipeId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");

    const reviews = await response.json();
    const reviewContainer = document.getElementById("review-summary");
    reviewContainer.innerHTML = "";

    const totalReviews = reviews.length;
    const ratings = [0, 0, 0, 0, 0];

    reviews.forEach((review) => {
      ratings[review.rating - 1]++;
    });

    ratings.reverse().forEach((count, index) => {
      const star = 5 - index;
      const percentage = totalReviews ? (count / totalReviews) * 100 : 0;

      reviewContainer.innerHTML += `
        <div class="review-row">
          <span>★ ${star}</span>
          <div class="review-bar">
            <div class="filled-bar" style="width:${percentage}%"></div>
          </div>
          <span>${count}</span>
        </div>
      `;
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}

// ❤️ SUOSIKKI-NAPPULA
const favoriteButton = document.getElementById("favoriteButton");
const favoriteMessage = document.getElementById("favoriteMessage");
favoriteButton.addEventListener("click", function () {
  const params = new URLSearchParams(window.location.search);
  const recipeName = document.getElementById("recipe-title").textContent;
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

async function refreshToken() {
  const oldToken = localStorage.getItem("token");
  if (!oldToken) return;

  try {
    const response = await fetch("/userRoute/refreshToken", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${oldToken}`,
      },
    });

    if (!response.ok) throw new Error("Failed to refresh token");

    const data = await response.json();
    localStorage.setItem("token", data.token); // Tallenna uusi token
    console.log("Token refreshed successfully.");
  } catch (error) {
    console.error("Error refreshing token:", error);
    localStorage.removeItem("token"); // Poista vanha token, jos uusiminen epäonnistuu
  }
}

//haloo
