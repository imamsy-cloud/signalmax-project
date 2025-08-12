document.addEventListener('DOMContentLoaded', () => {
    // === ELEMEN DOM GLOBAL ===
    const sidebar = document.getElementById('sidebar');
    const menuButton = document.getElementById('menu-button');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const sidebarNav = document.getElementById('sidebar-nav');
    const contentArea = document.getElementById('content-area');
    const pageTitle = document.getElementById('page-title');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const html = document.documentElement;
    const notificationButton = document.getElementById('notification-button');
    const notificationDropdown = document.getElementById('notification-dropdown');
    const adminMenuButton = document.getElementById('admin-menu-button');
    const adminMenuDropdown = document.getElementById('admin-menu-dropdown');

    // === DATABASE SIMULASI ===
    const bannersDB = {
        'bnr-001': { title: 'Promo Upgrade Premium', image: 'https://placehold.co/600x300/22c55e/ffffff?text=Upgrade+Premium' },
        'bnr-002': { title: 'Event Webinar Analisa Teknikal', image: 'https://placehold.co/600x300/8b5cf6/ffffff?text=Webinar' },
        'bnr-003': { title: 'Ajak Teman Dapat Bonus', image: 'https://placehold.co/600x300/f59e0b/ffffff?text=Bonus' }
    };

    // === FUNGSI INTI ===
    const toggleSidebar = () => { if (sidebar) sidebar.classList.toggle('-translate-x-full'); if (sidebarOverlay) sidebarOverlay.classList.toggle('hidden'); };
    const loadPage = async (page) => {
        if (!contentArea) return;
        contentArea.innerHTML = '<div class="flex justify-center items-center h-full"><div class="text-center p-8 text-gray-500"><i class="fas fa-spinner fa-spin text-3xl"></i><p class="mt-2">Memuat...</p></div></div>';
        try {
            const response = await fetch(`src/pages/${page}.html?t=${new Date().getTime()}`);
            if (!response.ok) throw new Error(`Halaman '${page}.html' tidak ditemukan.`);
            contentArea.innerHTML = await response.text();
            
            if (page === 'content' || page === 'community') initContentTabs();
            if (page === 'events') initEventForm();
            if (page === 'education') initEducationPage();
            if (page === 'settings') initSettingsPage();
            if (page === 'signals') initSignalsPage();
            if (page === 'payments') initPaymentsPage();
        } catch (error) {
            contentArea.innerHTML = `<div class="text-center p-8 text-red-500"><b>Error:</b> ${error.message}</div>`;
        }
    };

    // === EVENT LISTENERS GLOBAL ===
    if (menuButton) menuButton.addEventListener('click', toggleSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener('click', toggleSidebar);
    if (sidebarNav) {
        sidebarNav.addEventListener('click', (e) => {
            e.preventDefault();
            const link = e.target.closest('.sidebar-link');
            if (!link) return;
            document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            const targetPage = link.dataset.target;
            if(pageTitle) pageTitle.textContent = link.querySelector('span').textContent;
            loadPage(targetPage);
            if (window.innerWidth < 768) toggleSidebar();
        });
    }
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            html.classList.toggle('dark');
            updateThemeIcon();
        });
    }
    const toggleDropdown = (dropdown) => { if (dropdown) dropdown.classList.toggle('hidden'); };
    if (notificationButton) notificationButton.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(notificationDropdown); if (adminMenuDropdown) adminMenuDropdown.classList.add('hidden'); });
    if (adminMenuButton) adminMenuButton.addEventListener('click', (e) => { e.stopPropagation(); toggleDropdown(adminMenuDropdown); if (notificationDropdown) notificationDropdown.classList.add('hidden'); });
    window.addEventListener('click', () => {
        if (notificationDropdown) notificationDropdown.classList.add('hidden');
        if (adminMenuDropdown) adminMenuDropdown.classList.add('hidden');
    });
    
    contentArea.addEventListener('click', (e) => {
        const copyBtn = e.target.closest('.copy-id-btn');
        if (copyBtn) {
            const idToCopy = copyBtn.dataset.id;
            const textArea = document.createElement('textarea');
            textArea.value = idToCopy;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert(`ID "${idToCopy}" telah disalin!`);
            } catch (err) { console.error('Gagal menyalin ID: ', err); }
            document.body.removeChild(textArea);
        }

        const editContentBtn = e.target.closest('.edit-content-btn');
        if (editContentBtn) {
            const type = editContentBtn.dataset.type;
            const modal = document.getElementById(`edit-${type}-modal`);
            if (!modal) return;
            
            const item = editContentBtn.closest('[data-id]');
            const id = item.dataset.id;
            const title = item.dataset.title;

            modal.querySelector('input[type="hidden"]').value = id;
            modal.querySelector('input[type="text"]').value = title;

            if (type === 'banner') {
                modal.querySelector('#edit-banner-link').value = item.dataset.link;
            } else if (type === 'artikel') {
                modal.querySelector('#edit-artikel-content').value = item.dataset.content;
                modal.querySelector('#edit-artikel-video').value = item.dataset.videoUrl;
            } else if (type === 'video') {
                modal.querySelector('#edit-video-url').value = item.dataset.url;
            }
            
            openModal(modal);
        }

        const closeModalBtn = e.target.closest('.close-modal-btn, .cancel-modal-btn');
        if (closeModalBtn) {
            closeModal(closeModalBtn.closest('.modal-overlay'));
        }
        
        const saveModalBtn = e.target.closest('.save-modal-btn');
        if(saveModalBtn) {
            const modal = saveModalBtn.closest('.modal-overlay');
            const id = modal.querySelector('input[type="hidden"]').value;
            alert(`Perubahan pada item ID: ${id} telah disimpan (simulasi).`);
            closeModal(modal);
        }
    });

    // === FUNGSI BANTUAN & INISIALISASI HALAMAN SPESIFIK ===
    const updateThemeIcon = () => {
        const sunIcon = '<i class="fas fa-sun"></i>';
        const moonIcon = '<i class="fas fa-moon"></i>';
        if (themeToggleBtn) themeToggleBtn.innerHTML = html.classList.contains('dark') ? sunIcon : moonIcon;
    };
    const openModal = (modal) => { if (modal) modal.classList.add('visible'); };
    const closeModal = (modal) => { if (modal) modal.classList.remove('visible'); };

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
                tabContents.forEach(content => { if(content) content.classList.remove('active'); });
                document.getElementById(targetId)?.classList.add('active');
            });
        });
    };
    
    const initEventForm = () => {
        const createFormContainer = document.getElementById('create-event-form');
        if (createFormContainer) {
            const createEventTypeSelect = createFormContainer.querySelector('#eventType');
            const onlineField = createFormContainer.querySelector('#event-field-online');
            const offlineField = createFormContainer.querySelector('#event-field-offline');
            const toggleCreateFields = () => {
                const selectedType = createEventTypeSelect.value;
                if (onlineField) onlineField.style.display = (selectedType === 'online') ? 'block' : 'none';
                if (offlineField) offlineField.style.display = (selectedType === 'offline') ? 'block' : 'none';
            };
            toggleCreateFields();
            createEventTypeSelect.addEventListener('change', toggleCreateFields);
        }

        const editModal = document.getElementById('edit-event-modal');
        if (editModal) {
            const tableBody = document.getElementById('events-table-body');
            const editEventTypeSelect = editModal.querySelector('#edit-event-type');
            
            const toggleEditFields = () => {
                const selectedType = editEventTypeSelect.value;
                const onlineField = editModal.querySelector('#edit-event-field-online');
                const offlineField = editModal.querySelector('#edit-event-field-offline');
                if (onlineField) onlineField.style.display = (selectedType === 'online') ? 'block' : 'none';
                if (offlineField) offlineField.style.display = (selectedType === 'offline') ? 'block' : 'none';
            };

            if (editEventTypeSelect) {
                editEventTypeSelect.addEventListener('change', toggleEditFields);
            }

            if (tableBody) {
                tableBody.addEventListener('click', (e) => {
                    const editBtn = e.target.closest('.edit-event-btn');
                    if (editBtn) {
                        const row = editBtn.closest('tr');
                        editModal.querySelector('#edit-event-id').value = row.dataset.id;
                        editModal.querySelector('#edit-event-title').value = row.dataset.title;
                        editModal.querySelector('#edit-event-type').value = row.dataset.type;
                        editModal.querySelector('#edit-event-link').value = row.dataset.link;
                        editModal.querySelector('#edit-event-location').value = row.dataset.location;
                        editModal.querySelector('#edit-event-date').value = row.dataset.date;
                        editModal.querySelector('#edit-event-price').value = row.dataset.price;
                        editModal.querySelector('#edit-event-description').value = row.dataset.description;
                        
                        toggleEditFields();
                        openModal(editModal);
                    }
                });
            }
        }
    };
    
    const initSettingsPage = () => {
        const addSectionBtn = document.getElementById('add-section-btn');
        const sectionModal = document.getElementById('section-modal');
        const cancelSectionBtn = document.getElementById('cancel-section-btn');
        const closeSectionModalBtn = document.getElementById('close-section-modal-btn');
        const sectionTypeSelect = document.getElementById('section-type-select');
        if (addSectionBtn) addSectionBtn.addEventListener('click', () => openModal(sectionModal));
        if (cancelSectionBtn) cancelSectionBtn.addEventListener('click', () => closeModal(sectionModal));
        if (closeSectionModalBtn) closeSectionModalBtn.addEventListener('click', () => closeModal(sectionModal));
        if (sectionModal) {
            sectionModal.addEventListener('click', (e) => {
                if (e.target === sectionModal) closeModal(sectionModal);
            });
        }
        if (sectionTypeSelect) {
            const placeholder = document.getElementById('selector-placeholder');
            const itemSelector = document.getElementById('content-item-selector');
            const widgetSelector = document.getElementById('widget-selector');
            sectionTypeSelect.addEventListener('change', (e) => {
                const selectedType = e.target.value;
                placeholder.classList.add('hidden');
                itemSelector.classList.add('hidden');
                widgetSelector.classList.add('hidden');
                switch(selectedType) {
                    case 'banner': case 'article_list': case 'event_highlight':
                        itemSelector.classList.remove('hidden');
                        break;
                    case 'signals': case 'education_resume': case 'community_highlight':
                        widgetSelector.classList.remove('hidden');
                        break;
                    default:
                        placeholder.classList.remove('hidden');
                        break;
                }
            });
        }
    };
    
    const initEducationPage = () => {
        const courseListView = document.getElementById('course-list-view');
        const courseEditorView = document.getElementById('course-editor-view');
        const addCourseBtn = document.getElementById('add-course-btn');
        const backToListBtn = document.getElementById('back-to-list-btn');
        const editCourseBtns = document.querySelectorAll('.edit-course-btn');
        const courseModal = document.getElementById('course-modal');
        const closeCourseModalBtn = document.getElementById('close-course-modal-btn');
        const cancelCourseBtn = document.getElementById('cancel-course-btn');
        const chaptersContainer = document.getElementById('chapters-container');
        const addChapterBtn = document.getElementById('add-chapter-btn');
        const saveCurriculumBtn = document.getElementById('save-curriculum-btn');
        const chapterModal = document.getElementById('chapter-modal');
        const closeChapterModalBtn = document.getElementById('close-chapter-modal-btn');
        const cancelChapterBtn = document.getElementById('cancel-chapter-btn');
        const saveChapterBtn = document.getElementById('save-chapter-btn');
        const chapterTitleInput = document.getElementById('chapter-title-input');
        const lessonModal = document.getElementById('lesson-modal');
        const closeLessonModalBtn = document.getElementById('close-lesson-modal-btn');
        const cancelLessonBtn = document.getElementById('cancel-lesson-btn');
        const saveLessonBtn = document.getElementById('save-lesson-btn');
        const lessonTitleInput = document.getElementById('lesson-title-input');
        const lessonTypeSelect = document.getElementById('lesson-type-select');
        const lessonContentIdInput = document.getElementById('lesson-content-id-input');
        const lessonPremiumToggle = document.getElementById('lesson-premium-toggle');
        let activeLessonsList = null;
        const selectBannerBtn = document.getElementById('select-banner-btn');
        const removeBannerBtn = document.getElementById('remove-banner-btn');
        const bannerIdInput = document.getElementById('education-banner-id');
        const bannerSelectionModal = document.getElementById('banner-selection-modal');
        const closeBannerModalBtn = document.getElementById('close-banner-modal-btn');
        const cancelBannerSelectionBtn = document.getElementById('cancel-banner-selection-btn');
        const bannerListContainer = document.getElementById('banner-list-container');
        const bannerSearchInput = document.getElementById('banner-search-input');
        const renderBanners = (filter = '') => {
            if (!bannerListContainer) return;
            bannerListContainer.innerHTML = '';
            const filteredBanners = Object.entries(bannersDB).filter(([id, data]) => {
                return id.toLowerCase().includes(filter.toLowerCase()) || data.title.toLowerCase().includes(filter.toLowerCase());
            });
            if (filteredBanners.length === 0) {
                bannerListContainer.innerHTML = '<p class="text-center text-gray-500">Banner tidak ditemukan.</p>'; return;
            }
            filteredBanners.forEach(([id, data]) => {
                const bannerItem = document.createElement('div');
                bannerItem.className = 'banner-item flex items-center p-3 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50';
                bannerItem.dataset.id = id;
                bannerItem.dataset.title = data.title;
                bannerItem.innerHTML = `<img src="${data.image}" class="w-24 h-12 object-cover rounded-md bg-gray-200 mr-4" alt="${data.title}"><div><p class="font-semibold text-gray-800 dark:text-white">${data.title}</p><p class="text-xs text-gray-500 font-mono">${id}</p></div>`;
                bannerListContainer.appendChild(bannerItem);
            });
        };
        if (selectBannerBtn) selectBannerBtn.addEventListener('click', () => { renderBanners(); openModal(bannerSelectionModal); });
        if (closeBannerModalBtn) closeBannerModalBtn.addEventListener('click', () => closeModal(bannerSelectionModal));
        if (cancelBannerSelectionBtn) cancelBannerSelectionBtn.addEventListener('click', () => closeModal(bannerSelectionModal));
        if (bannerSelectionModal) bannerSelectionModal.addEventListener('click', (e) => { if(e.target === bannerSelectionModal) closeModal(bannerSelectionModal) });
        if (bannerListContainer) {
            bannerListContainer.addEventListener('click', (e) => {
                const bannerItem = e.target.closest('.banner-item');
                if (bannerItem) {
                    const id = bannerItem.dataset.id;
                    if (bannerIdInput) bannerIdInput.value = id;
                    if (removeBannerBtn) removeBannerBtn.classList.remove('hidden');
                    closeModal(bannerSelectionModal);
                }
            });
        }
        if (removeBannerBtn) removeBannerBtn.addEventListener('click', () => { if (bannerIdInput) bannerIdInput.value = ''; removeBannerBtn.classList.add('hidden'); });
        if (bannerSearchInput) bannerSearchInput.addEventListener('keyup', () => renderBanners(bannerSearchInput.value));
        const showListView = () => { if(courseListView) courseListView.style.display = 'block'; if(courseEditorView) courseEditorView.style.display = 'none'; };
        const showEditorView = () => { if(courseListView) courseListView.style.display = 'none'; if(courseEditorView) courseEditorView.style.display = 'block'; };
        if (addCourseBtn) addCourseBtn.addEventListener('click', () => openModal(courseModal));
        if (backToListBtn) backToListBtn.addEventListener('click', showListView);
        editCourseBtns.forEach(btn => btn.addEventListener('click', showEditorView));
        if (closeCourseModalBtn) closeCourseModalBtn.addEventListener('click', () => closeModal(courseModal));
        if (cancelCourseBtn) cancelCourseBtn.addEventListener('click', () => closeModal(courseModal));
        if (courseModal) courseModal.addEventListener('click', (e) => { if (e.target === courseModal) closeModal(courseModal); });
        if (addChapterBtn) addChapterBtn.addEventListener('click', () => openModal(chapterModal));
        if (closeChapterModalBtn) closeChapterModalBtn.addEventListener('click', () => closeModal(chapterModal));
        if (cancelChapterBtn) cancelChapterBtn.addEventListener('click', () => closeModal(chapterModal));
        if (chapterModal) chapterModal.addEventListener('click', (e) => { if (e.target === chapterModal) closeModal(chapterModal); });
        if (closeLessonModalBtn) closeLessonModalBtn.addEventListener('click', () => closeModal(lessonModal));
        if (cancelLessonBtn) cancelLessonBtn.addEventListener('click', () => closeModal(lessonModal));
        if (lessonModal) lessonModal.addEventListener('click', (e) => { if (e.target === lessonModal) closeModal(lessonModal); });
        if (chaptersContainer) {
            chaptersContainer.addEventListener('click', (e) => {
                const header = e.target.closest('.chapter-header');
                if (header) {
                    const content = header.nextElementSibling;
                    const icon = header.querySelector('.fa-chevron-down');
                    content.classList.toggle('hidden');
                    icon.classList.toggle('rotate-180');
                }
                const removeBtn = e.target.closest('.remove-lesson-btn');
                if(removeBtn) { removeBtn.parentElement.parentElement.remove(); }
                const addLessonBtn = e.target.closest('.add-lesson-btn');
                if (addLessonBtn) {
                    activeLessonsList = addLessonBtn.previousElementSibling;
                    openModal(lessonModal);
                }
            });
        }
        if (saveChapterBtn) {
            saveChapterBtn.addEventListener('click', () => {
                const title = chapterTitleInput.value.trim();
                if (title === '') { alert('Judul bab tidak boleh kosong!'); return; }
                const chapterCount = chaptersContainer.querySelectorAll('.chapter-accordion').length + 1;
                const newChapterHTML = `<div class="chapter-accordion bg-gray-50 dark:bg-gray-700/50 rounded-lg"><button class="chapter-header w-full flex justify-between items-center p-4 text-left"><h4 class="font-semibold"><i class="fas fa-grip-vertical mr-3 cursor-move text-gray-400"></i> Bab ${chapterCount}: ${title}</h4><i class="fas fa-chevron-down transition-transform"></i></button><div class="chapter-content hidden p-4 border-t dark:border-gray-600"><div class="lessons-list space-y-2 mb-4"></div><button class="add-lesson-btn w-full border border-dashed border-gray-300 dark:border-gray-600 text-gray-500 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm font-semibold"><i class="fas fa-plus mr-2"></i>Tambah Pelajaran</button></div></div>`;
                if (chaptersContainer) chaptersContainer.insertAdjacentHTML('beforeend', newChapterHTML);
                chapterTitleInput.value = '';
                closeModal(chapterModal);
            });
        }
        if (saveLessonBtn) {
            saveLessonBtn.addEventListener('click', () => {
                const title = lessonTitleInput.value.trim();
                const type = lessonTypeSelect.value;
                const isPremium = lessonPremiumToggle.checked;
                if (title === '' || !activeLessonsList) {
                    alert('Judul pelajaran tidak boleh kosong!');
                    return;
                }
                let iconClass = '';
                switch(type) {
                    case 'video': iconClass = 'fas fa-video text-red-500'; break;
                    case 'artikel': iconClass = 'fas fa-file-alt text-blue-500'; break;
                    case 'ebook': iconClass = 'fas fa-book-open text-purple-500'; break;
                }
                const premiumBadge = isPremium ? '<span class="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Premium</span>' : '';
                const newLessonHTML = `<div class="p-2 bg-white dark:bg-gray-800 rounded-md flex items-center justify-between"><div class="flex items-center"><i class="fas fa-grip-vertical mr-2 cursor-move text-gray-400"></i><i class="${iconClass} mr-2"></i><span>${title}</span></div><div class="flex items-center space-x-3">${premiumBadge}<button class="remove-lesson-btn text-gray-400 hover:text-red-500 text-xs"><i class="fas fa-times"></i></button></div></div>`;
                activeLessonsList.insertAdjacentHTML('beforeend', newLessonHTML);
                lessonTitleInput.value = '';
                lessonContentIdInput.value = '';
                lessonPremiumToggle.checked = false;
                closeModal(lessonModal);
            });
        }
        if(saveCurriculumBtn) {
            saveCurriculumBtn.addEventListener('click', () => {
                alert('Perubahan kurikulum telah disimpan! (simulasi)');
                showListView();
            });
        }
    };
    
    const initSignalsPage = () => {
        const createForm = document.getElementById('signal-form');
        const sendWithNotifBtn = document.getElementById('send-with-notification-btn');
        const sendWithoutNotifBtn = document.getElementById('send-without-notification-btn');
        const handleCreateSend = (withNotification) => {
            if (createForm && !createForm.checkValidity()) {
                alert('Harap isi semua field yang wajib.'); return;
            }
            const notifText = withNotification ? 'dengan notifikasi' : 'tanpa notifikasi';
            alert(`Berhasil mengirim sinyal baru ${notifText}.`);
            if (createForm) createForm.reset();
        };
        if(sendWithNotifBtn) sendWithNotifBtn.addEventListener('click', () => handleCreateSend(true));
        if(sendWithoutNotifBtn) sendWithoutNotifBtn.addEventListener('click', () => handleCreateSend(false));
        const tableBody = document.getElementById('signals-table-body');
        const editModal = document.getElementById('edit-signal-modal');
        if (!editModal) return;
        const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
        const cancelEditBtn = document.getElementById('cancel-edit-btn');
        const statusInput = document.getElementById('modal-signal-status');
        const lossChoice = document.getElementById('loss-choice');
        const profitChoice = document.getElementById('profit-choice');
        const profitOptionsContainer = document.getElementById('profit-options-container');
        const updateNoNotifBtn = document.getElementById('update-no-notif-btn');
        const updateWithNotifBtn = document.getElementById('update-with-notif-btn');
        const setChoiceAppearance = (element, isActive) => {
            const emptyIcon = element.querySelector('.status-icon');
            const checkedIcon = element.querySelector('.status-icon-checked');
            if(isActive) {
                element.classList.add('active');
                if (emptyIcon) emptyIcon.style.display = 'none';
                if (checkedIcon) checkedIcon.style.display = 'inline-block';
            } else {
                element.classList.remove('active');
                if (emptyIcon) emptyIcon.style.display = 'inline-block';
                if (checkedIcon) checkedIcon.style.display = 'none';
            }
        };
        const resetStatusChoices = () => {
            statusInput.value = '';
            profitOptionsContainer.classList.add('hidden');
            document.querySelectorAll('.status-choice, .profit-option-choice').forEach(btn => setChoiceAppearance(btn, false));
        };
        if (tableBody) {
            tableBody.addEventListener('click', (e) => {
                const editBtn = e.target.closest('.edit-signal-btn');
                if (editBtn) {
                    const row = editBtn.closest('tr');
                    document.getElementById('edit-modal-title').textContent = `Edit Sinyal: ${row.dataset.pair}`;
                    document.getElementById('modal-signal-id').value = row.dataset.id;
                    document.getElementById('modal-signal-pair').value = row.dataset.pair;
                    document.getElementById('modal-signal-entry').value = row.dataset.entry;
                    document.getElementById('modal-signal-sl').value = row.dataset.sl;
                    const tp = JSON.parse(row.dataset.tp);
                    const modalTpInputs = document.querySelectorAll('input[name="modal_signal_tp"]');
                    modalTpInputs.forEach((input, index) => { input.value = tp[index] || ''; });
                    resetStatusChoices();
                    openModal(editModal);
                }
            });
        }
        const closeEditModal = () => closeModal(editModal);
        if(closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
        if(cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
        if(lossChoice) lossChoice.addEventListener('click', () => {
            const isActive = lossChoice.classList.contains('active');
            resetStatusChoices();
            if (!isActive) {
                setChoiceAppearance(lossChoice, true);
                statusInput.value = lossChoice.dataset.status;
            }
        });
        if(profitChoice) profitChoice.addEventListener('click', () => {
            const wasActive = profitChoice.classList.contains('active');
            resetStatusChoices();
            if (!wasActive) {
                setChoiceAppearance(profitChoice, true);
                profitOptionsContainer.classList.remove('hidden');
            }
        });
        if (profitOptionsContainer) {
            profitOptionsContainer.addEventListener('click', (e) => {
                const button = e.target.closest('.profit-option-choice');
                if (button) {
                    const isActive = button.classList.contains('active');
                    document.querySelectorAll('.profit-option-choice').forEach(btn => setChoiceAppearance(btn, false));
                    if (!isActive) {
                        setChoiceAppearance(button, true);
                        statusInput.value = button.dataset.status;
                    } else {
                        statusInput.value = '';
                    }
                }
            });
        }
        const handleUpdate = (withNotification) => {
            const id = document.getElementById('modal-signal-id').value;
            const status = statusInput.value;
            let message = '';
            if (status) {
                message = `Sinyal ${id} telah ditutup dengan status "${status}".`;
            } else {
                message = `Perubahan pada sinyal ${id} telah disimpan.`;
            }
            if (withNotification) {
                message += ' Notifikasi dikirim ke pengguna.';
            }
            alert(message);
            closeEditModal();
        };
        if(updateWithNotifBtn) updateWithNotifBtn.addEventListener('click', () => handleUpdate(true));
        if(updateNoNotifBtn) updateNoNotifBtn.addEventListener('click', () => handleUpdate(false));
    };
    
    const initPaymentsPage = () => {
        const tableBody = document.getElementById('payments-table-body');
        const modal = document.getElementById('payment-action-modal');
        if (!tableBody || !modal) return;
        let activeRow = null;
        tableBody.addEventListener('click', e => {
            const editBtn = e.target.closest('.edit-payment-btn');
            if (editBtn) {
                activeRow = editBtn.closest('tr');
                const userEmail = activeRow.dataset.email;
                const userInfoEl = modal.querySelector('#payment-user-info');
                if (userInfoEl) userInfoEl.textContent = userEmail;
                openModal(modal);
            }
        });
        modal.addEventListener('click', e => {
            const confirmBtn = e.target.closest('#confirm-payment-btn');
            const deleteBtn = e.target.closest('#delete-payment-btn');
            if (confirmBtn && activeRow) {
                alert(`Pembayaran untuk user ${activeRow.dataset.email} telah dikonfirmasi.`);
                activeRow.remove();
                closeModal(modal);
            }
            if (deleteBtn && activeRow) {
                if (confirm('Anda yakin ingin menghapus permintaan pembayaran ini?')) {
                    alert(`Permintaan pembayaran untuk user ${activeRow.dataset.email} telah dihapus.`);
                    activeRow.remove();
                    closeModal(modal);
                }
            }
        });
    };

    // === INISIALISASI APLIKASI DASBOR ===
    const init = () => {
        updateThemeIcon();
        const initialPage = 'dashboard';
        const dashboardLink = document.querySelector(`.sidebar-link[data-target="${initialPage}"]`);
        if (dashboardLink) {
             dashboardLink.classList.add('active');
             if(pageTitle) pageTitle.textContent = dashboardLink.querySelector('span').textContent;
        }
        loadPage(initialPage);
    };
    init();
});