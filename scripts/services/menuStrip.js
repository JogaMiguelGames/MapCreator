document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelector(".menu-btn");
  const dropdown = document.querySelector(".menu-strip .dropdown");

  menuBtn.addEventListener("click", () => {
    dropdown.style.display = dropdown.style.display === "flex" ? "none" : "flex";
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-strip")) {
      dropdown.style.display = "none";
    }
  });

  document.getElementById("fileSave").addEventListener("click", () => {
    document.getElementById("saveButton").click();
    dropdown.style.display = "none";
  });

  document.getElementById("fileLoad").addEventListener("click", () => {
    document.getElementById("loadButton").click();
    dropdown.style.display = "none";
  });
});
