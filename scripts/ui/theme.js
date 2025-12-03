// === Map Creator - scripts/ui/theme.js ===

function LoadTheme() {
    const savedTheme = JSON.parse(localStorage.getItem('mapCreator.Theme'));

    if (savedTheme) {
        const CSSLink = document.getElementById("PageTheme");
        CSSLink.href = savedTheme;
    }
}

function SetTheme(themeFile) {
    const CSSLink = document.getElementById("PageTheme");
    CSSLink.href = themeFile;

    localStorage.setItem('mapCreator.Theme', JSON.stringify(themeFile));
}

LoadTheme();
