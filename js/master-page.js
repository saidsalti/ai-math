// Master Page Manager

const MasterPage = {
    // Common elements templates
    templates: {
        header: `
            <header>
                <h1 id="page-title">مفاهيم الرياضيات التفاعلية</h1>
            </header>
        `,
        
        navigation: `
            <nav>
                <ul>
                    <li><a href="index.html" data-page="home">الصفحة الرئيسية</a></li>
                    <li><a href="circle.html" data-page="circle">دائرة الوحدة والمثلثات</a></li>
                    <li><a href="parabola.html" data-page="parabola">المنحنى القطعي (الباربولا)</a></li>
                    <li><a href="fibonacci.html" data-page="fibonacci">متتالية فيبوناتشي</a></li>
                    <li><a href="pythagoras.html" data-page="pythagoras">نظرية فيثاغورس</a></li>
                    <li><a href="multiplication-challenges.html" data-page="challenges">تحديات الضرب</a></li>
                </ul>
            </nav>
        `,
        
        footer: `
            <footer>
                <p>تم إنشاؤه باستخدام <a href="#" target="_blank">سعيد الصلتي</a></p>
            </footer>
        `
    },

    // Initialize the master page
    init: function(pageId) {
        // Insert common elements
        document.body.insertAdjacentHTML('afterbegin', this.templates.header);
        document.body.insertAdjacentHTML('afterbegin', this.templates.navigation);
        document.body.insertAdjacentHTML('beforeend', this.templates.footer);
        
        // Highlight current page in navigation
        this.setActivePage(pageId);
        
        // Update page title if needed
        this.updatePageTitle(pageId);
        
        // Apply RTL direction
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    },
    
    // Set the active page in navigation
    setActivePage: function(pageId) {
        const links = document.querySelectorAll('nav a');
        links.forEach(link => {
            if (link.getAttribute('data-page') === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },
    
    // Update page title based on current page
    updatePageTitle: function(pageId) {
        const titles = {
            home: 'مفاهيم الرياضيات التفاعلية',
            circle: 'دائرة الوحدة والمثلثات',
            parabola: 'المنحنى القطعي (الباربولا)',
            fibonacci: 'متتالية فيبوناتشي',
            pythagoras: 'نظرية فيثاغورس',
            challenges: 'تحديات الضرب'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle && titles[pageId]) {
            pageTitle.textContent = titles[pageId];
            document.title = titles[pageId] + ' - مفاهيم الرياضيات';
        }
    }
};

// Make globally available
window.MasterPage = MasterPage;
