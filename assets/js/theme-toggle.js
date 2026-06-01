const button = document.querySelector("[data-theme-toggle]");
if (button) {
  const draw = () =>
    (button.textContent =
      document.documentElement.dataset.theme === "dark" ? "☀" : "☾");
  draw();
  button.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("branddigits-theme", theme);
    draw();
  });
}
