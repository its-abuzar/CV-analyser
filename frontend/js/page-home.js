// Home page

        function renderHome() {
            const steps = [
                { icon: 'fa-file-arrow-up', title: 'Upload CV & job description', desc: 'PDF, DOCX, pasted text, or a LinkedIn/GitHub link — whatever you have on hand.' },
                { icon: 'fa-sliders', title: 'Pick a technical lens', desc: 'Tech stack gaps, experience depth, achievements, structure, interview prep, or salary intel.' },
                { icon: 'fa-chart-pie', title: 'Get a scored, actionable report', desc: 'Exact keywords to add, rewrite suggestions, and a match score backed by real data points.' }
            ];
            return `
            <div class="text-center py-12">
                <h1 class="font-display font-extrabold text-4xl md:text-6xl tracking-tight leading-tight">Match Smarter. <br><span style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">Not Harder.</span></h1>
                <p class="text-lg md:text-xl mt-4 max-w-2xl mx-auto" style="color:var(--text-secondary)">Upload your CV and the job description. Get a hardcore technical analysis – no fluff, just facts.</p>
                <div class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                    <button onclick="navigate('dashboard')" class="px-8 py-4 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);box-shadow:0 0 40px rgba(139,92,246,0.3);"><i class="fas fa-wand-magic-sparkles mr-2"></i>Analyze Now</button>
                    <button onclick="navigate('pricing')" class="px-8 py-4 rounded-2xl text-lg font-bold transition-all hover:bg-white/5" style="border:1px solid var(--glass-border);color:var(--text-primary);">See Pricing</button>
                </div>
                <p class="text-xs mt-4" style="color:var(--text-muted)"><i class="fas fa-lock mr-1"></i>Your CV never leaves this session unless you choose to share a report.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                ${steps.map((s,i) => `
                    <div class="glass p-6 relative">
                        <span class="absolute top-4 right-5 text-4xl font-extrabold opacity-10 font-mono">${String(i+1).padStart(2,'0')}</span>
                        <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style="background:rgba(6,182,212,0.12);"><i class="fas ${s.icon}" style="color:var(--accent-purple)"></i></div>
                        <h3 class="font-bold">${s.title}</h3>
                        <p class="text-sm mt-2 text-muted">${s.desc}</p>
                    </div>
                `).join('')}
            </div>

            <h2 class="text-2xl font-bold text-center mt-16 mb-2">Seven technical lenses, one upload</h2>
            <p class="text-center text-sm mb-8" style="color:var(--text-muted)">Pick the tool that matches what you need right now.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                ${Object.entries(MODES).map(([key, mode]) => `
                    <div class="glass p-6 text-center">
                        <div class="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style="background:rgba(139,92,246,0.12);"><i class="fas ${mode.icon} text-2xl" style="color:var(--accent-cyan)"></i></div>
                        <h3 class="font-bold text-lg">${mode.label}</h3>
                        <p class="text-sm mt-2 text-muted">${mode.desc}</p>
                        <button onclick="navigate('dashboard')" class="mt-4 text-xs px-4 py-2 rounded-lg border border-glass hover:bg-white/5 transition">Try it</button>
                    </div>
                `).join('')}
            </div>`;
        }
