fetch('json/manifest.json')
  .then(response => {
    if (!response.ok) throw new Error('Failed to load manifest.json');
    return response.json();
  })
  .then(manifest => {
    if (manifest.page) {
      // Atualiza o título da página
      if (manifest.page.title) {
        document.title = manifest.page.title;
      }

      // Atualiza o ícone da página
      if (manifest.page.icon) {
        let link = document.querySelector("link[rel~='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.head.appendChild(link);
        }
        link.href = manifest.page.icon;
      }
    }
  })
  .catch(error => {
    console.error('Error loading manifest.json:', error);
  });
