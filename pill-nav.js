// PillNav — React component with active page detection
const { useRef, useState, useEffect } = React;

function PillNav({ items = [] }) {
    const navRef = useRef(null);
    const [hoveredIdx, setHoveredIdx] = useState(null);
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('appLang') || 'EN');
    const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('appTheme') !== 'light');

    useEffect(() => {
        // Sync body class on mount and when isDarkMode changes
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }, [isDarkMode]);

    useEffect(() => {
        // Sync language using existing global function
        if (typeof window.setAppLang === 'function') {
            window.setAppLang(currentLang);
        }
    }, [currentLang]);

    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const activeIdx = items.findIndex(item => {
        const href = item.href.split('/').pop() || 'index.html';
        return href === currentPage;
    });

    const handleThemeToggle = () => {
        const nextMode = !isDarkMode;
        setIsDarkMode(nextMode);
        localStorage.setItem('appTheme', nextMode ? 'dark' : 'light');
    };

    const handleLangToggle = () => {
        const newLang = currentLang === 'EN' ? 'FR' : 'EN';
        setCurrentLang(newLang);
        localStorage.setItem('appLang', newLang);
    };

    return React.createElement('nav', {
        ref: navRef,
        className: 'pill-nav',
        style: {
            '--pill-bg': isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            '--pill-active': isDarkMode ? '#a78bfa' : '#2563eb',
        }
    },
        // Logo
        React.createElement('a', { href: 'index.html', className: 'pill-nav-logo' },
            React.createElement('svg', { 
                width: '24', 
                height: '16', 
                viewBox: '0 0 3 2',
                className: 'france-flag',
                style: { borderRadius: '3px', overflow: 'hidden', boxShadow: '0 0 10px rgba(0,0,0,0.2)' }
            },
                React.createElement('rect', { width: '1', height: '2', fill: '#002654' }),
                React.createElement('rect', { x: '1', width: '1', height: '2', fill: '#FFFFFF' }),
                React.createElement('rect', { x: '2', width: '1', height: '2', fill: '#ED2939' })
            ),
            React.createElement('span', null, 'FranceTech'),
        ),

        // Nav items
        React.createElement('div', { className: 'pill-nav-items' },
            ...items.map((item, i) =>
                React.createElement('a', {
                    key: i,
                    href: item.href,
                    className: `pill-nav-item ${i === activeIdx ? 'active' : ''}`,
                    onMouseEnter: () => setHoveredIdx(i),
                    onMouseLeave: () => setHoveredIdx(null),
                    'data-i18n': item.i18nKey || undefined,
                }, item.label)
            ),
        ),

        // Controls
        React.createElement('div', { className: 'pill-nav-controls' },
            React.createElement('button', {
                className: 'pill-nav-btn',
                onClick: handleLangToggle,
                'aria-label': 'Toggle Language',
            },
                React.createElement('i', { className: 'fa-solid fa-language' }),
                React.createElement('span', null, ` ${currentLang}`),
            ),
            React.createElement('button', {
                id: 'theme-toggle-pill',
                className: 'pill-nav-btn',
                onClick: handleThemeToggle,
                'aria-label': 'Toggle Theme',
            },
                React.createElement('i', { className: `fa-solid ${isDarkMode ? 'fa-moon' : 'fa-sun'}` }),
            ),
        ),
    );
}

// Mount PillNav
document.addEventListener('DOMContentLoaded', () => {
    // Initial sync of body class and language before render
    const savedTheme = localStorage.getItem('appTheme') || 'dark';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }

    const savedLang = localStorage.getItem('appLang') || 'EN';
    if (typeof window.setAppLang === 'function') {
        window.setAppLang(savedLang);
    }

    const mountEl = document.getElementById('pill-nav-root');
    if (mountEl) {
        const root = ReactDOM.createRoot(mountEl);
        root.render(React.createElement(PillNav, {
            items: [
                { label: 'Home',       href: 'index.html',       i18nKey: 'tabHome' },
                { label: 'Technology', href: 'technology.html',  i18nKey: 'tabTech' },
                { label: 'Rafale',     href: 'rafale.html',      i18nKey: 'tabRafale' },
                { label: 'Space',      href: 'arianespace.html', i18nKey: 'tabSpace' },
                { label: 'Timeline',    href: 'innovation-history.html', i18nKey: 'tabHistory' },
            ],
        }));
    }
});
