document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN DOM ===
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;

    // === FUNGSI INTI ===

    // Fungsi untuk membuka/tutup sidebar mobile
    const toggleSidebar = () => {
        if (sidebar) sidebar.classList.toggle('-translate-x-full');
        if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden');
    };

    // Fungsi untuk memuat konten halaman dari file terpisah
    const loadPage = async (page) => {
        contentArea.innerHTML = '<div class="loader">Loading...</div>';
        try {
            const response = await fetch(`./src/pages/${page}.html?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error('Halaman tidak ditemukan.');
            const htmlContent = await response.text();
            contentArea.innerHTML = htmlContent;
            
            // Jalankan fungsi inisialisasi yang sesuai untuk halaman yang dimuat
            if (page === 'content' || page === 'community') initContentTabs();
            if (page === 'events') initEventForm();
            if (page === 'education') initEducationPage();
            if (page === 'settings') initSettingsPage();

        } catch (error) {
            contentArea.innerHTML = `<div class="text-center p-8 text-red-500">Error: ${error.message}</div>`;
        }
    };

    // === EVENT LISTENERS ===

    // Event listener untuk tombol menu mobile
    if (menuButton) menuButton.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);

    // Event listener untuk navigasi sidebar
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('.sidebar-link');
            if (!link) return;

            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const targetPage = link.dataset.target;
            pageTitle.textContent = link.querySelector('span').textContent;
            loadPage(targetPage);

            // Tutup sidebar setelah link diklik di mobile
            if (window.innerWidth < 768) {
                toggleSidebar();
            }
        });
    }

    // Event listener untuk tombol ganti tema
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            updateThemeIcon();
        });
    }

    // === FUNGSI BANTUAN & INISIALISASI HALAMAN SPESIFIK ===

    const updateThemeIcon = () => {
        const sunIcon = '<i class="fas fa-sun"></i>';
        const moonIcon = '<i class="fas fa-moon"></i>';
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = html.classList.contains('dark') ? sunIcon : moonIcon;
        }
    };

    const initContentTabs = () => {
        const tabLinks = document.querySelectorAll('.tab-link');
        const tabContents = document.querySelectorAll('.tab-content');
        if (tabLinks.length === 0) return;
        tabLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.dataset.target;
                tabLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(targetId).classList.add('active');
            });
        });
    };

    const initEventForm = () => {
        const eventTypeSelect = document.getElementById('eventType');
        if (!eventTypeSelect) return;
        const onlineField = document.getElementById('event-field-online');
        const offlineField = document.getElementById('event-field-offline');
        eventTypeSelect.addEventListener('change', () => {
            const selectedType = eventTypeSelect.value;
            onlineField.style.display = selectedType === 'online' ? 'block' : 'none';
            offlineField.style.display = selectedType === 'offline' ? 'block' : 'none';
        });
    };
    
    const initEducationPage = () => {
        const addCourseBtn = document.getElementById('add-course-btn');
        const courseModal = document.getElementById('course-modal');
        const cancelCourseBtn = document.getElementById('cancel-course-btn');
        if (addCourseBtn) {
            addCourseBtn.addEventListener('click', () => {
                if (courseModal) courseModal.classList.remove('hidden');
            });
        }
        if (cancelCourseBtn) {
            cancelCourseBtn.addEventListener('click', () => {
                if (courseModal) courseModal.classList.add('hidden');
            });
        }
    };

    const initSettingsPage = () => {
        const addSectionBtn = document.getElementById('add-section-btn');
        const sectionModal = document.getElementById('section-modal');
        const cancelSectionBtn = document.getElementById('cancel-section-btn');
        const sectionTypeSelect = document.getElementById('section-type-select');
        const dynamicContentSelector = document.getElementById('dynamic-content-selector');

        const openModal = () => sectionModal.classList.remove('hidden');
        const closeModal = () => sectionModal.classList.add('hidden');

        if (addSectionBtn) addSectionBtn.addEventListener('click', openModal);
        if (cancelSectionBtn) cancelSectionBtn.addEventListener('click', closeModal);

        if (sectionTypeSelect) {
            sectionTypeSelect.addEventListener('change', () => {
                const selectedType = sectionTypeSelect.value;
                
                // Sembunyikan semua selector di dalam dynamicContentSelector
                dynamicContentSelector.querySelectorAll('[id$="-selector"]').forEach(el => el.classList.add('hidden'));

                if (selectedType === 'banner' || selectedType === 'article_list') {
                    document.getElementById('banner-selector').classList.remove('hidden');
                    document.getElementById('selector-placeholder').classList.add('hidden');
                } else if (selectedType.includes('signals') || selectedType.includes('education') || selectedType.includes('community')) {
                    document.getElementById('widget-selector').classList.remove('hidden');
                    document.getElementById('selector-placeholder').classList.add('hidden');
                } else {
                    document.getElementById('selector-placeholder').classList.remove('hidden');
                }
            });
        }
    };
    
    // === INISIALISASI APLIKASI DASBOR ===
    const init = () => {
        updateThemeIcon();
        loadPage('dashboard');
    };

    init();
});
