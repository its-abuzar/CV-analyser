// Main render loop and page router
// render() rebuilds the #app markup from current state every time something changes.

        // ===========================================================
        // RENDER ENGINE
        // ===========================================================
        function render() {
            document.getElementById('app').innerHTML = `
                ${renderNav()}
                <main class="max-w-7xl mx-auto px-4 md:px-8 py-6">
                    ${renderPage('home')}
                    ${renderPage('dashboard')}
                    ${renderPage('pricing')}
                    ${renderPage('history')}
                </main>
                ${renderFooter()}
                ${renderFloating()}
                ${renderToast()}
                ${renderRewriteModal()}
                ${renderShareModal()}
            `;
            if (S.analysisDone && S.results) {
                setTimeout(() => { animateScore(); }, 200);
                if (S.showDiff) setTimeout(drawDiffLines, 400);
            }
        }

        function renderPage(id) {
            const active = S.currentPage === id ? 'active' : '';
            let content = '';
            if (id === 'home') content = renderHome();
            else if (id === 'dashboard') content = renderDashboard();
            else if (id === 'pricing') content = renderPricing();
            else if (id === 'history') content = renderHistory();
            return `<section id="page-${id}" class="page ${active}">${content}</section>`;
        }
