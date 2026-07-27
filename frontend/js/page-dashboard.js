// Dashboard page (upload + analysis tools)

        function renderDashboard() {
            const hasInputs = S.cvFileName || S.cvText || S.cvLinkedin || S.cvGithub || S.jdFileName || S.jdText || S.jdLinkedin;
            return `
            <div class="py-4">
                <h2 class="text-3xl font-extrabold mb-6">Technical CV Analysis</h2>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div class="glass p-6"><h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-4"><i class="fas fa-user mr-2 text-cyan-400"></i>Your CV</h3>
                        <div class="flex flex-wrap gap-1 mb-4">${['file','linkedin','github','text'].map(t => `<button onclick="setCVTab('${t}')" class="tab-btn ${S.cvSource===t?'active':''}">${t==='file'?'📄 Upload':t==='linkedin'?'🔗 LinkedIn':t==='github'?'🐙 GitHub':'📝 Text'}</button>`).join('')}</div>
                        <div class="tab-content ${S.cvSource==='file'?'active':''}"><div class="dropzone" role="button" tabindex="0" aria-label="Upload your CV as PDF or DOCX" onclick="document.getElementById('cvFileInput').click()" onkeydown="if(event.key==='Enter')document.getElementById('cvFileInput').click()" ondrop="handleCVDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)"><input id="cvFileInput" type="file" accept=".pdf,.docx" class="hidden" onchange="handleCVFile(event)">${S.cvFileName?`<div><i class="fas fa-file-check text-3xl text-green-400"></i><p class="mt-2 font-bold">${S.cvFileName}</p><p class="text-xs text-muted">✅ Ready</p><button type="button" onclick="event.stopPropagation();clearCVFile()" class="mt-2 text-xs text-red-400 hover:text-red-300"><i class="fas fa-xmark mr-1"></i>Remove</button></div>`:`<div><i class="fas fa-cloud-arrow-up text-4xl text-purple-400"></i><p class="mt-2 font-semibold">Drop PDF/DOCX</p><p class="text-xs text-muted mt-1">Max ${MAX_FILE_MB}MB</p></div>`}</div></div>
                        <div class="tab-content ${S.cvSource==='linkedin'?'active':''}"><input placeholder="https://linkedin.com/in/..." value="${S.cvLinkedin}" oninput="S.cvLinkedin=this.value" class="w-full p-3 rounded-xl text-sm outline-none" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);"></div>
                        <div class="tab-content ${S.cvSource==='github'?'active':''}"><input placeholder="https://github.com/..." value="${S.cvGithub}" oninput="S.cvGithub=this.value" class="w-full p-3 rounded-xl text-sm outline-none" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);"></div>
                        <div class="tab-content ${S.cvSource==='text'?'active':''}"><textarea placeholder="Paste your resume text..." rows="4" oninput="S.cvText=this.value" class="w-full p-3 rounded-xl text-sm outline-none resize-none" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);">${S.cvText}</textarea></div>
                    </div>
                    <div class="glass p-6"><h3 class="text-sm font-semibold uppercase tracking-wider text-muted mb-4"><i class="fas fa-briefcase mr-2 text-cyan-400"></i>Job Description</h3>
                        <div class="flex flex-wrap gap-1 mb-4">${['file','linkedin','text'].map(t => `<button onclick="setJDTab('${t}')" class="tab-btn ${S.jdSource===t?'active':''}">${t==='file'?'📄 Upload':t==='linkedin'?'🔗 LinkedIn':'📝 Text'}</button>`).join('')}</div>
                        <div class="tab-content ${S.jdSource==='file'?'active':''}"><div class="dropzone" role="button" tabindex="0" aria-label="Upload the job description as PDF or DOCX" onclick="document.getElementById('jdFileInput').click()" onkeydown="if(event.key==='Enter')document.getElementById('jdFileInput').click()" ondrop="handleJDDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)"><input id="jdFileInput" type="file" accept=".pdf,.docx" class="hidden" onchange="handleJDFile(event)">${S.jdFileName?`<div><i class="fas fa-file-check text-3xl text-green-400"></i><p class="mt-2 font-bold">${S.jdFileName}</p><p class="text-xs text-muted">✅ Ready</p><button type="button" onclick="event.stopPropagation();clearJDFile()" class="mt-2 text-xs text-red-400 hover:text-red-300"><i class="fas fa-xmark mr-1"></i>Remove</button></div>`:`<div><i class="fas fa-cloud-arrow-up text-4xl text-purple-400"></i><p class="mt-2 font-semibold">Drop JD PDF/DOCX</p><p class="text-xs text-muted mt-1">Max ${MAX_FILE_MB}MB</p></div>`}</div></div>
                        <div class="tab-content ${S.jdSource==='linkedin'?'active':''}"><input placeholder="https://linkedin.com/jobs/view/..." value="${S.jdLinkedin}" oninput="S.jdLinkedin=this.value" class="w-full p-3 rounded-xl text-sm outline-none" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);"></div>
                        <div class="tab-content ${S.jdSource==='text'?'active':''}"><textarea placeholder="Paste the job description text..." rows="4" oninput="S.jdText=this.value" class="w-full p-3 rounded-xl text-sm outline-none resize-none" style="background:var(--glass-bg);border:1px solid var(--glass-border);color:var(--text-primary);">${S.jdText}</textarea></div>
                    </div>
                </div>

                ${hasInputs ? `
                <div class="mt-8">
                    <h3 class="text-xl font-bold mb-4 text-center">What do you want to analyze?</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        ${Object.entries(MODES).map(([key, mode]) => `
                            <div class="glass mode-card p-4 text-center ${S.analysisMode===key?'selected':''}" onclick="selectMode('${key}')">
                                <div class="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2" style="background:rgba(139,92,246,0.12);"><i class="fas ${mode.icon}" style="color:var(--accent-cyan)"></i></div>
                                <h4 class="font-bold text-sm">${mode.label}</h4>
                                <p class="text-[10px] text-muted mt-1">${mode.desc}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
                ` : `
                <div class="mt-8 text-center text-muted py-8">
                    <i class="fas fa-cloud-arrow-up text-3xl mb-3"></i>
                    <p>Upload your CV and Job Description above to unlock the tools.</p>
                </div>
                `}

                ${hasInputs && S.analysisMode ? `
                <div class="mt-6 flex flex-col items-center gap-4">
                    <button onclick="startAnalysis()" id="analyzeBtn" class="px-12 py-4 rounded-2xl text-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-60" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);box-shadow:0 0 40px rgba(139,92,246,0.3);">
                        ${S.isAnalyzing?'<i class="fas fa-spinner fa-spin"></i> Analyzing...':`<i class="fas fa-wand-magic-sparkles"></i> Run ${MODES[S.analysisMode].label}`}
                    </button>
                    ${renderLogs()}
                </div>
                ` : hasInputs ? `
                <div class="mt-6 text-center text-muted py-4">
                    <i class="fas fa-hand-pointer text-2xl mb-2"></i>
                    <p>Pick a tool above to get started.</p>
                </div>
                ` : ''}

                ${S.analysisDone && S.results ? renderResults() : ''}
                ${S.isAnalyzing ? renderSkeletons() : ''}
            </div>`;
        }

        function renderLogs() {
            if (S.logs.length === 0 && !S.isAnalyzing) return '';
            return `<div class="w-full max-w-4xl rounded-xl overflow-hidden" style="background:rgba(0,0,0,0.3);border:1px solid var(--glass-border);">
                <div class="flex items-center gap-2 px-4 py-2 border-b border-white/5"><i class="fas fa-terminal text-xs text-cyan-400"></i><span class="text-xs font-mono text-muted">${S.analysisMode ? MODES[S.analysisMode].label : 'engine'}.log</span></div>
                <div class="p-4 font-mono text-xs leading-relaxed max-h-40 overflow-y-auto" style="color:var(--accent-cyan);">${S.logs.map(l => `<div class="${l.done?'':'term-cursor'}" style="color:${l.done?'var(--success)':'var(--accent-cyan)'}">${l.text}</div>`).join('')}</div>
            </div>`;
        }

        function renderSkeletons() {
            return `<div class="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">${Array(4).fill(0).map(() => `<div class="glass p-6"><div class="skel h-4 w-2/3 mb-4"></div><div class="skel h-24 w-full mb-4"></div><div class="skel h-3 w-5/6"></div></div>`).join('')}</div>`;
        }
