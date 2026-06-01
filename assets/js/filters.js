const filterButton = document.querySelector("[data-filter-toggle]");
const filters = document.querySelector("[data-filters]");
if (filterButton && filters)
  filterButton.addEventListener(
    "click",
    () => (filters.hidden = !filters.hidden),
  );
