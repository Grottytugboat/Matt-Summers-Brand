(() => {
  "use strict";
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const products = [...document.querySelectorAll('[data-category]')];
  const status = document.querySelector('.house-filter-count');
  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const filter = button.getAttribute('data-filter');
      let count = 0;
      buttons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      products.forEach((product) => {
        const visible = filter === 'all' || product.getAttribute('data-category') === filter;
        if (product instanceof HTMLElement) product.hidden = !visible;
        if (visible) count += 1;
      });
      if (status) status.textContent = filter === 'all' ? 'Showing all 3 brands' : `Showing ${count} ${count === 1 ? 'brand' : 'brands'}`;
    });
  });
})();
