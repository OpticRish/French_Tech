// PillNav — React component with hamburger menu for mobile
const { useRef, useState, useEffect } = React;

function PillNav({ items = [] }) {
    const navRef = useRef(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('appLang') || 'EN');
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('appTheme') !== 'light');

    useEffect(() => {
        if (isDarkMode) document.body.classList.add('dark-mode');
        else document.body.classList.remove('dark-mode');
    }, [isDarkMode]);

    useEffect(() => {
        if (typeof window.setAppLang === 'function') window.setAppLang(currentLang);
    }, [currentLang]);

    // Close menu on outside click
    useEffect(() => {
        if (!menuOpen) return;
        const handleOutside = (e) => {
            if (navRef.current && !navRef.current.contains(e.target)) setMenuOpen(false);
        };
        document.addEventListener('click', handleOutside);
        return () => document.removeEventListener('click', handleOutside);
    }, [menuOpen]);

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeIdx = items.findIndex(item => (item.href.split('/').pop() || 'index.html') === currentPage);

    const handleThemeToggle = () => {
        const next = !isDarkMode;
        setIsDarkMode(next);
        localStorage.setItem('appTheme', next ? 'dark' : 'light');
    };

    const handleLangToggle = () => {
        const lang = currentLang === 'EN' ? 'FR' : 'EN';
        setCurrentLang(lang);
        localStorage.setItem('appLang', lang);
    };

    // Controls element (reused in both layouts)
    const controls = React.createElement('div', { className: 'pill-nav-controls' },
        React.createElement('button', {
            className: 'pill-nav-btn', onClick: handleLangToggle, 'aria-label': 'Toggle Language'
        },
            React.createElement('i', { className: 'fa-solid fa-language' }),
            React.createElement('span', null, ` ${currentLang}`),
        ),
        React.createElement('button', {
            id: 'theme-toggle-pill', className: 'pill-nav-btn', onClick: handleThemeToggle, 'aria-label': 'Toggle Theme'
        },
            React.createElement('i', { className: `fa-solid ${isDarkMode ? 'fa-moon' : 'fa-sun'}` }),
        ),
    );

    return React.createElement('nav', {
        ref: navRef,
        className: `pill-nav${menuOpen ? ' menu-open' : ''}`,
        style: {
            '--pill-bg': isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            '--pill-active': isDarkMode ? '#a78bfa' : '#2563eb',
        }
    },
        // Top row: logo + hamburger
        React.createElement('div', { className: 'pill-nav-top' },
            React.createElement('a', { href: 'index.html', className: 'pill-nav-logo' },
                React.createElement('svg', {
                    width: '24', height: '16', viewBox: '0 0 3 2', className: 'france-flag',
                    style: { borderRadius: '3px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }
                },
                    React.createElement('rect', { width: '1', height: '2', fill: '#002654' }),
                    React.createElement('rect', { x: '1', width: '1', height: '2', fill: '#FFFFFF' }),
                    React.createElement('rect', { x: '2', width: '1', height: '2', fill: '#ED2939' })
                ),
                React.createElement('span', null, 'FranceTech'),
            ),
            // Desktop controls (hidden on mobile via CSS)
            React.createElement('div', { className: 'pill-nav-desktop-controls' }, controls),
            // Hamburger button (hidden on desktop via CSS)
            React.createElement('button', {
                className: `pill-hamburger${menuOpen ? ' open' : ''}`,
                onClick: (e) => { e.stopPropagation(); setMenuOpen(o => !o); },
                'aria-label': 'Toggle menu'
            },
                React.createElement('span'),
                React.createElement('span'),
                React.createElement('span'),
            ),
        ),

        // Dropdown menu (mobile: full links + controls; desktop: always visible nav items)
        React.createElement('div', { className: 'pill-nav-menu' },
            React.createElement('div', { className: 'pill-nav-items' },
                ...items.map((item, i) =>
                    React.createElement('a', {
                        key: i,
                        href: item.href,
                        className: `pill-nav-item ${i === activeIdx ? 'active' : ''}`,
                        onClick: () => setMenuOpen(false),
                        'data-i18n': item.i18nKey || undefined,
                    }, item.label)
                ),
            ),
            // Mobile-only controls (centered)
            React.createElement('div', { className: 'pill-nav-mobile-controls' }, controls),
        ),
    );
}

document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    if (savedTheme === 'dark') document.body.classList.add('dark-mode');
    else document.body.classList.remove('dark-mode');

    const savedLang = localStorage.getItem('appLang') || 'EN';
    if (typeof window.setAppLang === 'function') window.setAppLang(savedLang);

    const mountEl = document.getElementById('pill-nav-root');
    if (mountEl) {
        const root = ReactDOM.createRoot(mountEl);
        root.render(React.createElement(PillNav, {
            items: [
                { label: 'Home',       href: 'index.html',           i18nKey: 'tabHome' },
                { label: 'Technology', href: 'technology.html',       i18nKey: 'tabTech' },
                { label: 'Rafale',     href: 'rafale.html',           i18nKey: 'tabRafale' },
                { label: 'Space',      href: 'arianespace.html',      i18nKey: 'tabSpace' },
                { label: 'Timeline',   href: 'innovation-history.html', i18nKey: 'tabHistory' },
            ],
        }));
    }
});
