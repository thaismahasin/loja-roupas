(function() {
  const grid = document.getElementById('catalogGrid');
  const filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  const countEl = document.getElementById('catalogCount');
  let currentFilter = 'todos';

  function productCard(product) {
    const thumbs = product.gallery.slice(0, 3).map(item => {
      if (item.type === 'video') {
        const poster = item.poster ? `<img src="${item.poster}" alt="${item.alt || product.name}" />` : '▶';
        return `<div class="video-thumb">${poster}</div>`;
      }
      return `<img src="${item.src}" alt="${item.alt || product.name}" loading="lazy" />`;
    }).join('');

    const swatches = (product.colors || []).map(color => `
      <span class="swatch" style="background:${color.hex}" title="${color.name}" aria-label="${color.name}"></span>
    `).join('');

    return `
      <article class="product-card">
        <a class="product-card-media-link" href="product.html?slug=${product.slug}" aria-label="Abrir ${product.name}">
          <div class="product-card-media">
            <img class="main-thumb" src="${product.gallery[0].src}" alt="${product.gallery[0].alt || product.name}" loading="lazy" />
            <div class="product-thumb-row">${thumbs}</div>
          </div>
        </a>
        <div class="product-card-body">
          <div class="product-meta">
            <span class="badge">${product.availability}</span>
            <span class="product-line">${product.categoryLabel}</span>
          </div>
          <a class="product-title-link" href="product.html?slug=${product.slug}"><h3>${product.name}</h3></a>
          <p>${product.shortDescription}</p>
          <div class="swatches">${swatches}</div>
          <div class="price">${formatPriceBRL(product.price)}</div>
          <div class="card-actions">
            <a class="btn btn-gold" href="product.html?slug=${product.slug}">Ver detalhes</a>
            <a class="btn btn-outline" href="${buildWhatsAppUrl(`Olá! Tenho interesse na peça ${product.name}.`) }" target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
      </article>
    `;
  }

  function render() {
    const filtered = PRODUCTS.filter(product => currentFilter === 'todos' || product.category === currentFilter);
    countEl.textContent = `${filtered.length} peça${filtered.length === 1 ? '' : 's'} exibida${filtered.length === 1 ? '' : 's'}`;

    if (!filtered.length) {
      grid.innerHTML = `<div class="empty-state">Nenhum produto encontrado para esse filtro.</div>`;
      return;
    }

    grid.innerHTML = filtered.map(productCard).join('');
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      currentFilter = button.dataset.filter;
      filterButtons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      render();
    });
  });

  applyContactInfo();
  enableTopbarScroll();
  render();
})();
