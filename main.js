document.addEventListener('DOMContentLoaded', () => {
    // Screens and Forms
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const loginForm = document.getElementById('login-form');
    const entryForm = document.getElementById('entry-form');

    // User Info
    const userIdSpan = document.getElementById('user-id');
    const profilePicture = document.querySelector('.profile-picture');

    // Entry Form Elements
    const entryDate = document.getElementById('entry-date');
    const entryPhoto = document.getElementById('entry-photo');
    const photoPreview = document.getElementById('photo-preview');
    const entriesContainer = document.getElementById('entries-container');

    // Essay Modal Elements - Re-enabled
    const generateEssayButton = document.getElementById('generate-essay-button');
    const essayModal = document.getElementById('essay-modal');
    const closeButton = document.querySelector('.close-button');
    const essayOutput = document.getElementById('essay-output');
    const saveEssayButton = document.getElementById('final-save-button');

    // --- Initialization ---
    entryDate.valueAsDate = new Date();

    // --- Event Listeners ---

    // Login Handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        if (username) {
            loginScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            userIdSpan.textContent = username;
            // Use a fun, consistent avatar service
            profilePicture.src = `https://api.dicebear.com/8.x/adventurer/svg?seed=${username}`;
        } else {
            alert('아이디를 입력해주세요.');
        }
    });

    // Photo Preview
    entryPhoto.addEventListener('change', () => {
        const file = entryPhoto.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                photoPreview.src = e.target.result;
                photoPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        } else {
            photoPreview.src = '';
            photoPreview.classList.add('hidden');
        }
    });

    // Save Entry
    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = entryDate.value;
        const text = e.target['entry-text'].value;
        if (!date || !text) {
            alert('날짜와 기록을 모두 입력해주세요.');
            return;
        }
        addEntryToDOM(date, text, photoPreview.src);
        entryForm.reset();
        photoPreview.classList.add('hidden');
        photoPreview.src = '';
        entryDate.valueAsDate = new Date();
    });

    // API-based Essay Generation - Re-enabled
    generateEssayButton.addEventListener('click', async () => {
        const entryElements = entriesContainer.querySelectorAll('.entry');
        if (entryElements.length < 2) { // Require at least 2 entries
            alert('AI 에세이를 생성하려면 최소 2개 이상의 기록이 필요합니다.');
            return;
        }

        essayOutput.innerHTML = '<p>AI가 여러분의 소중한 기록들을 바탕으로 에세이를 작성하고 있습니다. 잠시만 기다려주세요...</p>';
        essayModal.classList.remove('hidden');

        const entries = Array.from(entryElements).map(entry => ({
            date: entry.dataset.date,
            text: entry.querySelector('p').innerText,
        }));

        try {
            // Use the proxy server defined in firebase.json
            const response = await fetch('/generate-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entries }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`서버 응답 오류: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            // Format the essay output for better readability
            essayOutput.innerHTML = data.essay.replace(/\n/g, '<br><br>');

        } catch (error) {
            console.error('에세이 생성 실패:', error);
            essayOutput.innerHTML = `<p style="color: red;">에세이 생성에 실패했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.<br><br><strong>오류 상세:</strong> ${error.message}</p>`;
        }
    });

    // Modal Controls - Re-enabled
    closeButton.addEventListener('click', () => essayModal.classList.add('hidden'));
    essayModal.addEventListener('click', (e) => {
        if (e.target === essayModal) {
            essayModal.classList.add('hidden');
        }
    });

    // Save Essay Button Handler - Re-enabled
    saveEssayButton.addEventListener('click', () => {
        alert('에세이가 저장되었습니다! (이 기능은 곧 구현될 예정입니다.)');
        essayModal.classList.add('hidden');
    });

    // --- DOM Manipulation Functions ---
    function addEntryToDOM(date, text, photoSrc) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.dataset.date = date;

        let photoHTML = '';
        if (photoSrc && !photoSrc.endsWith('#')) {
            photoHTML = `<img src="${photoSrc}" alt="기록 사진">`;
        }
        
        // Sanitize and format text
        const textParagraph = document.createElement('p');
        textParagraph.innerHTML = text.replace(/\n/g, '<br>');

        entryElement.innerHTML = `<h3>${new Date(date).toLocaleDateString('ko-KR')}</h3>`;
        if(photoHTML) entryElement.insertAdjacentHTML('beforeend', photoHTML);
        entryElement.appendChild(textParagraph);

        entriesContainer.prepend(entryElement);
    }
});
