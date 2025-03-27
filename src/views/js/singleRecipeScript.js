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
    const response = await fetch(
      `/recipeRoute/recipe/${encodeURIComponent(recipeId)}`
    );
    if (!response.ok)
      throw new Error(`Error fetching recipe: ${response.status}`);
    const recipe = await response.json();

    document.getElementById("recipe-title").textContent = recipe.title;

    const img = document.getElementById("recipe-image");
    img.src = "src/images/default.jpg";

    try {
      const timestamp = new Date().getTime();
      const imageResponse = await fetch(
        `/recipeRoute/recipe/${recipe.id}/image?t=${timestamp}`
      );

      if (imageResponse.ok) {
        img.src = `/recipeRoute/recipe/${recipe.id}/image?t=${timestamp}`;
      } else {
        console.warn(
          `Image not found for recipe ID ${recipe.id}, using default.`
        );
      }
    } catch (error) {
      console.warn(`Error fetching image for recipe ID ${recipe.id}:`, error);
    }

    document.getElementById("recipe-description").textContent =
      recipe.description;
    document.getElementById("recipe-author").textContent = `By: ${
      recipe.author || "Unknown"
    }`;

    const ingredientsList = document.getElementById("ingredients-list");
    ingredientsList.innerHTML = "";
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
    (Array.isArray(recipe.instructions)
      ? recipe.instructions
      : recipe.instructions.split(",")
    ).forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      instructionsList.appendChild(li);
    });

    displayReviews(recipeId);
  } catch (error) {
    console.error("Error fetching recipe:", error);
    document.body.innerHTML = "<h1>Recipe not found!</h1>";
  }

  //lähetä resepti kaverille emaililla
  // Handle the Send Recipe via Email functionality
  document
    .getElementById("send-recipe-form")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent form submission

      const recipientEmail = document.getElementById("email").value;

      // Simple email validation
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
      if (!emailPattern.test(recipientEmail)) {
        alert("Please enter a valid email address.");
        return;
      }

      // Get the current page URL (this should be the recipe page link)
      const recipeLink = window.location.href; // Automatically gets the current URL (e.g., recipe page)

      const subject = "Check out this awesome recipe!";
      const body = `Hey! I found this awesome recipe and thought you’d like it. Here’s the link: ${recipeLink}`;

      // Create the mailto link
      const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;

      // Open the default email client with the pre-filled email
      window.location.href = mailtoLink;
    });
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
// 🔥 HAE JA NÄYTÄ ARVOSTELUJEN KOOSTE JA KOMMENTIT
async function displayReviews(recipeId) {
  try {
    const response = await fetch(`/reviewRoute/reviews/${recipeId}`);
    if (!response.ok) throw new Error("Failed to fetch reviews");

    const reviews = await response.json();
    const reviewContainer = document.getElementById("review-summary");
    reviewContainer.innerHTML = "<h2>Recipe Ratings & Reviews</h2>";

    if (reviews.length === 0) {
      reviewContainer.innerHTML += "<p>No reviews yet. Be the first to review!</p>";
      return;
    }

    let totalReviews = reviews.length;
    let ratings = [0, 0, 0, 0, 0];

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

    // ⭐ Näytetään jokaisen käyttäjän arvostelu ja kommentti
    reviewContainer.innerHTML += `<h3>User Reviews</h3>`;
    reviews.forEach((review) => {
      reviewContainer.innerHTML += `
        <div class="review-comment">
          <p><strong>${review.username || "Anonymous"}:</strong> ★${review.rating}</p>
          <p>${review.comment}</p>
        </div>
      `;
    });

  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}

// ❤️ SUOSIKKI-NAPPULA (Tietokantatallennuksella)
const favoriteButton = document.getElementById("favoriteButton");
const favoriteMessage = document.getElementById("favoriteMessage");

favoriteButton.addEventListener("click", async function () {
  const token = localStorage.getItem("token"); // Haetaan käyttäjän token
  if (!token) {
    alert("You must be logged in to add favorites.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const recipeId = params.get("id"); // Haetaan reseptin ID URL-parametreista

  try {
    const response = await fetch("http://localhost:3000/favorites/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Lähetetään käyttäjän token
      },
      body: JSON.stringify({ recipeId }),
    });

    const result = await response.json();

    if (response.ok) {
      favoriteMessage.style.display = "block";
      setTimeout(() => (favoriteMessage.style.display = "none"), 2000);
    } else {
      alert(result.message || "Failed to add to favorites.");
    }
  } catch (error) {
    console.error("Error adding favorite:", error);
    alert("An error occurred while adding to favorites.");
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
