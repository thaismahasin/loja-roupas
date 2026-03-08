(function() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const product = getProductBySlug(slug) || PRODUCTS[0];
  const content = document.getElementById('productContent');
  const related = document.getElementById('relatedProducts');
  const pageTitle = document.querySelector('title');
  pageTitle.textContent = `${product.name} | Thais Mahasin`;

  let currentIndex = 0;
  const imageIndexes = product.gallery.map((item, index) => item.type === 'image' ? index : null).filter(index => index !== null);

  function swatches() {
    return (product.colors || []).map(color => `
      <span class="swatch" style="background:${color.hex}" title="${color.name}" aria-label="${color.name}"></span>
    `).join('');
  }

  function infoCard(title, content) {
    return `<div class="info-card"><strong>${title}</strong><span>${content}</span></div>`;
  }

  function renderViewer(index) {
    const item = product.gallery[index];
    const viewer = document.getElementById('viewer');
    viewer.innerHTML = '';
    if (item.type === 'video') {
      viewer.innerHTML = `
        <video controls playsinline poster="${item.poster || ''}">
          <source src="${item.src}" type="video/mp4" />
          Seu navegador não suporta vídeo.
        </video>
      `;
    } else {
      viewer.innerHTML = `
        <img id="viewerImage" src="${item.src}" alt="${item.alt || product.name}" />
        <button class="zoom-hint" type="button" id="openLightbox">🔍 Ampliar</button>
      `;
      document.getElementById('openLightbox').addEventListener('click', openLightbox);
      document.getElementById('viewerImage').addEventListener('click', openLightbox);
    }

    document.querySelectorAll('.gallery-thumbs button').forEach((button, i) => {
      button.classList.toggle('is-active', i === index);
    });
  }

  function renderPage() {
    const thumbs = product.gallery.map((item, index) => {
      const inner = item.type === 'video'
        ? `<div class="video-thumb">${item.poster ? `<img src="${item.poster}" alt="${item.alt || product.name}" />` : '▶'}</div>`
        : `<img src="${item.src}" alt="${item.alt || product.name}" loading="lazy" />`;
      return `<button type="button" data-index="${index}">${inner}</button>`;
    }).join('');

    const maybeVideo = product.gallery.find(item => item.type === 'video');

    content.innerHTML = `
      <div class="gallery-panel">
        <div class="viewer" id="viewer"></div>
        <div class="gallery-thumbs">${thumbs}</div>
      </div>
      <aside class="info-panel">
        <div class="badge">${product.availability}</div>
        <div class="subtitle">${product.line}</div>
        <h1>${product.name}</h1>
        <div class="price">${formatPriceBRL(product.price)}</div>
        <p class="description">${product.description}</p>
        <div class="swatches">${swatches()}</div>

        <div class="info-grid">
          ${infoCard('Categoria', product.categoryLabel)}
          ${infoCard('Tamanhos', (product.sizes || ['Sob consulta']).join(', '))}
          ${infoCard('Materiais', (product.materials || []).join(', '))}
          ${infoCard('Atendimento', 'Via WhatsApp ou prova presencial sob consulta')}
        </div>

        <ul class="highlights">
          ${(product.highlights || []).map(item => `<li>${item}</li>`).join('')}
        </ul>

        <div class="card-actions">
          <a class="btn btn-gold" href="${buildWhatsAppUrl(`Olá! Gostaria de saber mais sobre a peça ${product.name}.`)}" target="_blank" rel="noopener">Consultar no WhatsApp</a>
          <a class="btn btn-outline" href="pronta-entrega.html">Voltar ao catálogo</a>
        </div>

        <div class="product-story">
          <h3>Sobre a peça</h3>
          <p>${product.story || product.description}</p>
        </div>

        ${maybeVideo ? `
          <div class="detail-video">
            <h3>Vídeo da peça</h3>
            <video controls playsinline poster="${maybeVideo.poster || ''}">
              <source src="${maybeVideo.src}" type="video/mp4" />
              Seu navegador não suporta vídeo.
            </video>
          </div>
        ` : ''}
      </aside>
    `;

    document.querySelectorAll('.gallery-thumbs button').forEach(button => {
      button.addEventListener('click', () => {
        currentIndex = Number(button.dataset.index);
        renderViewer(currentIndex);
      });
    });

    renderViewer(currentIndex);
    document.getElementById('productNameBreadcrumb').textContent = product.name;
    const nameHero = document.getElementById('productHeroName');
    const descriptionHero = document.getElementById('productHeroDescription');
    const priceHero = document.getElementById('productHeroPrice');
    if (nameHero) nameHero.textContent = product.name;
    if (descriptionHero) descriptionHero.textContent = product.shortDescription;
    if (priceHero) priceHero.textContent = formatPriceBRL(product.price);
  }

  function renderRelated() {
    const others = PRODUCTS.filter(item => item.slug !== product.slug).slice(0, 3);
    related.innerHTML = others.map(item => `
      <article class="related-card">
        <a href="product.html?slug=${item.slug}">
          <img src="${item.gallery[0].src}" alt="${item.name}" loading="lazy" />
        </a>
        <div class="related-card-body">
          <div class="product-line">${item.categoryLabel}</div>
          <a href="product.html?slug=${item.slug}"><h4>${item.name}</h4></a>
          <div class="price">${formatPriceBRL(item.price)}</div>
          <a class="btn btn-outline" href="product.html?slug=${item.slug}">Ver peça</a>
        </div>
      </article>
    `).join('');
  }

  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  function openLightbox() {
    const item = product.gallery[currentIndex];
    if (!item || item.type !== 'image') return;
    lightbox.classList.add('is-open');
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || product.name;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    document.body.style.overflow = '';
  }
  function navigateLightbox(step) {
    const currentImagePosition = imageIndexes.indexOf(currentIndex);
    const nextImagePosition = (currentImagePosition + step + imageIndexes.length) % imageIndexes.length;
    currentIndex = imageIndexes[nextImagePosition];
    renderViewer(currentIndex);
    const item = product.gallery[currentIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt || product.name;
  }
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => navigateLightbox(1));
  lightbox.addEventListener('click', event => {
    if (event.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', event => {
    if (!lightbox.classList.contains('is-open')) return;
    if (event.key === 'Escape') closeLightbox();
    if (event.key === 'ArrowLeft') navigateLightbox(-1);
    if (event.key === 'ArrowRight') navigateLightbox(1);
  });

  applyContactInfo();
  enableTopbarScroll();
  renderPage();
  renderRelated();
})();
