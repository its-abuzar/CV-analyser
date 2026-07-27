// Analysis results: report cards shown after an analysis finishes

        // ===========================================================
        // RESULTS
        // ===========================================================
        function renderResults() {
            const r = S.results;
            const mode = S.analysisMode || 'core';
            const features = MODES[mode]?.features || [];

            const show = (f) => features.includes(f);

            let cards = `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${renderScoreCard(r)}${renderSkillBars(r)}</div>`;

            if (show('techstack')) cards += `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${renderTechStack(r)}${renderIndustryTerms(r)}</div>`;
            if (show('industries')) cards += `<div>${renderIndustryTerms(r)}</div>`;
            if (show('experience')) cards += `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${renderExperience(r)}${renderProjects(r)}</div>`;
            if (show('projects')) cards += `<div>${renderProjects(r)}</div>`;
            if (show('achievements')) cards += `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${renderAchievements(r)}${renderActionVerbs(r)}</div>`;
            if (show('verbs')) cards += `<div>${renderActionVerbs(r)}</div>`;
            if (show('structure')) cards += `<div class="grid grid-cols-1 md:grid-cols-2 gap-5">${renderStructure(r)}${renderReadability(r)}</div>`;
            if (show('readability')) cards += `<div>${renderReadability(r)}</div>`;
            if (show('interviews')) cards += `<div>${renderInterviewQs(r)}</div>`;
            if (show('salary')) cards += `<div>${renderSalary(r)}</div>`;

            cards += renderDiffView(r);

            return `
            <div class="mt-8 space-y-6" id="dashboard">
                <div class="flex items-center justify-between">
                    <h3 class="text-xl font-bold" style="color:var(--accent-cyan)">${MODES[mode]?.label || 'Analysis'} Results</h3>
                    <button onclick="resetAnalysis()" class="text-xs px-4 py-2 rounded-lg border border-glass hover:bg-white/5 transition"><i class="fas fa-rotate-left mr-1"></i>New Analysis</button>
                </div>
                ${cards}
            </div>`;
        }

        // ===========================================================
        // TECHNICAL CARD COMPONENTS
        // ===========================================================
        function renderScoreCard(r) {
            const circ=2*Math.PI*70; const off=circ*(1-r.matchScore/100);
            return `<div class="glass p-6 flex flex-col items-center"><h3 class="text-xs font-semibold uppercase tracking-widest self-start text-muted">Overall Match</h3>
                <svg width="160" height="160"><circle cx="80" cy="80" r="70" fill="none" stroke="var(--glass-border)" stroke-width="10"/>
                <circle cx="80" cy="80" r="70" fill="none" stroke="url(#scoreG)" stroke-width="10" stroke-dasharray="${circ}" stroke-dashoffset="${circ}" class="score-ring" id="scoreRing"/>
                <defs><linearGradient id="scoreG"><stop offset="0%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#06b6d4"/></linearGradient></defs></svg>
                <div class="mt-1 text-center"><span class="text-3xl font-extrabold" id="scoreNum">0</span></div>
                <div class="mt-2 p-2 rounded-xl w-full text-center bg-white/5"><span class="text-xs text-muted">${r.confidence}% confidence (${r.confidencePoints} data points)</span></div>
            </div>`;
        }

        function renderSkillBars(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted">Skill Fit</h3>
                ${[{l:'Hard Skills',v:r.hardSkills,c:'#8b5cf6'},{l:'Soft Skills',v:r.softSkills,c:'#06b6d4'},{l:'Experience Depth',v:r.experienceDepth,c:'#a78bfa'}].map(b => `<div class="mt-3"><div class="flex justify-between text-sm"><span>${b.l}</span><span style="color:${b.c}">${b.v}%</span></div><div class="h-2.5 rounded-full overflow-hidden bg-white/10"><div class="h-full rounded-full transition-all duration-1000" style="width:${b.v}%;background:${b.c}"></div></div></div>`).join('')}
                <div class="mt-4 text-xs text-muted bg-white/5 p-2 rounded-lg">💡 Focus on improving your <strong>Hard Skills</strong> – they have the most impact.</div>
            </div>`;
        }

        // TECHNICAL: Tech Stack Extraction
        function renderTechStack(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-cubes mr-1"></i>Tech Stack Comparison</h3>
                <div class="mt-3"><p class="text-xs text-muted">Your CV:</p>
                    <div class="flex flex-wrap gap-1 mt-1">${r.techStack.cv.map(t => `<span class="tech-badge">${t}</span>`).join('')}</div>
                </div>
                <div class="mt-3"><p class="text-xs text-muted">Job Description:</p>
                    <div class="flex flex-wrap gap-1 mt-1">${r.techStack.jd.map(t => `<span class="tech-badge" style="${r.techStack.matched.includes(t)?'background:rgba(34,197,94,0.15);color:#86efac;border-color:rgba(34,197,94,0.2)':r.techStack.missing.includes(t)?'background:rgba(239,68,68,0.15);color:#fca5a5;border-color:rgba(239,68,68,0.2)':''}">${t}</span>`).join('')}</div>
                </div>
                ${r.techStack.missing.length > 0 ? `<div class="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20"><p class="text-xs text-red-300">⚠️ Missing: ${r.techStack.missing.join(', ')}</p></div>` : `<div class="mt-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20"><p class="text-xs text-green-300">✅ All technologies matched!</p></div>`}
            </div>`;
        }

        // TECHNICAL: Industry Terms
        function renderIndustryTerms(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-microchip mr-1"></i>Industry Terminology</h3>
                <div class="mt-2"><p class="text-xs text-muted">Your CV uses:</p><div class="flex flex-wrap gap-1 mt-1">${r.industryTerms.cv.map(t => `<span class="tech-badge">${t}</span>`).join('')}</div></div>
                ${r.industryTerms.missing.length > 0 ? `<div class="mt-3 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20"><p class="text-xs text-yellow-300">📝 Add these terms: ${r.industryTerms.missing.join(', ')}</p></div>` : ''}
            </div>`;
        }

        // TECHNICAL: Experience Verification
        function renderExperience(r) {
            const statusMap = { full: '✅ Full match', partial: '⚠️ Partial match', missing: '❌ Missing' };
            const colorMap = { full: 'text-green-400', partial: 'text-yellow-400', missing: 'text-red-400' };
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-clock mr-1"></i>Experience Check</h3>
                <div class="mt-3 space-y-2">
                    <div class="flex justify-between text-sm"><span class="text-muted">Your total experience:</span><span class="font-bold">${r.experience.totalYears} years</span></div>
                    <div class="flex justify-between text-sm"><span class="text-muted">Required:</span><span class="font-bold">${r.experience.requiredYears} years</span></div>
                    <div class="flex justify-between text-sm"><span class="text-muted">Relevant experience:</span><span class="font-bold">${r.experience.relevantYears} years</span></div>
                    <div class="p-2 rounded-lg ${r.experience.status === 'full' ? 'bg-green-500/10 border border-green-500/20' : r.experience.status === 'partial' ? 'bg-yellow-500/10 border border-yellow-500/20' : 'bg-red-500/10 border border-red-500/20'}"><p class="text-xs ${colorMap[r.experience.status]}">${statusMap[r.experience.status]} — ${r.experience.gap}</p></div>
                </div>
            </div>`;
        }

        // TECHNICAL: Projects
        function renderProjects(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-folder-open mr-1"></i>Project Relevance</h3>
                ${r.projects.map(p => `<div class="mt-3 p-3 rounded-lg bg-white/5"><div class="flex justify-between"><span class="font-bold text-sm">${p.name}</span><span class="text-sm ${p.relevance >= 80 ? 'text-green-400' : p.relevance >= 60 ? 'text-yellow-400' : 'text-red-400'}">${p.relevance}%</span></div><div class="flex flex-wrap gap-1 mt-1">${p.tech.map(t => `<span class="tech-badge">${t}</span>`).join('')}</div></div>`).join('')}
            </div>`;
        }

        // TECHNICAL: Achievements
        function renderAchievements(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-trophy mr-1"></i>Quantifiable Wins</h3>
                <ul class="mt-2 space-y-2">${r.achievements.map(a => `<li class="text-sm flex gap-2"><i class="fas fa-check-circle text-green-400 mt-0.5"></i>${a.text}</li>`).join('')}</ul>
                <div class="mt-3 text-xs text-muted bg-blue-500/10 p-2 rounded-lg">💡 Include more numbers and percentages to strengthen your CV.</div>
            </div>`;
        }

        // TECHNICAL: Action Verbs
        function renderActionVerbs(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-pen mr-1"></i>Action Verb Strength</h3>
                <div class="mt-2"><p class="text-2xl font-extrabold">${r.actionVerbs.score}%</p><p class="text-xs text-muted">Strong vs weak verbs</p></div>
                <div class="mt-3"><p class="text-xs text-muted">Strong verbs: <span class="text-green-400">${r.actionVerbs.strong.join(', ')}</span></p></div>
                ${r.actionVerbs.weak.length > 0 ? `<div class="mt-1 p-2 rounded-lg bg-yellow-500/10"><p class="text-xs text-yellow-300">⚠️ Replace weak verbs: ${r.actionVerbs.weak.join(', ')}</p></div>` : ''}
            </div>`;
        }

        // TECHNICAL: Resume Structure
        function renderStructure(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-sitemap mr-1"></i>Resume Structure</h3>
                <div class="mt-2"><p class="text-2xl font-extrabold">${r.structure.completeness}%</p><p class="text-xs text-muted">Completeness score</p></div>
                <div class="mt-3"><p class="text-xs text-muted">Sections found: <span class="text-green-400">${r.structure.sections.join(', ')}</span></p></div>
                ${r.structure.missing.length > 0 ? `<div class="mt-2 p-2 rounded-lg bg-yellow-500/10"><p class="text-xs text-yellow-300">⚠️ Missing: ${r.structure.missing.join(', ')}</p></div>` : ''}
                ${r.structure.issues.map(i => `<div class="mt-1 p-2 rounded-lg bg-red-500/10 text-xs text-red-300">⚠️ ${i}</div>`).join('')}
            </div>`;
        }

        // TECHNICAL: Readability
        function renderReadability(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-font mr-1"></i>Readability Score</h3>
                <div class="mt-2"><p class="text-2xl font-extrabold">${r.readability.score}</p><p class="text-xs text-muted">Flesch-Kincaid style (0-100)</p></div>
                <div class="mt-2"><span class="tech-badge">Grade: ${r.readability.grade}</span></div>
                ${r.readability.issues.map(i => `<div class="mt-1 p-2 rounded-lg bg-yellow-500/10 text-xs text-yellow-300">📝 ${i}</div>`).join('')}
            </div>`;
        }

        // TECHNICAL: Interview Questions
        function renderInterviewQs(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-code mr-1"></i>Technical Interview Questions</h3>
                <ol class="space-y-2 mt-3">${r.interviewQs.map((q,i) => `<li class="flex gap-3 text-sm"><span class="font-bold text-cyan-400">${i+1}.</span><span>${q}</span></li>`).join('')}</ol>
            </div>`;
        }

        // TECHNICAL: Salary
        function renderSalary(r) {
            return `<div class="glass p-6"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted"><i class="fas fa-money-bill-wave mr-1"></i>Salary Intel</h3>
                <p class="text-3xl font-extrabold text-green-400">${r.salaryRange.currency} ${r.salaryRange.min.toLocaleString()} – ${r.salaryRange.max.toLocaleString()}</p>
                <div class="mt-3"><p class="text-xs text-muted">Factors affecting your rate:</p>
                    <ul class="mt-1 space-y-1">${r.salaryFactors.map(f => `<li class="text-sm flex gap-2"><i class="fas fa-plus-circle text-green-400 mt-0.5"></i>${f}</li>`).join('')}</ul>
                </div>
            </div>`;
        }

        function renderDiffView(r) {
            return `<div class="glass p-6"><div class="flex justify-between items-center"><h3 class="text-xs font-semibold uppercase tracking-widest text-muted">Side-by-Side Comparison</h3><button onclick="toggleDiff()" class="text-xs text-cyan-400 flex items-center gap-1" aria-expanded="${S.showDiff}"><i class="fas ${S.showDiff?'fa-eye-slash':'fa-eye'}"></i>${S.showDiff?'Hide':'Show'}</button></div>${S.showDiff && r.diff?`<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"><div><p class="text-xs font-semibold text-cyan-400 mb-2"><i class="fas fa-briefcase mr-1"></i>Job Description asks for</p><div class="space-y-2">${r.diff.jd.map(s=>`<div class="p-2 bg-white/5 rounded-lg text-sm text-secondary">${s}</div>`).join('')}</div></div><div><p class="text-xs font-semibold text-purple-400 mb-2"><i class="fas fa-user mr-1"></i>Your CV shows</p><div class="space-y-2">${r.diff.cv.map(s=>`<div class="p-2 bg-white/5 rounded-lg text-sm text-secondary">${s}</div>`).join('')}</div></div></div>`:'<p class="text-center text-muted py-4">Toggle to see how your CV matches the job description.</p>'}</div>`;
        }
