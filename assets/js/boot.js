const saved = localStorage.getItem("branddigits-theme");
const preferred = matchMedia("(prefers-color-scheme: dark)").matches
  ? "dark"
  : "light";
document.documentElement.dataset.theme = saved || preferred;
