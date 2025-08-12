/* File: src/js/app.js - VERSI FINAL DENGAN LOGIKA ASLI & FITUR BARU */
document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN GLOBAL & STATE ===
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const html = document.documentElement;
    
    let userIsPremium = false; 
    let currentScreenParams = {};

    // === DATABASE SIMULASI ===
    const usersDB = {
        'budi_s': { name: 'Budi Santoso', avatar: 'https://placehold.co/100x100/34d399/ffffff?text=B', joinDate: 'Jan 2024', posts: 56, likes: 1200, reputation: 2500, isPremium: true, isExpert: false },
        'siti_a': { name: 'Siti Aminah', avatar: 'https://placehold.co/100x100/f87171/ffffff?text=S', joinDate: 'Mar 2024', posts: 112, likes: 3400, reputation: 4800, isPremium: false, isExpert: true },
        'eko_j': { name: 'Eko J.', avatar: 'https://placehold.co/100x100/60a5fa/ffffff?text=E', joinDate: 'Mei 2024', posts: 23, likes: 800, reputation: 1200, isPremium: false, isExpert: false }
    };

    // DATABASE BARU UNTUK EVENT
    const eventsDB = {
        'evt-001': { title: 'Webinar Analisa Teknikal', type: 'Online', date: '15 Agu 2025, 19:00 WIB', location: 'via Zoom Meeting', price: 'Gratis', image: 'https://placehold.co/400x200/8b5cf6/ffffff?text=Webinar', description: 'Pelajari dasar-dasar analisa teknikal dari para ahli. Cocok untuk pemula yang ingin terjun ke dunia trading. Akan dibahas mulai dari membaca chart, pola candlestick, hingga indikator populer.', status: 'upcoming' },
        'evt-002': { title: 'Kopdar Trader Jakarta', type: 'Offline', date: '20 Jul 2025, 10:00 WIB', location: 'Hotel Bidakara, Jakarta', price: 'Rp 150.000', image: 'https://placehold.co/400x200/f97316/ffffff?text=Kopdar', description: 'Acara kumpul bareng untuk para trader di Jakarta dan sekitarnya. Kesempatan untuk networking, sharing pengalaman, dan diskusi market outlook terbaru.', status: 'history' },
        'evt-003': { title: 'Workshop Psikologi Trading', type: 'Online', date: '25 Sep 2025, 19:00 WIB', location: 'via Google Meet', price: 'Gratis', image: 'https://placehold.co/400x200/ec4899/ffffff?text=Workshop', description: 'Kuasai emosi Anda saat trading dan buat keputusan yang lebih baik. Workshop interaktif ini akan membahas cara mengatasi FOMO, FUD, dan keserakahan.', status: 'upcoming' }
    };

    // Inisialisasi Lenis (Smooth Scroll)
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // === FUNGSI UTILITAS ===
    const showMessage = (message, duration = 2500) => {
        const messageModal = document.getElementById('message-modal');
        if (messageModal) {
            messageModal.textContent = message;
            messageModal.classList.remove('opacity-0');
            setTimeout(() => { messageModal.classList.add('opacity-0'); }, duration);
        }
    };

    const openModal = (modal) => { if (modal) modal.classList.add('visible'); };
    const closeModal = (modal) => { if (modal) modal.classList.remove('visible'); };

    // === FUNGSI UTAMA ===
    const loadScreen = async (screenName, params = {}) => {
        currentScreenParams = params;
        mainContent.innerHTML = '<div class="p-8 text-center"><i class="fas fa-spinner fa-spin text-3xl text-gray-400"></i></div>';
        try {
            const isHiddenNav = ['login', 'user-profile', 'event-detail'].includes(screenName);
            bottomNav.style.display = isHiddenNav ? 'none' : 'flex';
            
            const response = await fetch(`./src/screens/${screenName}.html?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Screen "${screenName}" not found`);
            mainContent.innerHTML = await response.text();
            initScreenSpecific(screenName);
            lenis.scrollTo(0, { immediate: true });
        } catch (error) {
            mainContent.innerHTML = `<div class="p-8 text-center text-red-500">${error.message}</div>`;
            console.error(error);
        }
    };

    const initScreenSpecific = (screenName) => {
        const initializers = {
            home: initHomePage,
            signals: initSignalsPage,
            community: initCommunityPage,
            education: initEducationPage,
            profile: initProfilePage,
            'user-profile': initUserProfilePage,
            events: initEventsPage,
            'event-detail': initEventDetailPage,
        };
        if (initializers[screenName]) initializers[screenName]();
    };

    // === NAVIGASI & EVENT GLOBAL ===
    bottomNav.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (!navItem || navItem.classList.contains('active')) return;
        const targetScreen = navItem.dataset.target;
        loadScreen(targetScreen);
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        navItem.classList.add('active');
    });

    document.body.addEventListener('click', (e) => {
        if (e.target.id === 'login-button') {
            loadScreen('home');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');
        }

        const themeToggle = e.target.closest('#theme-toggle, #theme-toggle-community, #theme-toggle-education');
        if (themeToggle) {
            html.classList.toggle('dark');
            const isDarkMode = html.classList.contains('dark');
            const newIcon = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            document.querySelectorAll('#theme-toggle, #theme-toggle-community, #theme-toggle-education').forEach(btn => {
                if(btn) btn.innerHTML = newIcon;
            });
        }
    });
    
    mainContent.addEventListener('click', function(e) {
        const toggleBtn = e.target.closest('.tp-toggle-button');
        if (toggleBtn) {
            const dropdown = toggleBtn.nextElementSibling;
            const icon = toggleBtn.querySelector('i');
            if (dropdown) dropdown.classList.toggle('open');
            if (icon) icon.classList.toggle('rotate-180');
        }

        const upgradeBtn = e.target.closest('.upgrade-to-premium-btn');
        if (upgradeBtn) {
            const upgradeModal = document.getElementById('upgrade-premium-modal');
            if (upgradeModal) openModal(upgradeModal);
        }

        const viewProfileBtn = e.target.closest('.view-profile-btn');
        if (viewProfileBtn) {
            const userId = viewProfileBtn.dataset.userid;
            if (userId) {
                loadScreen('user-profile', { userId: userId });
            }
        }

        const eventCard = e.target.closest('.event-card');
        if(eventCard){
            const eventId = eventCard.dataset.eventId;
            if(eventId) loadScreen('event-detail', { eventId: eventId });
        }

        if(e.target.closest('#back-to-events-btn')) {
            loadScreen('home');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');
        }
        
        if(e.target.closest('.view-all-events-btn')) {
            loadScreen('events');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            document.querySelector('.nav-item[data-target="home"]').classList.add('active');
        }
    });

    // LOGIKA ASLI UNTUK MODAL PREMIUM
    const upgradeModal = document.getElementById('upgrade-premium-modal');
    if (upgradeModal) {
        const closeBtn = document.getElementById('close-upgrade-modal-btn');
        const planOptions = upgradeModal.querySelectorAll('.plan-option');
        const paymentBtn = document.getElementById('proceed-payment-btn');

        if (closeBtn) closeBtn.addEventListener('click', () => closeModal(upgradeModal));
        
        upgradeModal.addEventListener('click', (e) => {
            if (e.target === upgradeModal) closeModal(upgradeModal);
        });

        planOptions.forEach(option => {
            option.addEventListener('click', () => {
                planOptions.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
            });
        });

        if (paymentBtn) {
            paymentBtn.addEventListener('click', () => {
                const selectedPlan = upgradeModal.querySelector('.plan-option.selected');
                if (selectedPlan) {
                    const planName = selectedPlan.dataset.plan;
                    showMessage(`Paket ${planName} dipilih! Integrasi pembayaran segera hadir.`);
                    closeModal(upgradeModal);
                } else {
                    showMessage("Silakan pilih paket terlebih dahulu.");
                }
            });
        }
    }

    // === LOGIKA HALAMAN BERANDA ===
    const initHomePage = () => {
        const wrapper = document.getElementById('home-content-wrapper');
        if (!wrapper) return;
        const homeLayoutData = [ { type: 'banner', title: 'Menjadi Anggota Premium', subtitle: 'Dapatkan akses sinyal eksklusif dan materi edukasi lengkap.', buttonText: 'Upgrade Sekarang' }, { type: 'signals', title: 'Sinyal Premium Terbaru' }, { type: 'education_resume', title: 'Lanjutkan Belajar' }, { type: 'community_highlight', title: 'Diskusi Komunitas' }, { type: 'event_highlight', title: 'Event Akan Datang', eventId: 'evt-001', viewAllText: 'Lihat Semua Event' } ];
        const renderSection = (sectionData) => { let html = ''; switch (sectionData.type) { case 'banner': html = `<div class="bg-primary-500 text-white p-4 rounded-lg shadow-lg"><h2 class="font-bold text-lg">${sectionData.title}</h2><p class="text-sm mt-1">${sectionData.subtitle}</p><button class="upgrade-to-premium-btn bg-white text-primary-600 font-bold py-1 px-3 rounded-full mt-3 text-sm">${sectionData.buttonText}</button></div>`; break; case 'signals': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">${sectionData.title}</h3><div class="flex space-x-4 overflow-x-auto pb-2 no-scrollbar"><div class="flex-shrink-0 text-center cursor-pointer signal-story-item"><div class="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-1 flex items-center justify-center"><div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center"><span class="text-xs font-bold text-green-500">BUY</span><span class="text-sm font-bold text-gray-800 dark:text-white">BTC</span></div></div><p class="text-xs mt-2 text-gray-600 dark:text-gray-300">BTC/USDT</p></div><div class="flex-shrink-0 text-center cursor-pointer signal-story-item"><div class="w-16 h-16 rounded-full bg-gradient-to-tr from-red-400 to-yellow-500 p-1 flex items-center justify-center"><div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center"><span class="text-xs font-bold text-red-500">SELL</span><span class="text-sm font-bold text-gray-800 dark:text-white">ETH</span></div></div><p class="text-xs mt-2 text-gray-600 dark:text-gray-300">ETH/USDT</p></div></div></div>`; break; case 'education_resume': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">${sectionData.title}</h3><div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex items-center p-3 space-x-4"><div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 flex items-center justify-center rounded-lg text-3xl">📚</div><div class="flex-1"><p class="font-semibold text-gray-800 dark:text-white">Analisa Teknikal Dasar</p><p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Bab 2: Membaca Pola Candlestick</p><div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2"><div class="bg-primary-500 h-1.5 rounded-full" style="width: 45%"></div></div></div><i class="fas fa-play-circle text-3xl text-primary-500"></i></div></div>`; break; case 'community_highlight': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">${sectionData.title}</h3><div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"><div class="flex items-start space-x-3"><img src="https://placehold.co/40x40/34d399/ffffff?text=B" alt="Avatar" class="w-10 h-10 rounded-full"><div><p class="font-semibold text-gray-800 dark:text-white">Budi Santoso <span class="text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 px-2 py-0.5 rounded-full">Premium</span></p><p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Apakah ada yang punya pandangan tentang pergerakan SOL minggu ini?</p></div></div></div></div>`; break; case 'event_highlight': const event = eventsDB[sectionData.eventId]; if(event) { html = `<div><div class="flex justify-between items-center mb-2"><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200">${sectionData.title}</h3><button class="view-all-events-btn text-sm font-semibold text-primary-600 dark:text-primary-400">${sectionData.viewAllText} &rarr;</button></div><div data-event-id="${sectionData.eventId}" class="event-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer"><img src="${event.image}" alt="${event.title}" class="w-full h-32 object-cover"><div class="p-4"><p class="font-bold text-gray-800 dark:text-white">${event.title}</p><div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2"><i class="fas fa-calendar-alt w-4 mr-1.5"></i> ${event.date}</div></div></div></div>`; } break; } return html; };
        const header = wrapper.querySelector('.flex.justify-between.items-center');
        wrapper.innerHTML = '';
        if (header) wrapper.appendChild(header);
        homeLayoutData.forEach(section => { const sectionWrapper = document.createElement('div'); sectionWrapper.innerHTML = renderSection(section); wrapper.appendChild(sectionWrapper); });
    };

    // === LOGIKA HALAMAN SINYAL ===
    const initSignalsPage = () => {
        const signalsData = [ { id: 1, pair: 'BTC/USDT', action: 'BUY', entry: '68,500', stopLoss: '67,800', targets: ['69,500', '70,000', '71,200'], type: 'premium', time: '1 jam lalu' }, { id: 2, pair: 'ETH/USDT', action: 'SELL', entry: '3,800', stopLoss: '3,950', targets: ['3,700', '3,650'], type: 'gratis', time: '3 jam lalu' }, { id: 3, pair: 'SOL/USDT', action: 'BUY', entry: '168.00', stopLoss: '162.50', targets: ['175.00', '180.00', '185.00'], type: 'premium', time: '8 jam lalu' }, ];
        const historyData = [ { id: 4, pair: 'ADA/USDT', entry: '0.4500', close: '0.4850 (+7.78%)', status: 'TP1 Hit', type: 'gratis' }, { id: 5, pair: 'DOGE/USDT', entry: '0.1580', close: '0.1510 (-4.43%)', status: 'SL Hit', type: 'premium' }, ];
        const tabBerjalan = document.getElementById('tab-berjalan');
        const tabRiwayat = document.getElementById('tab-riwayat');
        const listBerjalan = document.getElementById('list-berjalan');
        const listRiwayat = document.getElementById('list-riwayat');
        const winrateInfoBtn = document.getElementById('winrate-info-btn');
        const winratePopup = document.getElementById('winrate-info-popup');
        const closeWinratePopupBtn = document.getElementById('close-winrate-popup-btn');
        const renderSignalList = (signals, container, isHistory = false) => {
            if (!container) return;
            container.innerHTML = '';
            if (signals.length === 0) { container.innerHTML = '<p class="text-center text-gray-500 text-sm py-8">Tidak ada sinyal saat ini.</p>'; return; }
            signals.forEach(signal => {
                const isLocked = signal.type === 'premium' && !userIsPremium;
                const card = document.createElement('div');
                card.className = 'signal-card bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md relative overflow-hidden';
                let contentHtml = '';
                if (isLocked && !isHistory) {
                    card.classList.add('signal-locked');
                    contentHtml = ` <div class="signal-details"> <div class="flex justify-between items-start mb-3"> <div> <span class="font-bold text-lg text-gray-800 dark:text-white">${signal.pair}</span> <span class="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">PREMIUM</span> </div> <span class="text-xs text-gray-500 dark:text-gray-400">${signal.time}</span> </div> <div class="grid grid-cols-2 gap-3 text-sm mb-3"> <div class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-center"><p class="text-gray-500 dark:text-gray-400 font-medium">Entri</p><p class="font-semibold text-gray-700 dark:text-gray-200">******</p></div> <div class="bg-red-50 dark:bg-red-900/50 p-2 rounded text-center"><p class="text-red-600 dark:text-red-400 font-medium">Stop Loss</p><p class="font-semibold text-gray-700 dark:text-gray-200">******</p></div> </div> </div> <div class="locked-overlay"> <i class="fas fa-lock text-3xl text-yellow-500"></i> <button class="upgrade-to-premium-btn mt-4 bg-primary-600 text-white font-bold py-2 px-5 rounded-full text-sm hover:bg-primary-700">Upgrade ke Premium</button> </div> `;
                } else if (isHistory) {
                    const statusColor = signal.status.includes('TP') ? 'text-primary-500' : 'text-red-500';
                    const statusBg = signal.status.includes('TP') ? 'bg-primary-500' : 'bg-red-500';
                    contentHtml = ` <div class="flex justify-between items-start mb-3"> <div> <span class="font-bold text-lg text-gray-800 dark:text-white">${signal.pair}</span> ${signal.type === 'premium' ? '<span class="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">PREMIUM</span>' : ''} </div> <span class="text-xs font-semibold ${statusBg} text-white px-3 py-1 rounded-full">${signal.status}</span> </div> <div class="grid grid-cols-2 gap-3 text-sm"> <div><p class="text-gray-500 dark:text-gray-400">Entri</p><p class="font-semibold text-gray-700 dark:text-gray-200">${signal.entry}</p></div> <div class="text-right"><p class="text-gray-500 dark:text-gray-400">Close</p><p class="font-semibold ${statusColor}">${signal.close}</p></div> </div> `;
                } else {
                    const actionColor = signal.action === 'BUY' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
                    const targetsHtml = signal.targets.map((target, index) => `<div class="flex justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><span>Take Profit ${index + 1}</span><span class="font-semibold">${target}</span></div>`).join('');
                    contentHtml = ` <div class="flex justify-between items-start mb-3"> <div> <span class="font-bold text-lg text-gray-800 dark:text-white">${signal.pair}</span> <span class="ml-2 text-xs font-semibold ${actionColor} px-2 py-1 rounded-full">${signal.action}</span> ${signal.type === 'premium' ? '<span class="ml-2 text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">PREMIUM</span>' : ''} </div> <span class="text-xs text-gray-500 dark:text-gray-400">${signal.time}</span> </div> <div class="grid grid-cols-2 gap-3 text-sm mb-3"> <div class="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-center"><p class="text-gray-500 dark:text-gray-400 font-medium">Entri</p><p class="font-semibold text-gray-700 dark:text-gray-200">${signal.entry}</p></div> <div class="bg-red-50 dark:bg-red-900/50 p-2 rounded text-center"><p class="text-red-600 dark:text-red-400 font-medium">Stop Loss</p><p class="font-semibold text-gray-700 dark:text-gray-200">${signal.stopLoss}</p></div> </div> <button class="tp-toggle-button w-full text-sm font-semibold text-primary-600 dark:text-primary-400 p-2 bg-primary-50 dark:bg-primary-900/50 rounded-md">Lihat Target <i class="fas fa-chevron-down ml-1 transition-transform"></i></button> <div class="tp-dropdown mt-2 space-y-2 text-sm">${targetsHtml}</div> `;
                }
                card.innerHTML = contentHtml;
                container.appendChild(card);
            });
        };
        if(tabBerjalan) tabBerjalan.addEventListener('click', () => { listBerjalan.classList.remove('hidden'); listRiwayat.classList.add('hidden'); tabBerjalan.classList.add('active'); tabRiwayat.classList.remove('active'); });
        if(tabRiwayat) tabRiwayat.addEventListener('click', () => { listRiwayat.classList.remove('hidden'); listBerjalan.classList.add('hidden'); tabRiwayat.classList.add('active'); tabBerjalan.classList.remove('active'); });
        const animateTwoColorChart = (winPercentage, losePercentage) => { const winCircle = document.getElementById('win-rate-circle'); const loseCircle = document.getElementById('lose-rate-circle'); const winrateText = document.getElementById('winrate-text'); const profitPercentageText = document.getElementById('profit-percentage'); const losePercentageText = document.getElementById('lose-percentage'); if (!winCircle || !loseCircle || !winrateText || !profitPercentageText || !losePercentageText) return; const radius = winCircle.r.baseVal.value; const circumference = 2 * Math.PI * radius; winCircle.style.strokeDasharray = circumference; loseCircle.style.strokeDasharray = circumference; const winOffset = circumference - (winPercentage / 100) * circumference; const loseOffset = circumference - (losePercentage / 100) * circumference; const loseRotation = -90 + (winPercentage * 3.6); loseCircle.style.transform = `rotate(${loseRotation}deg)`; setTimeout(() => { winCircle.style.strokeDashoffset = winOffset; loseCircle.style.strokeDashoffset = loseOffset; }, 100); const animateText = (element, finalValue, decimal = 0) => { let currentVal = 0; const step = finalValue / (1000 / 15); const interval = setInterval(() => { currentVal += step; if (currentVal >= finalValue) { clearInterval(interval); element.textContent = `${finalValue.toFixed(decimal)}%`; } else { element.textContent = `${currentVal.toFixed(decimal)}%`; } }, 15); }; animateText(winrateText, winPercentage, 1); animateText(profitPercentageText, winPercentage, 1); animateText(losePercentageText, losePercentage, 1); };
        animateTwoColorChart(85.7, 14.3);
        if(winrateInfoBtn) winrateInfoBtn.addEventListener('click', () => openModal(winratePopup));
        if(closeWinratePopupBtn) closeWinratePopupBtn.addEventListener('click', () => closeModal(winratePopup));
        if(winratePopup) winratePopup.addEventListener('click', (e) => { if(e.target === winratePopup) closeModal(winratePopup); });
        renderSignalList(signalsData, listBerjalan, false);
        renderSignalList(historyData, listRiwayat, true);
    };

    const initCommunityPage = () => {
        const myUserData = { name: 'Andi Wijaya', avatar: 'https://placehold.co/40x40/ffffff/15803d?text=A' };
        let storiesData = [ { id: 1, user: 'Budi S.', avatar: 'https://placehold.co/64x64/34d399/ffffff?text=B', storyImage: 'https://placehold.co/375x812/22c55e/ffffff?text=Profit+Hari+Ini!', viewed: false }, { id: 2, user: 'Siti A.', avatar: 'https://placehold.co/64x64/f87171/ffffff?text=S', storyImage: 'https://placehold.co/375x812/f43f5e/ffffff?text=Analisa+BTC', viewed: false }, ];
        let postsData = [ { id: 1, userId: 'budi_s', author: 'Budi Santoso', avatar: 'https://placehold.co/40x40/34d399/ffffff?text=B', time: '2 jam lalu', content: 'Apakah ada yang punya pandangan tentang pergerakan SOL minggu ini? Sepertinya akan ada breakout.', likes: 12, comments: 5, reposts: 2 }, { id: 2, userId: 'siti_a', author: 'Siti Aminah', avatar: 'https://placehold.co/40x40/f87171/ffffff?text=S', time: '5 jam lalu', content: 'Sharing profit dari sinyal BTC kemarin, lumayan buat beli kopi! 🚀', image: 'https://placehold.co/600x400/dcfce7/14532d?text=Profit+Chart', likes: 35, comments: 11, reposts: 8 }, { id: 3, userId: 'eko_j', author: 'Eko J.', avatar: 'https://placehold.co/40x40/60a5fa/ffffff?text=E', time: '1 hari lalu', content: 'Polling cepat: Aset mana yang paling bullish minggu depan?', poll: { question: 'Aset paling bullish?', options: ['BTC', 'ETH', 'SOL'], votes: [15, 28, 22], totalVotes: 65, voted: false }, likes: 18, comments: 9, reposts: 4 }, ];
        const storiesContainer = document.getElementById('stories-container');
        const communityFeed = document.getElementById('community-feed');
        const storyModal = document.getElementById('story-modal');
        const addStoryBtn = document.getElementById('add-story-btn');
        const cancelStoryBtn = document.getElementById('cancel-story-btn');
        const submitStoryBtn = document.getElementById('submit-story-btn');
        const storyUploadArea = document.getElementById('story-upload-area');
        const storyFileInput = document.getElementById('story-file-input');
        const storyPreview = document.getElementById('story-preview');
        const postModal = document.getElementById('post-modal');
        const openPostModalBtn = document.getElementById('open-post-modal-btn');
        const closePostModalBtn = document.getElementById('close-post-modal-btn');
        const postTextarea = document.getElementById('post-textarea');
        const submitPostBtn = document.getElementById('submit-post-btn');
        const postImageBtn = document.getElementById('post-image-btn');
        const imageFileInput = document.getElementById('image-file-input');
        const imagePreviewContainer = document.getElementById('image-preview-container');
        const imagePreview = document.getElementById('image-preview');
        const removeImageBtn = document.getElementById('remove-image-btn');
        const postPollBtn = document.getElementById('post-poll-btn');
        const pollCreationArea = document.getElementById('poll-creation-area');
        const addPollOptionBtn = document.getElementById('add-poll-option-btn');
        const storyViewer = document.getElementById('story-viewer');
        const closeStoryBtn = document.getElementById('close-story-btn');
        const storyProgressBarsContainer = document.getElementById('story-progress-bars');
        const storyImage = document.getElementById('story-image');
        const storyUserAvatar = document.getElementById('story-user-avatar');
        const storyUserName = document.getElementById('story-user-name');
        const storyNavPrev = document.getElementById('story-nav-prev');
        const storyNavNext = document.getElementById('story-nav-next');
        let storyTimeout, storyQueue = [], currentStoryIndex = -1;
        function openStoryViewer(clickedStoryId) { const clickedStory = storiesData.find(s => s.id == clickedStoryId); if (!clickedStory) return; storyQueue = [ clickedStory, ...storiesData.filter(s => s.id != clickedStoryId && !s.viewed) ]; if (storyProgressBarsContainer) { storyProgressBarsContainer.innerHTML = ''; storyQueue.forEach(() => { storyProgressBarsContainer.innerHTML += `<div class="progress-bar-background flex-1 bg-white/30 rounded-full h-full"><div class="bg-white h-full rounded-full" style="width: 0%;"></div></div>`; }); } currentStoryIndex = -1; openModal(storyViewer); playNextStory(); }
        function closeStoryViewer() { closeModal(storyViewer); clearTimeout(storyTimeout); renderStories(); }
        function playNextStory() { currentStoryIndex++; if (currentStoryIndex < storyQueue.length) { const story = storyQueue[currentStoryIndex]; if (storyImage) storyImage.src = story.storyImage; if (storyUserAvatar) storyUserAvatar.src = story.avatar; if (storyUserName) storyUserName.textContent = story.user; if (storyProgressBarsContainer) { storyProgressBarsContainer.querySelectorAll('.progress-bar-background > div').forEach((bar, index) => { bar.classList.remove('animate-progress'); bar.style.width = index < currentStoryIndex ? '100%' : '0%'; }); const currentProgressBar = storyProgressBarsContainer.children[currentStoryIndex]?.querySelector('div'); if(currentProgressBar) { void currentProgressBar.offsetWidth; currentProgressBar.classList.add('animate-progress'); } } story.viewed = true; clearTimeout(storyTimeout); storyTimeout = setTimeout(playNextStory, 5000); } else { closeStoryViewer(); } }
        function renderStories() { if (!storiesContainer) return; storiesContainer.querySelectorAll('.story-item').forEach(el => el.remove()); storiesData.forEach(story => { const storyEl = document.createElement('div'); storyEl.className = 'story-item flex-shrink-0 text-center cursor-pointer'; storyEl.dataset.storyId = story.id; storyEl.innerHTML = ` <div class="w-16 h-16 rounded-full p-1 story-ring ${story.viewed ? 'viewed' : ''}"> <div class="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5"> <img src="${story.avatar}" alt="${story.user}" class="w-full h-full rounded-full object-cover"> </div> </div> <p class="text-xs mt-2 text-gray-600 dark:text-gray-300">${story.user}</p>`; storiesContainer.appendChild(storyEl); }); }
        function createPostElement(data) {
            const postCard = document.createElement('div');
            postCard.className = 'bg-white dark:bg-gray-800 p-4';
            postCard.dataset.postId = data.id;
            const imageHtml = data.image ? `<img class="mt-3 rounded-lg w-full object-cover border dark:border-gray-700" src="${data.image}"/>` : '';
            let pollHtml = '';
            if (data.poll) {
                const pollOptionsHtml = data.poll.options.map((option, index) => {
                    const percentage = data.poll.totalVotes > 0 ? (data.poll.votes[index] / data.poll.totalVotes) * 100 : 0;
                    return ` <div class="poll-option relative mt-2 text-sm font-semibold cursor-pointer" data-option-index="${index}"> <div class="absolute top-0 left-0 h-full bg-primary-500/20 rounded-md poll-option-bar" style="width: ${data.poll.voted ? percentage : 0}%;"></div> <div class="relative flex justify-between items-center border border-gray-300 dark:border-gray-600 rounded-md p-2"> <span>${option}</span> ${data.poll.voted ? `<span>${percentage.toFixed(0)}%</span>` : ''} </div> </div>`;
                }).join('');
                pollHtml = `<div class="mt-3 space-y-2 poll-container">${pollOptionsHtml}<p class="text-xs text-gray-500 mt-2">${data.poll.totalVotes} suara</p></div>`;
            }
            postCard.innerHTML = ` <div class="flex items-start space-x-3"> <img alt="Avatar" class="w-10 h-10 rounded-full cursor-pointer view-profile-btn" src="${data.avatar}" data-userid="${data.userId}"/> <div class="flex-1"> <div class="flex justify-between items-center"> <p class="font-semibold text-gray-800 dark:text-white cursor-pointer view-profile-btn" data-userid="${data.userId}">${data.author}</p> <span class="text-xs text-gray-400">${data.time}</span> </div> <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 whitespace-pre-wrap">${data.content}</p> ${imageHtml} ${pollHtml} <div class="flex justify-between text-gray-500 dark:text-gray-400 mt-4 pt-2 text-base"> <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors"><i class="far fa-heart"></i><span>${data.likes}</span></button> <button class="flex items-center space-x-1 hover:text-primary-500 transition-colors"><i class="far fa-comment-dots"></i><span>${data.comments}</span></button> <button class="flex items-center space-x-1 hover:text-pink-500 transition-colors"><i class="fas fa-retweet"></i><span>${data.reposts}</span></button> <button class="hover:text-blue-500 transition-colors"><i class="far fa-bookmark"></i></button> </div> </div> </div>`;
            return postCard;
        }
        function renderPosts() { if (!communityFeed) return; communityFeed.innerHTML = ''; postsData.forEach(post => communityFeed.appendChild(createPostElement(post))); }
        function resetStoryModal() { if(!storyFileInput) return; storyFileInput.value = ''; storyPreview.src = ''; storyPreview.classList.add('hidden'); storyUploadArea.classList.remove('hidden'); submitStoryBtn.disabled = true; closeModal(storyModal); }
        function resetPostModal() { if(!postTextarea) return; postTextarea.value = ''; imageFileInput.value = ''; imagePreview.src = ''; imagePreviewContainer.classList.add('hidden'); pollCreationArea.classList.add('hidden'); pollCreationArea.querySelectorAll('input').forEach((input, index) => { if(index > 1) input.remove(); else input.value = ''; }); submitPostBtn.disabled = false; closeModal(postModal); }
        if (addStoryBtn) addStoryBtn.addEventListener('click', () => openModal(storyModal));
        if (cancelStoryBtn) cancelStoryBtn.addEventListener('click', resetStoryModal);
        if (storyUploadArea) storyUploadArea.addEventListener('click', () => storyFileInput.click());
        if (storyFileInput) storyFileInput.addEventListener('change', e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { storyPreview.src = event.target.result; storyPreview.classList.remove('hidden'); storyUploadArea.classList.add('hidden'); submitStoryBtn.disabled = false; }; reader.readAsDataURL(file); } });
        if (submitStoryBtn) submitStoryBtn.addEventListener('click', () => { if (storyPreview.src) { storiesData.unshift({ id: Date.now(), user: myUserData.name, avatar: myUserData.avatar, storyImage: storyPreview.src, viewed: false }); renderStories(); resetStoryModal(); showMessage('Story berhasil diposting!'); } });
        if (openPostModalBtn) openPostModalBtn.addEventListener('click', () => openModal(postModal));
        if (postImageBtn) postImageBtn.addEventListener('click', () => { openModal(postModal); imageFileInput.click(); });
        if (postPollBtn) postPollBtn.addEventListener('click', () => { openModal(postModal); pollCreationArea.classList.remove('hidden'); });
        if (closePostModalBtn) closePostModalBtn.addEventListener('click', resetPostModal);
        if (imageFileInput) imageFileInput.addEventListener('change', e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { imagePreview.src = event.target.result; imagePreviewContainer.classList.remove('hidden'); }; reader.readAsDataURL(file); } });
        if (removeImageBtn) removeImageBtn.addEventListener('click', () => { imageFileInput.value = ''; imagePreview.src = ''; imagePreviewContainer.classList.add('hidden'); });
        if (addPollOptionBtn) addPollOptionBtn.addEventListener('click', () => { if (pollCreationArea.querySelectorAll('input').length < 4) { const newInput = document.createElement('input'); newInput.type = 'text'; newInput.className = 'poll-option-input w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-sm'; newInput.placeholder = `Opsi ${pollCreationArea.querySelectorAll('input').length + 1}`; document.getElementById('more-poll-options').appendChild(newInput); } else { showMessage('Maksimal 4 opsi polling.'); } });
        if (submitPostBtn) submitPostBtn.addEventListener('click', () => { const content = postTextarea.value.trim(); if (!content) { showMessage('Postingan tidak boleh kosong.'); return; } const newPost = { id: Date.now(), author: myUserData.name, avatar: myUserData.avatar, time: 'Baru saja', content: content, likes: 0, comments: 0, reposts: 0 }; if (!imagePreviewContainer.classList.contains('hidden')) { newPost.image = imagePreview.src; } if (!pollCreationArea.classList.contains('hidden')) { const options = Array.from(pollCreationArea.querySelectorAll('.poll-option-input')) .map(input => input.value.trim()) .filter(val => val !== ''); if (options.length >= 2) { newPost.poll = { question: content, options: options, votes: Array(options.length).fill(0), totalVotes: 0, voted: false }; } } postsData.unshift(newPost); renderPosts(); resetPostModal(); showMessage('Postingan berhasil dibuat!'); });
        if(communityFeed) communityFeed.addEventListener('click', e => { const pollOption = e.target.closest('.poll-option'); if (pollOption) { const postCard = e.target.closest('[data-post-id]'); const post = postsData.find(p => p.id == postCard.dataset.postId); if (post && post.poll && !post.poll.voted) { const optionIndex = parseInt(pollOption.dataset.optionIndex); post.poll.votes[optionIndex]++; post.poll.totalVotes++; post.poll.voted = true; renderPosts(); } else if (post && post.poll && post.poll.voted) { showMessage("Anda sudah memberikan suara."); } } });
        if (storiesContainer) storiesContainer.addEventListener('click', e => { const storyItem = e.target.closest('.story-item'); if (storyItem) openStoryViewer(storyItem.dataset.storyId); });
        if (closeStoryBtn) closeStoryBtn.addEventListener('click', closeStoryViewer);
        if (storyNavPrev) storyNavPrev.addEventListener('click', () => { if (currentStoryIndex > 0) { currentStoryIndex -= 2; clearTimeout(storyTimeout); playNextStory(); } });
        if (storyNavNext) storyNavNext.addEventListener('click', () => { clearTimeout(storyTimeout); playNextStory(); });
        renderStories();
        renderPosts();
    };

    const initEducationPage = () => {
        const educationContainer = document.getElementById('education-container');
        if (!educationContainer) return;
        const premiumModal = document.getElementById('upgrade-premium-modal'); 
        const coursesData = { 'tech-analysis': { title: 'Analisa Teknikal Dasar', type: 'GRATIS', image: 'https://placehold.co/400x200/a7f3d0/1f2937?text=Crypto', lessonsCount: 3, duration: '37 menit', description: 'Kursus ini sepenuhnya gratis.', chapters: [ { title: 'Dasar-dasar', lessons: [ { id: 'ta1', title: 'Apa itu Analisa Teknikal?', type: 'video', duration: '10:00', premium: false, content: { videoId: 'J8B52D2Q-z4' } }, { id: 'ta2', title: 'Membaca Candlestick', type: 'artikel', duration: '15 mnt', premium: false, content: { text: 'Pola candlestick adalah representasi visual dari pergerakan harga...' } }, { id: 'ta3', title: 'Support & Resistance', type: 'video', duration: '12:00', premium: false, content: { videoId: 'e_n_gE-T-Yk' } }, ]}] }, 'risk-management': { title: 'Manajemen Risiko Pro', type: 'PREMIUM', image: 'https://placehold.co/400x200/fef08a/422006?text=Finance', lessonsCount: 4, duration: '30 menit', description: 'Lindungi modal Anda dengan strategi manajemen risiko profesional.', chapters: [ { title: 'Manajemen Modal', lessons: [ { id: 'rm1', title: 'Pengenalan Manajemen Risiko', type: 'video', duration: '08:00', premium: false, content: { videoId: 'f-0W-B6sTTU' } }, { id: 'rm2', title: 'Menentukan Stop Loss', type: 'video', duration: '10:00', premium: true }, { id: 'rm3', title: 'Rasio Risk/Reward', type: 'artikel', duration: '07 mnt', premium: true, content: { text: 'Rasio risk/reward adalah perbandingan...' } }, { id: 'rm4', title: 'Studi Kasus', type: 'video', duration: '05:00', premium: true }, ]}] }, };
        let userProgress = { 'tech-analysis': ['ta1'] };
        const showView = (viewId) => { educationContainer.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById(viewId)?.classList.add('active'); lenis.scrollTo(0, { immediate: true }); };
        const renderCourseList = () => { const content = document.getElementById('course-list-content'); if(!content) return; content.innerHTML = `<div class="bg-gradient-to-r from-primary-600 to-green-400 text-white p-5 rounded-xl shadow-lg"><h2 class="font-bold text-lg">Tingkatkan Skill Trading Anda</h2><p class="text-sm mt-1 opacity-90">Jadilah anggota premium untuk akses tanpa batas.</p><button class="upgrade-to-premium-btn bg-white text-primary-600 font-bold py-1.5 px-4 rounded-full mt-4 text-sm">Upgrade</button></div><div><h3 class="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">Semua Kursus</h3><div id="all-courses-grid" class="grid grid-cols-1 gap-4"></div></div>`; const grid = document.getElementById('all-courses-grid'); for (const courseId in coursesData) { const course = coursesData[courseId]; const card = document.createElement('div'); card.className = 'course-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer'; card.dataset.courseId = courseId; card.innerHTML = `<img src="${course.image}" alt="${course.title}" class="w-full h-32 object-cover"><div class="p-3"><p class="text-xs font-semibold ${course.type === 'GRATIS' ? 'text-primary-500' : 'text-yellow-500'}">${course.type}</p><h4 class="font-bold text-gray-800 dark:text-white mt-1">${course.title}</h4><p class="text-xs text-gray-500 dark:text-gray-400 mt-2">${course.lessonsCount} Pelajaran • ${course.duration}</p></div>`; grid.appendChild(card); } };
        const renderCourseDetail = (courseId) => { const course = coursesData[courseId]; const progress = userProgress[courseId] || []; const progressPercentage = (progress.length / course.lessonsCount) * 100; const detailView = document.getElementById('education-detail-view'); let chaptersHtml = course.chapters.map(chapter => { let lessonsHtml = chapter.lessons.map(lesson => { const isCompleted = progress.includes(lesson.id); const isLocked = lesson.premium && !userIsPremium; const icon = lesson.type === 'video' ? 'fa-play-circle' : 'fa-file-alt'; return `<div class="lesson-item flex items-center space-x-4 p-3 rounded-lg ${!isLocked ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}" data-lesson-id="${lesson.id}" data-course-id="${courseId}" data-locked="${isLocked}"><i class="fas ${isCompleted ? 'fa-check-circle text-primary-500' : icon + ' text-gray-400'} text-xl w-6 text-center"></i><div class="flex-1"><p class="font-semibold text-gray-800 dark:text-white">${lesson.title}</p><p class="text-xs text-gray-500 dark:text-gray-400">${lesson.duration}</p></div>${isLocked ? '<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"><i class="fas fa-lock text-yellow-500"></i></div>' : ''}</div>`; }).join(''); return `<div class="mt-4"><h4 class="font-bold text-gray-800 dark:text-gray-200">${chapter.title}</h4><div class="mt-2 space-y-1">${lessonsHtml}</div></div>`; }).join(''); detailView.innerHTML = `<div class="p-4"><button class="back-to-list-btn font-semibold text-gray-600 dark:text-gray-300"><i class="fas fa-arrow-left mr-2"></i>Semua Kursus</button></div><img src="${course.image}" class="w-full h-48 object-cover"><div class="p-4"><p class="font-semibold ${course.type === 'GRATIS' ? 'text-primary-500' : 'text-yellow-500'}">${course.type}</p><h2 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">${course.title}</h2><p class="text-gray-600 dark:text-gray-400 mt-2 text-sm">${course.description}</p><div class="mt-4"><div class="flex justify-between text-xs font-semibold text-gray-500 mb-1"><span>PROGRES</span><span>${progressPercentage.toFixed(0)}%</span></div><div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-primary-500 h-2 rounded-full" style="width: ${progressPercentage}%"></div></div></div><div class="mt-6">${chaptersHtml}</div></div>`; showView('education-detail-view'); };
        const renderLessonPlayer = (courseId, lessonId) => { const course = coursesData[courseId]; const lesson = course.chapters.flatMap(c => c.lessons).find(l => l.id === lessonId); const playerView = document.getElementById('lesson-player-view'); let contentHtml = ''; if (lesson.type === 'video' && lesson.content.videoId) { contentHtml = `<div class="aspect-w-16 bg-black rounded-lg overflow-hidden shadow-lg"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${lesson.content.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`; } else if (lesson.type === 'artikel' && lesson.content.text) { contentHtml = `<div class="bg-white dark:bg-gray-800 p-5 rounded-lg text-gray-700 dark:text-gray-300 shadow-lg"><h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${lesson.title}</h1><p class="text-base leading-relaxed mb-4">${lesson.content.text}</p><p class="text-base leading-relaxed">Ini adalah contoh teks tambahan untuk membuat artikel terlihat lebih panjang dan lengkap.</p></div>`; } else { contentHtml = `<div class="aspect-w-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p class="text-gray-500">Konten tidak tersedia.</p></div>`; } playerView.innerHTML = `<div class="p-4"><button class="back-to-detail-btn font-semibold text-gray-600 dark:text-gray-300" data-course-id="${courseId}"><i class="fas fa-arrow-left mr-2"></i>Kembali ke Kursus</button></div><div class="px-4">${contentHtml}</div><div class="p-4"><h3 class="text-xl font-bold text-gray-800 dark:text-white mt-2">${lesson.title}</h3><p class="text-sm text-gray-500 dark:text-gray-400">${course.title}</p><button class="mark-complete-btn w-full border-2 border-primary-500 text-primary-500 font-bold py-2 rounded-lg mt-6 hover:bg-primary-500 hover:text-white transition-colors" data-course-id="${courseId}" data-lesson-id="${lessonId}">Tandai Selesai</button></div>`; showView('lesson-player-view'); };
        educationContainer.addEventListener('click', (e) => { const courseCard = e.target.closest('.course-card'); const backToListBtn = e.target.closest('.back-to-list-btn'); const backToDetailBtn = e.target.closest('.back-to-detail-btn'); const lessonItem = e.target.closest('.lesson-item'); const markCompleteBtn = e.target.closest('.mark-complete-btn'); if (courseCard) renderCourseDetail(courseCard.dataset.courseId); if (backToListBtn) showView('education-list-view'); if (backToDetailBtn) renderCourseDetail(backToDetailBtn.dataset.courseId); if (lessonItem) { if (lessonItem.dataset.locked === 'true') { openModal(premiumModal); } else { renderLessonPlayer(lessonItem.dataset.courseId, lessonItem.dataset.lessonId); } } if (markCompleteBtn) { const { courseId, lessonId } = markCompleteBtn.dataset; if (!userProgress[courseId]) userProgress[courseId] = []; if (!userProgress[courseId].includes(lessonId)) userProgress[courseId].push(lessonId); renderCourseDetail(courseId); } });
        renderCourseList();
    };

    const initProfilePage = () => {
        const postCountEl = document.getElementById('post-count');
        const likeCountEl = document.getElementById('like-count');
        const expertBadge = document.getElementById('expert-badge');
        const profileButtons = document.querySelectorAll('.profile-button');
        const userData = { posts: 56, likes: 1200, };
        const coursesData = { 'tech-analysis': { lessonsCount: 3 }, 'risk-management': { lessonsCount: 4 }, };
        let userProgress = { 'tech-analysis': ['ta1', 'ta2', 'ta3'], 'risk-management': ['rm1', 'rm2', 'rm3', 'rm4'] };
        const calculateEducationProgress = () => { let totalLessons = 0; let completedLessons = 0; for (const courseId in coursesData) { totalLessons += coursesData[courseId].lessonsCount; if (userProgress[courseId]) { completedLessons += userProgress[courseId].length; } } return totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0; };
        const progressPercentage = calculateEducationProgress();
        if(postCountEl) postCountEl.textContent = userData.posts;
        if(likeCountEl) likeCountEl.textContent = userData.likes > 999 ? `${(userData.likes/1000).toFixed(1)}k` : userData.likes;
        const skillCircle = document.getElementById('skill-progress-circle');
        const skillText = document.getElementById('skill-progress-text');
        if (skillCircle && skillText) { const radius = skillCircle.r.baseVal.value; const circumference = 2 * Math.PI * radius; skillCircle.style.strokeDasharray = circumference; const offset = circumference - (progressPercentage / 100) * circumference; setTimeout(() => skillCircle.style.strokeDashoffset = offset, 100); let currentPercent = 0; const interval = setInterval(() => { if (currentPercent >= progressPercentage) { clearInterval(interval); skillText.textContent = `${progressPercentage.toFixed(0)}%`; } else { currentPercent++; skillText.textContent = `${Math.min(currentPercent, progressPercentage).toFixed(0)}%`; } }, 15); }
        if (progressPercentage >= 100 && expertBadge) { expertBadge.classList.remove('hidden'); }
        if(profileButtons) profileButtons.forEach(button => { button.addEventListener('click', () => { const action = button.dataset.action; showMessage(`Tombol "${action}" diklik!`); }); });
    };

    const initUserProfilePage = () => {
        const userId = currentScreenParams.userId;
        const userData = usersDB[userId];

        if (!userData) {
            mainContent.innerHTML = '<p class="text-center text-red-500 p-8">Pengguna tidak ditemukan.</p>';
            return;
        }
        const backBtn = document.getElementById('back-to-community-btn');
        const header = document.getElementById('user-profile-header');
        const avatar = document.getElementById('user-avatar');
        const name = document.getElementById('user-name');
        const premiumBadge = document.getElementById('user-premium-badge');
        const expertBadge = document.getElementById('user-expert-badge');
        const joinDate = document.getElementById('user-join-date');
        const postCount = document.getElementById('user-post-count');
        const likeCount = document.getElementById('user-like-count');
        const reputation = document.getElementById('user-reputation');
        if(header) header.textContent = userData.name;
        if(avatar) avatar.src = userData.avatar;
        if(name) name.textContent = userData.name;
        if(joinDate) joinDate.textContent = `Bergabung ${userData.joinDate}`;
        if(postCount) postCount.textContent = userData.posts;
        if(likeCount) likeCount.textContent = userData.likes > 999 ? `${(userData.likes/1000).toFixed(1)}k` : userData.likes;
        if(reputation) reputation.textContent = userData.reputation > 999 ? `${(userData.reputation/1000).toFixed(1)}k` : userData.reputation;

        if(premiumBadge) premiumBadge.style.display = userData.isPremium ? 'flex' : 'none';
        if(expertBadge) expertBadge.style.display = userData.isExpert ? 'flex' : 'none';
        if(backBtn) backBtn.addEventListener('click', () => loadScreen('community'));
    };

    const initEventsPage = () => {
        const upcomingListContainer = document.getElementById('event-list-upcoming');
        const historyListContainer = document.getElementById('event-list-history');
        const tabUpcoming = document.getElementById('tab-upcoming');
        const tabHistory = document.getElementById('tab-history');

        const createEventCard = (eventId, event) => {
            return `
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer event-card" data-event-id="${eventId}">
                <img src="${event.image}" alt="${event.title}" class="w-full h-36 object-cover">
                <div class="p-4">
                    <span class="text-xs font-semibold ${event.type === 'Online' ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-400'}">${event.type}</span>
                    <h4 class="font-bold text-gray-800 dark:text-white mt-1">${event.title}</h4>
                    <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-3">
                        <i class="fas fa-calendar-alt w-4 mr-1.5"></i>
                        <span>${event.date}</span>
                    </div>
                    <div class="mt-3 text-right font-bold text-primary-600 dark:text-primary-400">${event.price}</div>
                </div>
            </div>`;
        };

        const renderLists = () => {
            if (!upcomingListContainer || !historyListContainer) return;
            upcomingListContainer.innerHTML = '';
            historyListContainer.innerHTML = '';
            
            const upcomingEvents = Object.entries(eventsDB).filter(([id, event]) => event.status === 'upcoming');
            const historyEvents = Object.entries(eventsDB).filter(([id, event]) => event.status === 'history');

            upcomingEvents.forEach(([id, event]) => upcomingListContainer.innerHTML += createEventCard(id, event));
            historyEvents.forEach(([id, event]) => historyListContainer.innerHTML += createEventCard(id, event));

            if (upcomingEvents.length === 0) upcomingListContainer.innerHTML = '<p class="text-center text-sm text-gray-500 py-10">Tidak ada event akan datang.</p>';
            if (historyEvents.length === 0) historyListContainer.innerHTML = '<p class="text-center text-sm text-gray-500 py-10">Tidak ada riwayat event.</p>';
        };

        if(tabUpcoming) tabUpcoming.addEventListener('click', () => {
            upcomingListContainer.classList.remove('hidden');
            historyListContainer.classList.add('hidden');
            tabUpcoming.classList.add('active');
            tabHistory.classList.remove('active');
        });

        if(tabHistory) tabHistory.addEventListener('click', () => {
            historyListContainer.classList.remove('hidden');
            upcomingListContainer.classList.add('hidden');
            tabHistory.classList.add('active');
            tabUpcoming.classList.remove('active');
        });

        renderLists();
    };
    
    const initEventDetailPage = () => {
        const eventId = currentScreenParams.eventId;
        const event = eventsDB[eventId];
        if (!event) { mainContent.innerHTML = '<p class="text-center text-red-500 p-8">Event tidak ditemukan.</p>'; return; }
        document.getElementById('event-banner').src = event.image;
        document.getElementById('event-title').textContent = event.title;
        document.getElementById('event-date').textContent = event.date;
        document.getElementById('event-location').textContent = event.location;
        document.getElementById('event-price').textContent = event.price;
        document.getElementById('event-description').textContent = event.description;
        const registerBtn = document.getElementById('register-event-btn');
        if (event.status === 'history') {
            registerBtn.textContent = 'Event Telah Selesai';
            registerBtn.disabled = true;
            registerBtn.classList.add('bg-gray-400', 'dark:bg-gray-600', 'cursor-not-allowed');
            registerBtn.classList.remove('bg-primary-600', 'hover:bg-primary-700');
        }
    };

    // === INISIALISASI APLIKASI ===
    const initApp = () => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        const initialIcon = html.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        document.querySelectorAll('#theme-toggle, #theme-toggle-community, #theme-toggle-education').forEach(btn => {
                if(btn) btn.innerHTML = initialIcon;
        });
        loadScreen('login');
    };

    initApp();
});
