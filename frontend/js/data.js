// Application state and static data
// This is the single source of truth (S) plus the demo/mock data used by the analyzer.

        // ===========================================================
        // STATE
        // ===========================================================
        const S = {
            lightMode: false,
            mobileMenuOpen: false,
            currentPage: 'home',
            cvSource: 'file', cvFile: null, cvFileName: '', cvLinkedin: '', cvGithub: '', cvText: '',
            jdSource: 'file', jdFile: null, jdFileName: '', jdLinkedin: '', jdText: '',
            isAnalyzing: false,
            analysisDone: false,
            analysisMode: null,
            logs: [],
            results: null,
            showDiff: false,
            rewriteKeyword: null,
            shareModal: false,
            shareId: null,
            toast: null,
            history: JSON.parse(localStorage.getItem('smp_history') || '[]'),
        };

        // ===========================================================
        // MOCK DATA — TECHNICAL FEATURES ONLY
        // ===========================================================
        function getMockResults() {
            return {
                // Core Match
                matchScore: 76,
                confidence: 93,
                confidencePoints: 1450,
                hardSkills: 72,
                softSkills: 84,
                experienceDepth: 65,

                // TECHNICAL: Tech Stack Extraction
                techStack: {
                    cv: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Git'],
                    jd: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'Kubernetes', 'AWS', 'Docker', 'PostgreSQL', 'Redis', 'CI/CD'],
                    matched: ['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'PostgreSQL'],
                    missing: ['GraphQL', 'Kubernetes', 'Redis', 'CI/CD'],
                    partial: [] // for future use
                },

                // TECHNICAL: Experience Verification
                experience: {
                    totalYears: 4.5,
                    requiredYears: 5,
                    relevantYears: 3.2,
                    status: 'partial', // 'full' | 'partial' | 'missing'
                    gap: '0.5 years short of requirement'
                },

                // TECHNICAL: Project Relevance
                projects: [
                    { name: 'E-commerce Platform', relevance: 85, tech: ['React', 'Node.js', 'AWS'] },
                    { name: 'Analytics Dashboard', relevance: 70, tech: ['React', 'D3.js', 'Python'] },
                    { name: 'Mobile App Backend', relevance: 60, tech: ['Node.js', 'Express', 'MongoDB'] }
                ],

                // TECHNICAL: Quantifiable Achievements
                achievements: [
                    { text: 'Reduced API response time by 40%', type: 'performance' },
                    { text: 'Led migration to microservices (12 services)', type: 'scale' },
                    { text: 'Increased test coverage from 45% to 82%', type: 'quality' },
                    { text: 'Implemented CI/CD reducing deploy time from 45min to 8min', type: 'devops' }
                ],

                // TECHNICAL: Action Verb Strength
                actionVerbs: {
                    total: 28,
                    strong: ['built', 'designed', 'implemented', 'architected', 'led', 'optimized', 'migrated'],
                    weak: ['worked', 'used', 'helped', 'did', 'assisted'],
                    score: 78 // percentage of strong verbs
                },

                // TECHNICAL: Resume Structure
                structure: {
                    sections: ['summary', 'experience', 'education', 'skills', 'projects', 'certifications'],
                    missing: ['certifications'],
                    completeness: 85, // percentage
                    issues: ['Add a certifications section', 'Summary is too short (<50 words)']
                },

                // TECHNICAL: Readability (Flesch-Kincaid style)
                readability: {
                    score: 68, // 0-100, higher = better
                    grade: '10th grade',
                    issues: ['Some sentences are too long (>20 words)', 'Use more bullet points']
                },

                // TECHNICAL: Industry-specific terms
                industryTerms: {
                    cv: ['microservices', 'kubernetes', 'docker', 'ci/cd', 'rest', 'graphql', 'aws'],
                    jd: ['microservices', 'kubernetes', 'docker', 'ci/cd', 'graphql', 'aws', 'terraform', 'serverless'],
                    missing: ['terraform', 'serverless']
                },

                // TECHNICAL: Interview Questions (technical only)
                interviewQs: [
                    'Explain how you would design a scalable microservices architecture using Kubernetes.',
                    'Walk me through your CI/CD pipeline from commit to production. What tools did you use?',
                    'How did you optimize your database queries at scale? Give specific numbers.',
                    'Describe a time you refactored legacy code. What was your approach and what were the results?',
                    'How do you handle dependency conflicts in a large Node.js monorepo?'
                ],

                // TECHNICAL: Rewrite Suggestions
                rewriteSuggestions: [
                    { original: 'I worked on the frontend.', improved: 'Architected and built a React frontend serving 50K+ daily users.' },
                    { original: 'Used AWS for infrastructure.', improved: 'Designed and managed AWS infrastructure serving 99.9% uptime for 3 years.' },
                    { original: 'Helped with testing.', improved: 'Implemented a comprehensive testing strategy increasing coverage from 45% to 82%.' }
                ],

                // TECHNICAL: Salary based on tech stack
                salaryRange: { min: 95000, max: 145000, currency: 'USD' },
                salaryFactors: ['Kubernetes experience (+15%)', 'AWS certified (+10%)', 'Microservices architecture (+12%)'],

                // TECHNICAL: Competitor Edge
                competitors: [
                    { name: 'Candidate A (Tech Lead)', score: 88 },
                    { name: 'You', score: 76, isYou: true },
                    { name: 'Candidate B (Senior Dev)', score: 72 },
                    { name: 'Candidate C (Staff Eng)', score: 92 }
                ],
                edgeInsight: 'Your microservices and AWS experience place you in the top 30%. Focus on Kubernetes to break into the top 10%.',

                // Side-by-side comparison
                diff: {
                    jd: ['Requires 5+ years building distributed systems', 'Kubernetes & container orchestration in production', 'GraphQL API design experience', 'Owns CI/CD pipelines end-to-end'],
                    cv: ['4.5 years building backend & full-stack systems', 'Docker in production, no orchestration platform listed', 'REST API design experience only', 'Set up automated testing, not full CI/CD']
                }
            };
        }

        const REWRITES = {
            'Kubernetes': ['Deployed microservices on Kubernetes.', 'Orchestrated workloads with Kubernetes.', 'Built GitOps with ArgoCD.'],
            'GraphQL': ['Designed GraphQL APIs replacing REST.', 'Built federated GraphQL gateway.', 'Implemented real-time subscriptions.'],
            'CI/CD': ['Built CI/CD pipelines with GitHub Actions.', 'Automated testing with CI/CD.', 'Established infrastructure-as-code with CI/CD.']
        };

        // ===========================================================
        // MODE DEFINITIONS — TECHNICAL FOCUS
        // ===========================================================
        const MODES = {
            core: { label: 'Core Match', icon: 'fa-bullseye', desc: 'Semantic match & skill breakdown', features: ['score', 'skills'] },
            tech: { label: 'Tech Stack', icon: 'fa-cubes', desc: 'Extract & compare technologies', features: ['techstack', 'industries'] },
            experience: { label: 'Experience Check', icon: 'fa-clock', desc: 'Years, relevance & gaps', features: ['experience', 'projects'] },
            achievements: { label: 'Achievements', icon: 'fa-trophy', desc: 'Quantifiable wins & action verbs', features: ['achievements', 'verbs'] },
            structure: { label: 'Resume Structure', icon: 'fa-sitemap', desc: 'Sections, readability & format', features: ['structure', 'readability'] },
            interview: { label: 'Tech Interview', icon: 'fa-code', desc: 'Technical questions & answers', features: ['interviews'] },
            salary: { label: 'Salary Intel', icon: 'fa-money-bill-wave', desc: 'Market rate for your stack', features: ['salary'] }
        };
