document.addEventListener("DOMContentLoaded", function () {
    // ✅ Load the global header
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

    // ✅ Handle password reset form submission
    const form = document.getElementById("resetPasswordForm");

    form.addEventListener("submit", async function (event) {
        event.preventDefault(); // Prevent page refresh

        // ✅ Get the email from the URL
        const urlParams = new URLSearchParams(window.location.search);
        const email = urlParams.get("email");

        if (!email) {
            alert("Missing email! Please request a reset link again.");
            return;
        }

        const newPassword = document.getElementById("newPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/email/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, newPassword }), // ✅ Pass email correctly
            });

            const result = await response.json();

            if (response.ok) {
                alert("Password reset successful! Redirecting to login page...");
                window.location.href = "index.html"; // Redirect to front page
            } else {
                alert(result.error || "Password reset failed.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("An error occurred while resetting your password.");
        }
    });
});
