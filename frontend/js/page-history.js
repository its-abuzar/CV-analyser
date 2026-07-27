// History page

        function renderHistory() {
            const items = S.history;
            return `<div class="py-8"><div class="flex justify-between"><h2 class="text-3xl font-extrabold">History</h2><button onclick="clearHistory()" class="text-sm px-4 py-2 rounded-lg bg-red-500/20 text-red-400">Clear</button></div>
            ${items.length===0?'<div class="glass p-12 text-center text-muted"><i class="fas fa-clock text-4xl mb-4"></i><p>No analyses yet.</p></div>':`
            <table class="w-full text-left"><tr class="border-b border-glass"><th class="p-4">Date</th><th>CV</th><th>Mode</th><th>Score</th><th></th></tr>
            ${items.map((h,i) => `<tr class="border-b border-glass/50"><td class="p-4 text-sm">${h.date||'Today'}</td><td class="p-4 text-sm">${h.cvLabel||'CV'}</td><td class="p-4 text-sm">${h.mode||'Full'}</td><td class="p-4 font-bold text-cyan-400">${h.score}%</td><td><button onclick="loadHistory(${i})" class="px-3 py-1 rounded-lg bg-purple-500/20 text-purple-400 text-xs">View</button></td></tr>`).join('')}</table>`}</div>`;
        }
