/*//
Modalin käyttö:
Kopioi seuraavat koodinpätkät sivulle, jolla haluat käyttää modalia:


JS-fileen:

const modalContent = {
  title: "Otsikko",
  body: `
    <p>TÄnne sisälle tavaraa .</p>
    <script>
  
      alert("Scripti alert :D:D:D:D:D:D");
    </script>
  `,
};
document.getElementById("openModal").addEventListener("click", () => {
  // Get the custom modal and show it with title and body
  const modal = document.getElementById("customModal");
  modal.show(modalContent.title, modalContent.body);
});



HTML fileen:

 <Headiin> titlen alle:
 <script src="/src/utils/Modal/modal.js"> defer</script>
<link rel="stylesheet" href="/src/utils/Modal/modalStyle.css">

 <button id="openModal">Avaa Modal</button>    <--  Kunhan mätsää JS-filen id:n kanssa

  <custom-modal id="customModal"></custom-modal>




*/
class CustomModal extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
    <head>
    <link rel="stylesheet" href="src/utils/Modal/modalStyle.css">
    </head>
      <div id="customModal" class="modal">
        <div class="modal-content">
          <span class="close">&times;</span>
          <h2 id="modal-title"></h2>
          <p id="modal-body"></p>
        </div>
      </div>
    `;

    // Close the modal when clicking on the "X"
    this.querySelector(".close").addEventListener("click", () => {
      this.hide();
    });

    // Initially hide the modal
    this.style.display = "none";
  }

  show(title, body) {
    this.querySelector("#modal-title").innerText = title;

    // Set the body content as HTML (so we can include <script> tags)
    this.querySelector("#modal-body").innerHTML = body;

    // Dynamically execute any scripts within the modal body
    const scripts = this.querySelectorAll("#modal-body script");
    scripts.forEach((script) => {
      const newScript = document.createElement("script");
      newScript.text = script.innerText; // Copy the script content
      document.body.appendChild(newScript); // Execute the script
    });

    this.style.display = "block"; // Make the modal visible
  }

  // Hide the modal
  hide() {
    this.style.display = "none"; // Hide the modal
  }
}

customElements.define("custom-modal", CustomModal);
