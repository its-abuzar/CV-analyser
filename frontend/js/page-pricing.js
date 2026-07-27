// Pricing page

        function renderPricing() {
            const plans = [
                { name: 'Free', price: '$0', period: '/forever', cta: 'Get Started', features: ['1 analysis per day', 'Core Match tool only', 'Overall score & skill breakdown', 'No saved history'] },
                { name: 'Pro', price: '$19', period: '/mo', cta: 'Upgrade to Pro', features: ['Unlimited analyses', 'All 7 technical tools', 'Rewrite suggestions & interview prep', 'Full history & PDF export', 'Salary intel by tech stack'] },
                { name: 'Enterprise', price: 'Custom', period: '', cta: 'Contact Sales', features: ['Everything in Pro', 'Bulk CV screening for teams', 'ATS & applicant-tracker integration', 'Dedicated support & SLA'] }
            ];
            return `<div class="py-12 text-center">
                <h2 class="text-4xl font-extrabold">Simple Pricing</h2>
                <p class="mt-2 text-sm" style="color:var(--text-muted)">No hidden fees. Cancel anytime.</p>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-8">${plans.map((p,i) => `
                <div class="glass p-8 text-left relative ${i===1?'border-2 border-purple-500':''}">
                    ${i===1?'<span class="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full text-white" style="background:linear-gradient(135deg,#8b5cf6,#06b6d4);">MOST POPULAR</span>':''}
                    <h3 class="text-xl font-bold text-center">${p.name}</h3>
                    <p class="text-4xl font-extrabold mt-2 text-cyan-400 text-center">${p.price}<span class="text-sm font-medium" style="color:var(--text-muted)">${p.period}</span></p>
                    <ul class="mt-6 space-y-3 text-sm text-secondary">${p.features.map(f=>`<li class="flex gap-2"><i class="fas fa-check text-green-500 mt-0.5"></i><span>${f}</span></li>`).join('')}</ul>
                    <button onclick="${i===0?"navigate('dashboard')":i===1?"showToast('Upgrades aren\\'t wired up in this preview yet.')":"showToast('Reach out via the contact link below.')"}" class="w-full mt-8 py-3 rounded-xl font-bold transition ${i===1?'text-white bg-gradient-to-r from-purple-500 to-cyan-500 hover:opacity-90':'border border-glass hover:bg-white/5'}">${p.cta}</button>
                </div>
            `).join('')}</div></div>`;
        }
