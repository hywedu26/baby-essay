document.addEventListener('DOMContentLoaded', () => {
    // 화면 및 컨테이너 요소
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const entriesTab = document.getElementById('entries-tab');
    const essaysTab = document.getElementById('essays-tab');
    const entriesContainer = document.getElementById('entries-container');
    const essaysContainer = document.getElementById('essays-container');

    // 폼 및 버튼 요소
    const loginForm = document.getElementById('login-form');
    const entryForm = document.getElementById('entry-form');
    const generateEssayButton = document.getElementById('generate-essay-button');
    const finalSaveButton = document.getElementById('final-save-button');
    const tabButtons = document.querySelectorAll('.tab-button');
    
    // 모달 요소
    const essayModal = document.getElementById('essay-modal');
    const closeButton = document.querySelector('.close-button');
    const essayOutput = document.getElementById('essay-output');

    // 기타 UI 요소
    const userIdSpan = document.getElementById('user-id');
    const profilePicture = document.querySelector('.profile-picture');
    const entryDate = document.getElementById('entry-date');
    const entryPhoto = document.getElementById('entry-photo');
    const photoPreview = document.getElementById('photo-preview');

    // 데이터 저장을 위한 키
    const ENTRIES_KEY = 'baby-entries';
    const ESSAYS_KEY = 'baby-essays';

    // --- 데이터 관리 --- //
    const getFromStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const saveToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    // --- 초기화 --- //
    function initialize() {
        entryDate.valueAsDate = new Date();
        renderEntries();
        renderEssays();

        // 자동 로그인 확인
        const savedUser = localStorage.getItem('baby-app-user');
        if (savedUser) {
            showMainScreen(savedUser);
        }
    }

    // --- 화면 전환 --- //
    function showMainScreen(username) {
        loginScreen.classList.add('hidden');
        mainScreen.classList.remove('hidden');
        userIdSpan.textContent = username;
        profilePicture.src = `https://api.dicebear.com/8.x/miniavs/svg?seed=${username}`;
        localStorage.setItem('baby-app-user', username);
    }

    // --- 탭 기능 --- //
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;

            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(content => {
                content.id === `${tabName}-tab` 
                    ? content.classList.add('active') 
                    : content.classList.remove('active');
            });
        });
    });

    // --- 육아 기록 관리 --- //
    function renderEntries() {
        const entries = getFromStorage(ENTRIES_KEY);
        entriesContainer.innerHTML = '';
        if (entries.length === 0) {
            entriesContainer.innerHTML = '<p class="empty-message">아직 작성된 기록이 없어요. 첫 기록을 남겨보세요!</p>';
        }
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        entries.forEach(entry => addEntryToDOM(entry));
    }

    function addEntryToDOM(entry) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.dataset.id = entry.id;

        const textParagraph = document.createElement('p');
        textParagraph.innerHTML = entry.text.replace(/\n/g, '<br>');

        entryElement.innerHTML = `
            <div class="entry-header">
                <h3>${new Date(entry.date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                <button class="delete-button entry-delete-button" data-id="${entry.id}">삭제</button>
            </div>
            ${entry.photo ? `<img src="${entry.photo}" alt="기록 사진">` : ''}
        `;
        entryElement.appendChild(textParagraph);
        entriesContainer.appendChild(entryElement);
    }

    function deleteEntry(id) {
        let entries = getFromStorage(ENTRIES_KEY);
        entries = entries.filter(entry => entry.id !== id);
        saveToStorage(ENTRIES_KEY, entries);
        renderEntries();
    }

    // --- 에세이 관리 --- //
    function renderEssays() {
        const essays = getFromStorage(ESSAYS_KEY);
        essaysContainer.innerHTML = '';
        if (essays.length === 0) {
            essaysContainer.innerHTML = '<p class="empty-message">아직 저장된 에세이가 없어요. AI와 함께 첫 에세이를 만들어보세요!</p>';
            return;
        }
        essays.sort((a, b) => b.id - a.id);
        essays.forEach(essay => {
            const essayCard = document.createElement('div');
            essayCard.classList.add('essay-card');
            essayCard.innerHTML = `
                <div class="essay-header">
                    <h4>${new Date(essay.date).toLocaleString('ko-KR')}에 생성됨</h4>
                    <button class="delete-button essay-delete-button" data-id="${essay.id}">삭제</button>
                </div>
                <div class="essay-content">${essay.content}</div>
            `;
            essaysContainer.appendChild(essayCard);
        });
    }

    function saveEssay() {
        const content = essayOutput.innerHTML;
        if (content.includes('만들고 있어요') || content.includes('실패했어요')) {
            alert('에세이 내용이 올바르지 않아 저장할 수 없습니다.');
            return;
        }
        
        let essays = getFromStorage(ESSAYS_KEY);
        const newEssay = {
            id: Date.now(),
            date: new Date().toISOString(),
            content: content
        };
        essays.push(newEssay);
        saveToStorage(ESSAYS_KEY, essays);
        alert('에세이가 성공적으로 저장되었습니다!');
        renderEssays();
        essayModal.classList.add('hidden');
    }

    function deleteEssay(id) {
        let essays = getFromStorage(ESSAYS_KEY);
        essays = essays.filter(essay => essay.id !== id);
        saveToStorage(ESSAYS_KEY, essays);
        renderEssays();
    }

    // --- 이벤트 리스너 --- //
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        showMainScreen(e.target.username.value);
    });

    entryPhoto.addEventListener('change', () => {
        const file = entryPhoto.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = entryDate.value;
        const text = e.target['entry-text'].value;
        if (!date || !text) {
            alert('날짜와 기록을 모두 입력해주세요.');
            return;
        }
        let entries = getFromStorage(ENTRIES_KEY);
        const newEntry = {
            id: Date.now(),
            date: date,
            text: text,
            photo: photoPreview.classList.contains('hidden') ? null : photoPreview.src
        };
        entries.push(newEntry);
        saveToStorage(ENTRIES_KEY, entries);
        renderEntries();

        entryForm.reset();
        photoPreview.classList.add('hidden');
        photoPreview.src = '#';
        entryDate.valueAsDate = new Date();
    });
    
    // 동적 생성 요소 이벤트 위임
    document.addEventListener('click', (e) => {
        if (e.target.matches('.entry-delete-button')) {
            if (confirm('이 기록을 정말 삭제하시겠어요?')) {
                deleteEntry(Number(e.target.dataset.id));
            }
        }
        if (e.target.matches('.essay-delete-button')) {
            if (confirm('이 에세이를 정말 삭제하시겠어요?')) {
                deleteEssay(Number(e.target.dataset.id));
            }
        }
    });

    generateEssayButton.addEventListener('click', async () => {
        const entries = getFromStorage(ENTRIES_KEY);
        if (entries.length < 2) {
            alert('AI 에세이를 생성하려면 최소 2개 이상의 기록이 필요합니다.');
            return;
        }
        essayOutput.innerHTML = '<p>AI가 아가의 소중한 기록으로 예쁜 글을 만들고 있어요. 잠시만 기다려주세요...</p>';
        essayModal.classList.remove('hidden');
        
        const entriesForAPI = entries.map(({ date, text }) => ({ date, text }));

        try {
            const response = await fetch('/generate-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entries: entriesForAPI }),
            });
            const data = await response.json();
            if (!response.ok) throw data;
            essayOutput.innerHTML = data.essay;
        } catch (error) {
            console.error('에세이 생성 실패:', error);
            const errorMessage = error.error ? `${error.error} - ${error.details || ''}` : (error.message || JSON.stringify(error));
            essayOutput.innerHTML = `<p style="color: red;">에세이 생성에 실패했어요. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.<br><br><strong>오류 상세:</strong> ${errorMessage}</p>`;
        }
    });

    closeButton.addEventListener('click', () => essayModal.classList.add('hidden'));
    essayModal.addEventListener('click', (e) => {
        if (e.target === essayModal) essayModal.classList.add('hidden');
    });
    
    finalSaveButton.addEventListener('click', saveEssay);

    // --- 앱 시작 --- //
    initialize();
});
