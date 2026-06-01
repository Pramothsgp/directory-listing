const panels = [...document.querySelectorAll("[data-form-step]")];
let active = 0;
function draw() {
  panels.forEach((panel, index) =>
    panel.classList.toggle("active", index === active),
  );
  document
    .querySelectorAll("[data-step]")
    .forEach((label, index) =>
      label.classList.toggle("active", index === active),
    );
}
document.querySelectorAll("[data-next]").forEach((button) =>
  button.addEventListener("click", () => {
    active = Math.min(active + 1, panels.length - 1);
    draw();
  }),
);
document.querySelectorAll("[data-back]").forEach((button) =>
  button.addEventListener("click", () => {
    active = Math.max(active - 1, 0);
    draw();
  }),
);
