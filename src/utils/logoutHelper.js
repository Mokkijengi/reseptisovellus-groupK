//Testausta varten toiminnallisuus
function logout() {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    alert("You have been logged out.");
    window.location.href = "/";
  }
  
  module.exports = logout;
  