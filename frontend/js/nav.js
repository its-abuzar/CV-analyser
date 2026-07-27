// Navigation bar and footer

        function renderNav() {
            const navItems = ['home','dashboard','pricing','history'];
            const iconFor = p => p==='home'?'fa-house':p==='dashboard'?'fa-chart-pie':p==='pricing'?'fa-tag':'fa-clock-rotate-left';
            return `
            <nav class="sticky top-0 z-50 px-4 md:px-8 py-3 no-print" style="background:rgba(15,23,42,0.7);backdrop-filter:blur(16px);border-bottom:1px solid var(--glass-border);">
                <div class="max-w-7xl mx-auto flex items-center justify-between">
                    <div class="flex items-center gap-3 cursor-pointer" onclick="navigate('home')" role="button" tabindex="0" aria-label="SkillMatch Pro home" onkeydown="if(event.key==='Enter')navigate('home')">
                        <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);"><i class="fas fa-bolt text-white text-sm"></i></div>
                        <span class="font-display font-bold text-lg tracking-tight" style="color:var(--text-primary)">SkillMatch<span style="color:var(--accent-cyan)">Pro</span></span>
                    </div>
                    <div class="hidden md:flex items-center gap-1">
                        ${navItems.map(p => `
                            <button onclick="navigate('${p}')" class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${S.currentPage===p?'bg-white/10':''}" style="color:${S.currentPage===p?'var(--text-primary)':'var(--text-muted)'}" aria-current="${S.currentPage===p?'page':'false'}">
                                <i class="fas ${iconFor(p)} text-xs"></i>${p.charAt(0).toUpperCase()+p.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                    <div class="flex items-center gap-2">
                        <button onclick="toggleTheme()" class="p-2 rounded-xl transition hover:bg-white/5" style="border:1px solid var(--glass-border);" aria-label="${S.lightMode?'Switch to dark mode':'Switch to light mode'}"><i class="fas ${S.lightMode?'fa-moon':'fa-sun'}" style="color:var(--accent-cyan)"></i></button>
                        <button onclick="toggleMobileMenu()" class="md:hidden p-2 rounded-xl transition hover:bg-white/5" style="border:1px solid var(--glass-border);" aria-label="${S.mobileMenuOpen?'Close menu':'Open menu'}" aria-expanded="${S.mobileMenuOpen}"><i class="fas ${S.mobileMenuOpen?'fa-xmark':'fa-bars'}" style="color:var(--text-primary)"></i></button>
                    </div>
                </div>
                <div class="mobile-menu md:hidden max-w-7xl mx-auto ${S.mobileMenuOpen?'open':''}">
                    <div class="flex flex-col gap-1 pt-3">
                        ${navItems.map(p => `
                            <button onclick="navigate('${p}');toggleMobileMenu()" class="px-4 py-3 rounded-lg text-sm font-medium text-left flex items-center gap-2 ${S.currentPage===p?'bg-white/10':''}" style="color:${S.currentPage===p?'var(--text-primary)':'var(--text-muted)'}">
                                <i class="fas ${iconFor(p)} text-xs w-4"></i>${p.charAt(0).toUpperCase()+p.slice(1)}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </nav>`;
        }

        function renderFooter() {
            return `
            <footer class="no-print mt-16 px-4 md:px-8 py-10" style="border-top:1px solid var(--glass-border);">
                <div class="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
                    <div class="col-span-2 md:col-span-1">
                        <div class="flex items-center gap-2 mb-3">
                            <div class="w-6 h-6 rounded-md flex items-center justify-center" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);"><i class="fas fa-bolt text-white text-xs"></i></div>
                            <span class="font-display font-bold" style="color:var(--text-primary)">SkillMatch<span style="color:var(--accent-cyan)">Pro</span></span>
                        </div>
                        <p class="text-xs" style="color:var(--text-muted)">Technical CV analysis for engineers who want the numbers, not the fluff.</p>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3" style="color:var(--text-primary)">Product</h4>
                        <ul class="space-y-2" style="color:var(--text-muted)">
                            <li><button onclick="navigate('dashboard')" class="hover:text-cyan-400 transition">Analyze a CV</button></li>
                            <li><button onclick="navigate('pricing')" class="hover:text-cyan-400 transition">Pricing</button></li>
                            <li><button onclick="navigate('history')" class="hover:text-cyan-400 transition">History</button></li>
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3" style="color:var(--text-primary)">Tools</h4>
                        <ul class="space-y-2" style="color:var(--text-muted)">
                            ${Object.entries(MODES).slice(0,4).map(([key,mode])=>`<li><button onclick="navigate('dashboard')" class="hover:text-cyan-400 transition">${mode.label}</button></li>`).join('')}
                        </ul>
                    </div>
                    <div>
                        <h4 class="font-semibold mb-3" style="color:var(--text-primary)">Company</h4>
                        <ul class="space-y-2" style="color:var(--text-muted)">
                            <li><a href="#" class="hover:text-cyan-400 transition">About</a></li>
                            <li><a href="#" class="hover:text-cyan-400 transition">Privacy</a></li>
                            <li><a href="#" class="hover:text-cyan-400 transition">Terms</a></li>
                        </ul>
                    </div>
                </div>
                <div class="max-w-7xl mx-auto mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style="border-top:1px solid var(--glass-border);color:var(--text-muted)">
                    <span>&copy; ${new Date().getFullYear()} SkillMatch Pro. All rights reserved.</span>
                    <span>Built for engineers, by engineers.</span>
                </div>
            </footer>`;
        }
