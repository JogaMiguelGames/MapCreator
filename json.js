// json.js
fetch('manifest.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to load manifest.json');
    }
    return response.json();
  })
  .then(manifest => {
    if (manifest.title) {
      document.title = manifest.title;
    }
  })
  .catch(error => {
    console.error('Error loading manifest.json:', error);
  });
