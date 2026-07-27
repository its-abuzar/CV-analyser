// User interactions: navigation, tabs, file uploads and the mock analysis runner

        // ===========================================================
        // INTERACTIONS
        // ===========================================================
        function navigate(p){S.currentPage=p;window.scrollTo({top:0,behavior:'smooth'});render();}
        function toggleMobileMenu(){S.mobileMenuOpen=!S.mobileMenuOpen;render();}
        function toggleTheme(){S.lightMode=!S.lightMode;document.body.classList.toggle('light-mode',S.lightMode);render();}
        function toggleDiff(){S.showDiff=!S.showDiff;render();}
        function setCVTab(t){S.cvSource=t;render();}
        function setJDTab(t){S.jdSource=t;render();}
        function selectMode(mode){
            if (S.analysisMode === mode) return;
            if (S.isAnalyzing) { showToast('Hang on — let the current analysis finish first.'); return; }
            S.analysisMode = mode;
            if (S.analysisDone) {
                // switching tools invalidates the old report — force a fresh run
                S.analysisDone = false;
                S.results = null;
                S.logs = [];
                S.showDiff = false;
            }
            render();
            const btn = document.getElementById('analyzeBtn');
            if (btn) btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        function resetAnalysis(){S.analysisDone=false;S.analysisMode=null;S.results=null;S.logs=[];render();}

        const MAX_FILE_MB = 10;
        function validFile(f){
            if(!f) return false;
            const okExt = /\.(pdf|docx)$/i.test(f.name);
            if(!okExt){showToast('Only PDF or DOCX files are supported.');return false;}
            if(f.size > MAX_FILE_MB*1024*1024){showToast(`File is too large — max ${MAX_FILE_MB}MB.`);return false;}
            return true;
        }
        function clearCVFile(){S.cvFile=null;S.cvFileName='';document.getElementById('cvFileInput').value='';render();}
        function clearJDFile(){S.jdFile=null;S.jdFileName='';document.getElementById('jdFileInput').value='';render();}
        function handleCVFile(e){const f=e.target.files[0];if(f&&validFile(f)){S.cvFile=f;S.cvFileName=f.name;render();}}
        function handleJDFile(e){const f=e.target.files[0];if(f&&validFile(f)){S.jdFile=f;S.jdFileName=f.name;render();}}
        function handleCVDrop(e){e.preventDefault();e.currentTarget.classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f&&validFile(f)){S.cvFile=f;S.cvFileName=f.name;render();}}
        function handleJDDrop(e){e.preventDefault();e.currentTarget.classList.remove('drag-over');const f=e.dataTransfer.files[0];if(f&&validFile(f)){S.jdFile=f;S.jdFileName=f.name;render();}}
        function handleDragOver(e){e.preventDefault();e.currentTarget.classList.add('drag-over');}
        function handleDragLeave(e){e.currentTarget.classList.remove('drag-over');}

        function startAnalysis(){
            const hasCV = S.cvFileName || S.cvText || S.cvLinkedin || S.cvGithub;
            const hasJD = S.jdFileName || S.jdText || S.jdLinkedin;
            if(!hasCV || !hasJD){showToast('Upload both your CV and the job description.');return;}
            if(!S.analysisMode){showToast('Pick a tool from the options above.');return;}

            S.isAnalyzing=true; S.analysisDone=false; S.logs=[]; S.showDiff=false; render();

            const modeName = MODES[S.analysisMode].label;
            const msgs = [
                `Starting ${modeName} analysis...`,
                'Parsing technical stack...',
                `Running ${modeName} engine...`,
                'Extracting metrics...',
                'Generating report...'
            ];

            msgs.forEach((m,i)=>setTimeout(()=>{
                if(S.logs.length>0)S.logs[S.logs.length-1].done=true;
                S.logs.push({text:m,done:i===msgs.length-1});
                render();
            },600*(i+1)));

            setTimeout(()=>{
                S.isAnalyzing=false; S.analysisDone=true;
                S.results=getMockResults();
                // Mode-specific mock data
                if (S.analysisMode === 'tech') {
                    S.results.techStack = {
                        cv: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Git'],
                        jd: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Kubernetes', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'CI/CD'],
                        matched: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
                        missing: ['GraphQL', 'Kubernetes', 'Redis', 'CI/CD']
                    };
                    S.results.industryTerms = {
                        cv: ['microservices', 'kubernetes', 'docker', 'ci/cd', 'rest', 'graphql', 'aws'],
                        jd: ['microservices', 'kubernetes', 'docker', 'ci/cd', 'graphql', 'aws', 'terraform', 'serverless'],
                        missing: ['terraform', 'serverless']
                    };
                } else if (S.analysisMode === 'experience') {
                    S.results.experience = { totalYears: 4.5, requiredYears: 5, relevantYears: 3.2, status: 'partial', gap: '0.5 years short of requirement' };
                    S.results.projects = [
                        { name: 'E-commerce Platform', relevance: 85, tech: ['React', 'Node.js', 'AWS'] },
                        { name: 'Analytics Dashboard', relevance: 70, tech: ['React', 'D3.js', 'Python'] },
                        { name: 'Mobile App Backend', relevance: 60, tech: ['Node.js', 'Express', 'MongoDB'] }
                    ];
                } else if (S.analysisMode === 'achievements') {
                    S.results.achievements = [
                        { text: 'Reduced API response time by 40%', type: 'performance' },
                        { text: 'Led migration to microservices (12 services)', type: 'scale' },
                        { text: 'Increased test coverage from 45% to 82%', type: 'quality' }
                    ];
                    S.results.actionVerbs = { total: 28, strong: ['built', 'designed', 'implemented', 'architected', 'led'], weak: ['worked', 'used', 'helped'], score: 78 };
                } else if (S.analysisMode === 'structure') {
                    S.results.structure = { sections: ['summary', 'experience', 'education', 'skills', 'projects'], missing: ['certifications'], completeness: 85, issues: ['Add a certifications section', 'Summary is too short (<50 words)'] };
                    S.results.readability = { score: 68, grade: '10th grade', issues: ['Some sentences are too long (>20 words)', 'Use more bullet points'] };
                } else if (S.analysisMode === 'interview') {
                    S.results.interviewQs = [
                        'Explain how you would design a scalable microservices architecture using Kubernetes.',
                        'Walk me through your CI/CD pipeline from commit to production. What tools did you use?',
                        'How did you optimize your database queries at scale? Give specific numbers.',
                        'Describe a time you refactored legacy code. What was your approach and what were the results?',
                        'How do you handle dependency conflicts in a large Node.js monorepo?'
                    ];
                } else if (S.analysisMode === 'salary') {
                    S.results.salaryRange = { min: 95000, max: 145000, currency: 'USD' };
                    S.results.salaryFactors = ['Kubernetes experience (+15%)', 'AWS certified (+10%)', 'Microservices architecture (+12%)'];
                }

                S.history.unshift({
                    label:S.cvFileName||'CV',
                    mode:modeName,
                    score:S.results.matchScore,
                    date:new Date().toLocaleDateString(),
                    cvLabel:S.cvSource,
                    jdLabel:S.jdSource
                });
                localStorage.setItem('smp_history',JSON.stringify(S.history));
                render();
                setTimeout(()=>{animateScore();},200);
            },msgs.length*600+400);
        }

        function animateScore(){const ring=document.getElementById('scoreRing'),num=document.getElementById('scoreNum');if(!ring||!S.results)return;const circ=2*Math.PI*70;setTimeout(()=>{ring.style.strokeDashoffset=circ*(1-S.results.matchScore/100);},50);let cur=0,target=S.results.matchScore,step=target/40;const t=setInterval(()=>{cur=Math.min(cur+step,target);if(num)num.textContent=Math.round(cur);if(cur>=target)clearInterval(t);},50);}
        function drawDiffLines(){}
