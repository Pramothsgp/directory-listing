const saved = localStorage.getItem("branddigits-theme");
document.documentElement.dataset.theme = saved || "light";
