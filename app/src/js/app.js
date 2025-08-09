document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN GLOBAL & STATE ===
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const html = document.documentElement;
    let userIsPremium = false; // Ganti menjadi 'true' untuk simulasi pengguna premium

    // === Inisialisasi Lenis (Smooth Scroll) ===
    const lenis = new Lenis();
    function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    // === FUNGSI UTAMA ===
    const loadScreen = async (screenName) => {
        const currentContent = mainContent.firstElementChild;
        if (currentContent && !currentContent.classList.contains('loader')) {
            currentContent.classList.remove('page-visible');
        }
        setTimeout(async () => {
            bottomNav.style.display = screenName === 'login' ? 'none' : 'flex';
            mainContent.innerHTML = '<div class="loader">Loading Screen...</div>'; 
            try {
                const response = await fetch(`./src/screens/${screenName}.html?t=${new Date().getTime()}`);
                if (!response.ok) throw new Error('Screen not found');
                const newHtml = await response.text();
                mainContent.innerHTML = newHtml;
                const newPageElement = mainContent.firstElementChild;
                if (newPageElement) {
                    newPageElement.classList.add('page-transition');
                    requestAnimationFrame(() => { newPageElement.classList.add('page-visible'); });
                }
                lenis.scrollTo(0, { immediate: true, force: true });
                initScreenSpecific(screenName);
            } catch (error) {
                mainContent.innerHTML = `<div class="p-8 text-center text-red-500">${error.message}</div>`;
            }
        }, 200);
    };

    const initScreenSpecific = (screenName) => {
        if (screenName === 'home') initHomePage();
        if (screenName === 'signals') initSignalsPage();
        if (screenName === 'community') initCommunityPage();
        if (screenName === 'education') initEducationPage();
        if (screenName === 'profile') initProfilePage();
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
        const themeToggle = e.target.closest('#theme-toggle-community, #theme-toggle-education, #theme-toggle');
        if (themeToggle) {
            html.classList.toggle('dark');
            const icon = html.classList.contains('dark') ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
            document.querySelectorAll('#theme-toggle-community, #theme-toggle-education, #theme-toggle').forEach(btn => {
                if(btn) btn.innerHTML = icon;
            });
        }
    });

    // === LOGIKA HALAMAN BERANDA (LENGKAP) ===
    const initHomePage = () => {
        const wrapper = document.getElementById('home-content-wrapper');
        if (!wrapper) return;
        const homeLayoutData = [ { type: 'banner', title: 'Menjadi Anggota Premium', subtitle: 'Dapatkan akses sinyal eksklusif dan materi edukasi lengkap.', buttonText: 'Upgrade Sekarang' }, { type: 'signals', title: 'Sinyal Premium Terbaru' }, { type: 'education_resume', title: 'Lanjutkan Belajar' }, { type: 'community_highlight', title: 'Diskusi Komunitas' } ];
        const renderSection = (sectionData) => { let html = ''; switch (sectionData.type) { case 'banner': html = `<div class="bg-primary-500 text-white p-4 rounded-lg shadow-lg"><h2 class="font-bold text-lg">${sectionData.title}</h2><p class="text-sm mt-1">${sectionData.subtitle}</p><button class="bg-white text-primary-600 font-bold py-1 px-3 rounded-full mt-3 text-sm">${sectionData.buttonText}</button></div>`; break; case 'signals': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-3">${sectionData.title}</h3><div class="flex space-x-4 overflow-x-auto pb-2 no-scrollbar"><div class="flex-shrink-0 text-center cursor-pointer signal-story-item"><div class="w-16 h-16 rounded-full bg-gradient-to-tr from-green-400 to-blue-500 p-1 flex items-center justify-center"><div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center"><span class="text-xs font-bold text-green-500">BUY</span><span class="text-sm font-bold text-gray-800 dark:text-white">BTC</span></div></div><p class="text-xs mt-2 text-gray-600 dark:text-gray-300">BTC/USDT</p></div><div class="flex-shrink-0 text-center cursor-pointer signal-story-item"><div class="w-16 h-16 rounded-full bg-gradient-to-tr from-red-400 to-yellow-500 p-1 flex items-center justify-center"><div class="w-full h-full rounded-full bg-white dark:bg-gray-800 flex flex-col items-center justify-center"><span class="text-xs font-bold text-red-500">SELL</span><span class="text-sm font-bold text-gray-800 dark:text-white">ETH</span></div></div><p class="text-xs mt-2 text-gray-600 dark:text-gray-300">ETH/USDT</p></div></div></div>`; break; case 'education_resume': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">${sectionData.title}</h3><div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex items-center p-3 space-x-4"><div class="w-16 h-16 bg-primary-100 dark:bg-primary-900 flex items-center justify-center rounded-lg text-3xl">📚</div><div class="flex-1"><p class="font-semibold text-gray-800 dark:text-white">Analisa Teknikal Dasar</p><p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Bab 2: Membaca Pola Candlestick</p><div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2"><div class="bg-primary-500 h-1.5 rounded-full" style="width: 45%"></div></div></div><i class="fas fa-play-circle text-3xl text-primary-500"></i></div></div>`; break; case 'community_highlight': html = `<div><h3 class="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">${sectionData.title}</h3><div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow"><div class="flex items-start space-x-3"><img src="https://placehold.co/40x40/34d399/ffffff?text=B" alt="Avatar" class="w-10 h-10 rounded-full"><div><p class="font-semibold text-gray-800 dark:text-white">Budi Santoso <span class="text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 px-2 py-0.5 rounded-full">Premium</span></p><p class="text-sm text-gray-600 dark:text-gray-300 mt-1">Apakah ada yang punya pandangan tentang pergerakan SOL minggu ini?</p></div></div></div></div>`; break; } return html; };
        const header = wrapper.querySelector('.flex.justify-between.items-center');
        wrapper.innerHTML = '';
        if (header) wrapper.appendChild(header);
        homeLayoutData.forEach(section => { const sectionWrapper = document.createElement('div'); sectionWrapper.innerHTML = renderSection(section); wrapper.appendChild(sectionWrapper); });
    };
    
    // === LOGIKA HALAMAN SINYAL (LENGKAP) ===
    const initSignalsPage = () => {
        const tabBerjalan = document.getElementById('tab-berjalan');
        const tabRiwayat = document.getElementById('tab-riwayat');
        const listBerjalan = document.getElementById('list-berjalan');
        const listRiwayat = document.getElementById('list-riwayat');
        if(tabBerjalan) tabBerjalan.addEventListener('click', () => { listBerjalan.classList.remove('hidden'); listRiwayat.classList.add('hidden'); tabBerjalan.classList.add('active'); tabRiwayat.classList.remove('active'); });
        if(tabRiwayat) tabRiwayat.addEventListener('click', () => { listRiwayat.classList.remove('hidden'); listBerjalan.classList.add('hidden'); tabRiwayat.classList.add('active'); tabBerjalan.classList.remove('active'); });
        const listContainer = document.getElementById('list-berjalan');
        if(listContainer) listContainer.addEventListener('click', function(e) {
            const button = e.target.closest('.tp-toggle-button');
            if (button) { const dropdown = button.nextElementSibling; const icon = button.querySelector('i'); dropdown.classList.toggle('open'); icon.classList.toggle('rotate-180'); }
        });
        const animateWinrateChart = (percentage) => {
            const winrateCircle = document.getElementById('winrate-circle');
            const winrateText = document.getElementById('winrate-text');
            if(!winrateCircle) return;
            const radius = winrateCircle.r.baseVal.value;
            const circumference = 2 * Math.PI * radius;
            winrateCircle.style.strokeDasharray = circumference;
            const offset = circumference - (percentage / 100) * circumference;
            setTimeout(() => winrateCircle.style.strokeDashoffset = offset, 100);
            let currentPercent = 0;
            const interval = setInterval(() => {
                if (currentPercent >= percentage) { clearInterval(interval); winrateText.textContent = `${percentage.toFixed(1)}%`; } 
                else { currentPercent += 1; winrateText.textContent = `${Math.min(currentPercent, percentage).toFixed(0)}%`; }
            }, 10);
        };
        animateWinrateChart(85.7);
    };

    // === LOGIKA HALAMAN KOMUNITAS (LENGKAP) ===
    const initCommunityPage = () => {
        const communityFeed = document.getElementById('community-feed');
        const storiesContainer = document.getElementById('stories-container');
        const messageModal = document.getElementById('message-modal');
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
        const storyModal = document.getElementById('story-modal');
        const addStoryBtn = document.getElementById('add-story-btn');
        const storyUploadArea = document.getElementById('story-upload-area');
        const storyFileInput = document.getElementById('story-file-input');
        const storyPreview = document.getElementById('story-preview');
        const cancelStoryBtn = document.getElementById('cancel-story-btn');
        const submitStoryBtn = document.getElementById('submit-story-btn');
        const storyViewer = document.getElementById('story-viewer');
        const closeStoryBtn = document.getElementById('close-story-btn');
        const storyProgressBarsContainer = document.getElementById('story-progress-bars');
        const storyImage = document.getElementById('story-image');
        const storyUserAvatar = document.getElementById('story-user-avatar');
        const storyUserName = document.getElementById('story-user-name');
        const storyNavPrev = document.getElementById('story-nav-prev');
        const storyNavNext = document.getElementById('story-nav-next');
        
        let storyTimeout, storyQueue = [], currentStoryIndex = -1;
        const myUserData = { name: 'Andi Wijaya', avatar: 'https://placehold.co/64x64/ffffff/15803d?text=A' };
        let storiesData = [ { id: 1, user: 'Budi S.', avatar: 'https://placehold.co/64x64/34d399/ffffff?text=B', storyImage: 'https://placehold.co/375x812/22c55e/ffffff?text=Profit+Hari+Ini!', viewed: false }, { id: 2, user: 'Siti A.', avatar: 'https://placehold.co/64x64/f87171/ffffff?text=S', storyImage: 'https://placehold.co/375x812/f43f5e/ffffff?text=Analisa+BTC', viewed: false }, ];
        let postsData = [ { id: 1, author: 'Budi Santoso', avatar: 'https://placehold.co/40x40/34d399/ffffff?text=B', time: '2 jam lalu', content: 'Apakah ada yang punya pandangan tentang pergerakan SOL minggu ini? Sepertinya akan ada breakout.', likes: 12, comments: 5, reposts: 2 }, { id: 2, author: 'Siti Aminah', avatar: 'https://placehold.co/40x40/f87171/ffffff?text=S', time: '5 jam lalu', content: 'Sharing profit dari sinyal BTC kemarin, lumayan buat beli kopi! 🚀', image: 'https://placehold.co/600x400/dcfce7/14532d?text=Profit+Chart', likes: 35, comments: 11, reposts: 8 }, { id: 3, author: 'Eko J.', avatar: 'https://placehold.co/40x40/60a5fa/ffffff?text=E', time: '1 hari lalu', content: 'Polling cepat: Aset mana yang paling bullish minggu depan?', poll: { question: 'Aset paling bullish?', options: ['BTC', 'ETH', 'SOL'], votes: [15, 28, 22], totalVotes: 65, voted: false } , likes: 18, comments: 9, reposts: 4 }, ];

        const showMessage = (message, duration = 2000) => { if(messageModal) { messageModal.textContent = message; messageModal.classList.remove('opacity-0'); setTimeout(() => messageModal.classList.add('opacity-0'), duration); } };
        function renderStories() { if(!storiesContainer) return; storiesContainer.querySelectorAll('.story-item').forEach(el => el.remove()); storiesData.forEach(story => { const storyEl = document.createElement('div'); storyEl.className = 'story-item flex-shrink-0 text-center cursor-pointer'; storyEl.dataset.storyId = story.id; storyEl.innerHTML = `<div class="w-16 h-16 rounded-full p-1 story-ring ${story.viewed ? 'viewed' : ''}"><div class="w-full h-full bg-white dark:bg-gray-800 rounded-full p-0.5"><img src="${story.avatar}" alt="${story.user}" class="w-full h-full rounded-full object-cover"></div></div><p class="text-xs mt-2 text-gray-600 dark:text-gray-300">${story.user}</p>`; storiesContainer.appendChild(storyEl); }); }
        function openStoryViewer(clickedStoryId) { const clickedStory = storiesData.find(s => s.id == clickedStoryId); storyQueue = [ clickedStory, ...storiesData.filter(s => s.id != clickedStoryId) ]; storyProgressBarsContainer.innerHTML = ''; storyQueue.forEach(() => { storyProgressBarsContainer.innerHTML += `<div class="progress-bar-background flex-1 bg-white/30 rounded-full h-full"><div class="bg-white h-full rounded-full" style="width: 0%;"></div></div>`; }); currentStoryIndex = -1; storyViewer.classList.remove('hidden'); playNextStory(); }
        function closeStoryViewer() { if(storyViewer) storyViewer.classList.add('hidden'); clearTimeout(storyTimeout); renderStories(); }
        function playNextStory() { currentStoryIndex++; if (currentStoryIndex < storyQueue.length) { const story = storyQueue[currentStoryIndex]; storyImage.src = story.storyImage; storyUserAvatar.src = story.avatar; storyUserName.textContent = story.user; storyProgressBarsContainer.querySelectorAll('.progress-bar-background > div').forEach((bar, index) => { bar.classList.remove('animate-progress'); bar.style.width = index < currentStoryIndex ? '100%' : '0%'; }); const currentProgressBar = storyProgressBarsContainer.children[currentStoryIndex]?.querySelector('div'); if(currentProgressBar) { void currentProgressBar.offsetWidth; currentProgressBar.classList.add('animate-progress'); } story.viewed = true; clearTimeout(storyTimeout); storyTimeout = setTimeout(playNextStory, 5000); } else { closeStoryViewer(); } }
        if (storiesContainer) storiesContainer.addEventListener('click', e => { const storyItem = e.target.closest('.story-item'); if (storyItem) openStoryViewer(storyItem.dataset.storyId); });
        if (addStoryBtn) addStoryBtn.addEventListener('click', () => storyModal.classList.remove('hidden'));
        if (cancelStoryBtn) cancelStoryBtn.addEventListener('click', () => storyModal.classList.add('hidden'));
        if (closeStoryBtn) closeStoryBtn.addEventListener('click', closeStoryViewer);
        if (storyNavPrev) storyNavPrev.addEventListener('click', () => { if (currentStoryIndex > 0) { currentStoryIndex -= 2; clearTimeout(storyTimeout); playNextStory(); } });
        if (storyNavNext) storyNavNext.addEventListener('click', () => { clearTimeout(storyTimeout); playNextStory(); });
        if (storyUploadArea) storyUploadArea.addEventListener('click', () => storyFileInput.click());
        if (storyFileInput) storyFileInput.addEventListener('change', e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { storyPreview.src = event.target.result; storyPreview.classList.remove('hidden'); storyUploadArea.classList.add('hidden'); submitStoryBtn.disabled = false; }; reader.readAsDataURL(file); } });
        if (submitStoryBtn) submitStoryBtn.addEventListener('click', () => { storiesData.unshift({ id: Date.now(), user: myUserData.name, avatar: myUserData.avatar, storyImage: storyPreview.src, viewed: false }); renderStories(); storyModal.classList.add('hidden'); storyPreview.classList.add('hidden'); storyUploadArea.classList.remove('hidden'); submitStoryBtn.disabled = true; storyFileInput.value = ''; showMessage('Story berhasil diposting!'); });
        function openPostModal(mode = 'text') { postModal.classList.remove('hidden'); pollCreationArea.classList.add('hidden'); imagePreviewContainer.classList.add('hidden'); imageFileInput.value = ''; postTextarea.value = ''; if (mode === 'image') imageFileInput.click(); else if (mode === 'poll') pollCreationArea.classList.remove('hidden'); }
        if (openPostModalBtn) openPostModalBtn.addEventListener('click', () => openPostModal('text'));
        if (postImageBtn) postImageBtn.addEventListener('click', () => openPostModal('image'));
        if (postPollBtn) postPollBtn.addEventListener('click', () => openPostModal('poll'));
        if (closePostModalBtn) closePostModalBtn.addEventListener('click', () => postModal.classList.add('hidden'));
        if (imageFileInput) imageFileInput.addEventListener('change', e => { const file = e.target.files[0]; if (file) { const reader = new FileReader(); reader.onload = (event) => { imagePreview.src = event.target.result; imagePreviewContainer.classList.remove('hidden'); }; reader.readAsDataURL(file); } });
        if (removeImageBtn) removeImageBtn.addEventListener('click', () => { imageFileInput.value = ''; imagePreviewContainer.classList.add('hidden'); });
        if (addPollOptionBtn) addPollOptionBtn.addEventListener('click', () => { if (pollCreationArea.querySelectorAll('input').length < 4) { const newInput = document.createElement('input'); newInput.type = 'text'; newInput.className = 'poll-option-input w-full bg-gray-100 dark:bg-gray-700 p-2 rounded-md text-sm'; newInput.placeholder = `Opsi ${pollCreationArea.querySelectorAll('input').length + 1}`; document.getElementById('more-poll-options').appendChild(newInput); } else { showMessage('Maksimal 4 opsi polling.'); } });
        if (submitPostBtn) submitPostBtn.addEventListener('click', () => { const newPost = { id: Date.now(), author: myUserData.name, avatar: myUserData.avatar, time: 'Baru saja', content: postTextarea.value.trim(), likes: 0, comments: 0, reposts: 0 }; if (!imagePreviewContainer.classList.contains('hidden')) newPost.image = imagePreview.src; if (!pollCreationArea.classList.contains('hidden')) { const options = Array.from(pollCreationArea.querySelectorAll('.poll-option-input')).map(input => input.value.trim()).filter(val => val !== ''); if (options.length >= 2) newPost.poll = { question: newPost.content, options: options, votes: Array(options.length).fill(0), totalVotes: 0, voted: false }; } postsData.unshift(newPost); renderPosts(); postModal.classList.add('hidden'); showMessage('Postingan berhasil dibuat!'); });
        function createPostElement(data) { const postCard = document.createElement('div'); postCard.className = 'post-card bg-white dark:bg-gray-800 p-4'; postCard.dataset.postId = data.id; const imageHtml = data.image ? `<img class="mt-3 rounded-lg w-full object-cover border dark:border-gray-700" src="${data.image}"/>` : ''; let pollHtml = ''; if (data.poll) { const pollOptionsHtml = data.poll.options.map((option, index) => { const percentage = data.poll.totalVotes > 0 ? (data.poll.votes[index] / data.poll.totalVotes) * 100 : 0; return `<div class="poll-option relative mt-2 text-sm font-semibold" data-option-index="${index}"><div class="absolute top-0 left-0 h-full bg-primary-500/20 rounded-md poll-option-bar" style="width: ${data.poll.voted ? percentage : 0}%;"></div><div class="relative flex justify-between items-center border border-gray-300 dark:border-gray-600 rounded-md p-2"><span>${option}</span>${data.poll.voted ? `<span>${percentage.toFixed(0)}%</span>` : ''}</div></div>`; }).join(''); pollHtml = `<div class="mt-3 space-y-2 poll-container">${pollOptionsHtml}<p class="text-xs text-gray-500 mt-2">${data.poll.totalVotes} suara</p></div>`; } postCard.innerHTML = `<div class="flex items-start space-x-3"><img alt="Avatar" class="w-10 h-10 rounded-full" src="${data.avatar}"/><div class="flex-1"><div class="flex justify-between items-center"><p class="font-semibold text-gray-800 dark:text-white">${data.author}</p><span class="text-xs text-gray-400">${data.time}</span></div><p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${data.content}</p>${imageHtml}${pollHtml}<div class="flex justify-between text-gray-500 dark:text-gray-400 mt-4 pt-2 text-base"><button class="flex items-center space-x-1 hover:text-pink-500 transition-colors"><i class="far fa-heart"></i><span>${data.likes}</span></button><button class="flex items-center space-x-1 hover:text-primary-500 transition-colors"><i class="far fa-comment-dots"></i><span>${data.comments}</span></button><button class="flex items-center space-x-1 hover:text-pink-500 transition-colors"><i class="fas fa-retweet"></i><span>${data.reposts}</span></button><button class="hover:text-blue-500 transition-colors"><i class="far fa-bookmark"></i></button></div></div></div>`; return postCard; }
        function renderPosts() { if(!communityFeed) return; communityFeed.innerHTML = ''; postsData.forEach(post => communityFeed.appendChild(createPostElement(post))); }
        if(communityFeed) communityFeed.addEventListener('click', e => { const pollOption = e.target.closest('.poll-option'); if (pollOption) { const postCard = e.target.closest('.post-card'); const post = postsData.find(p => p.id == postCard.dataset.postId); if (post && post.poll && !post.poll.voted) { const optionIndex = parseInt(pollOption.dataset.optionIndex); post.poll.votes[optionIndex]++; post.poll.totalVotes++; post.poll.voted = true; renderPosts(); } } });
        renderStories();
        renderPosts();
    };

    // === LOGIKA HALAMAN EDUKASI (LENGKAP) ===
    const initEducationPage = () => {
        const educationContainer = document.getElementById('education-container');
        if (!educationContainer) return;
        const premiumModal = document.getElementById('premium-modal');
        const coursesData = { 'tech-analysis': { title: 'Analisa Teknikal Dasar', type: 'GRATIS', image: 'https://placehold.co/400x200/a7f3d0/1f2937?text=Crypto', lessonsCount: 3, duration: '37 menit', description: 'Kursus ini sepenuhnya gratis.', chapters: [ { title: 'Dasar-dasar', lessons: [ { id: 'ta1', title: 'Apa itu Analisa Teknikal?', type: 'video', duration: '10:00', premium: false, content: { videoId: 'J8B52D2Q-z4' } }, { id: 'ta2', title: 'Membaca Candlestick', type: 'artikel', duration: '15 mnt', premium: false, content: { text: 'Pola candlestick adalah representasi visual dari pergerakan harga...' } }, { id: 'ta3', title: 'Support & Resistance', type: 'video', duration: '12:00', premium: false, content: { videoId: 'e_n_gE-T-Yk' } }, ]}] }, 'risk-management': { title: 'Manajemen Risiko Pro', type: 'PREMIUM', image: 'https://placehold.co/400x200/fef08a/422006?text=Finance', lessonsCount: 4, duration: '30 menit', description: 'Lindungi modal Anda dengan strategi manajemen risiko profesional.', chapters: [ { title: 'Manajemen Modal', lessons: [ { id: 'rm1', title: 'Pengenalan Manajemen Risiko', type: 'video', duration: '08:00', premium: false, content: { videoId: 'f-0W-B6sTTU' } }, { id: 'rm2', title: 'Menentukan Stop Loss', type: 'video', duration: '10:00', premium: true }, { id: 'rm3', title: 'Rasio Risk/Reward', type: 'artikel', duration: '07 mnt', premium: true, content: { text: 'Rasio risk/reward adalah perbandingan...' } }, { id: 'rm4', title: 'Studi Kasus', type: 'video', duration: '05:00', premium: true }, ]}] }, };
        let userProgress = { 'tech-analysis': ['ta1'] };
        const showView = (viewId) => { educationContainer.querySelectorAll('.page').forEach(p => p.classList.remove('active')); document.getElementById(viewId)?.classList.add('active'); lenis.scrollTo(0, { immediate: true }); };
        const renderCourseList = () => { const content = document.getElementById('course-list-content'); if(!content) return; content.innerHTML = `<div class="bg-gradient-to-r from-primary-600 to-green-400 text-white p-5 rounded-xl shadow-lg"><h2 class="font-bold text-lg">Tingkatkan Skill Trading Anda</h2><p class="text-sm mt-1 opacity-90">Jadilah anggota premium untuk akses tanpa batas.</p><button class="bg-white text-primary-600 font-bold py-1.5 px-4 rounded-full mt-4 text-sm">Upgrade</button></div><div><h3 class="font-bold text-lg text-gray-800 dark:text-gray-200 mb-3">Semua Kursus</h3><div id="all-courses-grid" class="grid grid-cols-1 gap-4"></div></div>`; const grid = document.getElementById('all-courses-grid'); for (const courseId in coursesData) { const course = coursesData[courseId]; const card = document.createElement('div'); card.className = 'course-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden cursor-pointer'; card.dataset.courseId = courseId; card.innerHTML = `<img src="${course.image}" alt="${course.title}" class="w-full h-32 object-cover"><div class="p-3"><p class="text-xs font-semibold ${course.type === 'GRATIS' ? 'text-primary-500' : 'text-yellow-500'}">${course.type}</p><h4 class="font-bold text-gray-800 dark:text-white mt-1">${course.title}</h4><p class="text-xs text-gray-500 dark:text-gray-400 mt-2">${course.lessonsCount} Pelajaran • ${course.duration}</p></div>`; grid.appendChild(card); } };
        const renderCourseDetail = (courseId) => { const course = coursesData[courseId]; const progress = userProgress[courseId] || []; const progressPercentage = (progress.length / course.lessonsCount) * 100; const detailView = document.getElementById('education-detail-view'); let chaptersHtml = course.chapters.map(chapter => { let lessonsHtml = chapter.lessons.map(lesson => { const isCompleted = progress.includes(lesson.id); const isLocked = lesson.premium && !userIsPremium; const icon = lesson.type === 'video' ? 'fa-play-circle' : 'fa-file-alt'; return `<div class="lesson-item flex items-center space-x-4 p-3 rounded-lg ${!isLocked ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700' : ''}" data-lesson-id="${lesson.id}" data-course-id="${courseId}" data-locked="${isLocked}"><i class="fas ${isCompleted ? 'fa-check-circle text-primary-500' : icon + ' text-gray-400'} text-xl w-6 text-center"></i><div class="flex-1"><p class="font-semibold text-gray-800 dark:text-white">${lesson.title}</p><p class="text-xs text-gray-500 dark:text-gray-400">${lesson.duration}</p></div>${isLocked ? '<div class="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center"><i class="fas fa-lock text-yellow-500"></i></div>' : ''}</div>`; }).join(''); return `<div class="mt-4"><h4 class="font-bold text-gray-800 dark:text-gray-200">${chapter.title}</h4><div class="mt-2 space-y-1">${lessonsHtml}</div></div>`; }).join(''); detailView.innerHTML = `<div class="p-4"><button class="back-to-list-btn font-semibold text-gray-600 dark:text-gray-300"><i class="fas fa-arrow-left mr-2"></i>Semua Kursus</button></div><img src="${course.image}" class="w-full h-48 object-cover"><div class="p-4"><p class="font-semibold ${course.type === 'GRATIS' ? 'text-primary-500' : 'text-yellow-500'}">${course.type}</p><h2 class="text-2xl font-bold text-gray-800 dark:text-white mt-1">${course.title}</h2><p class="text-gray-600 dark:text-gray-400 mt-2 text-sm">${course.description}</p><div class="mt-4"><div class="flex justify-between text-xs font-semibold text-gray-500 mb-1"><span>PROGRES</span><span>${progressPercentage.toFixed(0)}%</span></div><div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div class="bg-primary-500 h-2 rounded-full" style="width: ${progressPercentage}%"></div></div></div><div class="mt-6">${chaptersHtml}</div></div>`; showView('education-detail-view'); };
        const renderLessonPlayer = (courseId, lessonId) => { const course = coursesData[courseId]; const lesson = course.chapters.flatMap(c => c.lessons).find(l => l.id === lessonId); const playerView = document.getElementById('lesson-player-view'); let contentHtml = ''; if (lesson.type === 'video' && lesson.content.videoId) { contentHtml = `<div class="aspect-w-16 bg-black rounded-lg overflow-hidden shadow-lg"><iframe class="w-full h-full" src="https://www.youtube.com/embed/${lesson.content.videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`; } else if (lesson.type === 'artikel' && lesson.content.text) { contentHtml = `<div class="bg-white dark:bg-gray-800 p-5 rounded-lg text-gray-700 dark:text-gray-300 shadow-lg"><h1 class="text-2xl font-bold mb-4 text-gray-900 dark:text-white">${lesson.title}</h1><p class="text-base leading-relaxed mb-4">${lesson.content.text}</p><p class="text-base leading-relaxed">Ini adalah contoh teks tambahan untuk membuat artikel terlihat lebih panjang dan lengkap.</p></div>`; } else { contentHtml = `<div class="aspect-w-16 bg-gray-200 dark:bg-gray-800 rounded-lg flex items-center justify-center"><p class="text-gray-500">Konten tidak tersedia.</p></div>`; } playerView.innerHTML = `<div class="p-4"><button class="back-to-detail-btn font-semibold text-gray-600 dark:text-gray-300" data-course-id="${courseId}"><i class="fas fa-arrow-left mr-2"></i>Kembali ke Kursus</button></div><div class="px-4">${contentHtml}</div><div class="p-4"><h3 class="text-xl font-bold text-gray-800 dark:text-white mt-2">${lesson.title}</h3><p class="text-sm text-gray-500 dark:text-gray-400">${course.title}</p><button class="mark-complete-btn w-full border-2 border-primary-500 text-primary-500 font-bold py-2 rounded-lg mt-6 hover:bg-primary-500 hover:text-white transition-colors" data-course-id="${courseId}" data-lesson-id="${lessonId}">Tandai Selesai</button></div>`; showView('lesson-player-view'); };
        educationContainer.addEventListener('click', (e) => { const courseCard = e.target.closest('.course-card'); const backToListBtn = e.target.closest('.back-to-list-btn'); const backToDetailBtn = e.target.closest('.back-to-detail-btn'); const lessonItem = e.target.closest('.lesson-item'); const markCompleteBtn = e.target.closest('.mark-complete-btn'); if (courseCard) renderCourseDetail(courseCard.dataset.courseId); if (backToListBtn) showView('education-list-view'); if (backToDetailBtn) renderCourseDetail(backToDetailBtn.dataset.courseId); if (lessonItem) { if (lessonItem.dataset.locked === 'true') { premiumModal.classList.remove('hidden'); } else { renderLessonPlayer(lessonItem.dataset.courseId, lessonItem.dataset.lessonId); } } if (markCompleteBtn) { const { courseId, lessonId } = markCompleteBtn.dataset; if (!userProgress[courseId]) userProgress[courseId] = []; if (!userProgress[courseId].includes(lessonId)) userProgress[courseId].push(lessonId); renderCourseDetail(courseId); } });
        renderCourseList();
    };

    // === LOGIKA HALAMAN PROFIL (LENGKAP) ===
    const initProfilePage = () => {
        const postCountEl = document.getElementById('post-count');
        const likeCountEl = document.getElementById('like-count');
        const expertBadge = document.getElementById('expert-badge');
        const profileButtons = document.querySelectorAll('.profile-button');
        const messageModal = document.getElementById('message-modal');
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
        const showMessage = (message, duration = 2000) => { if(messageModal) { messageModal.textContent = message; messageModal.classList.remove('opacity-0'); setTimeout(() => messageModal.classList.add('opacity-0'), duration); } };
        if(profileButtons) profileButtons.forEach(button => { button.addEventListener('click', () => { const action = button.dataset.action; showMessage(`Tombol "${action}" diklik!`); }); });
    };

    // === INISIALISASI APLIKASI ===
    const initApp = () => { loadScreen('login'); };
    initApp();
});
