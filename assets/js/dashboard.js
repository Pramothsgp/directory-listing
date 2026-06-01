document
  .querySelectorAll("[data-modal-open]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      document.querySelector(button.dataset.modalOpen)?.classList.add("open"),
    ),
  );
document
  .querySelectorAll("[data-modal-close]")
  .forEach((button) =>
    button.addEventListener("click", () =>
      button.closest(".modal")?.classList.remove("open"),
    ),
  );
