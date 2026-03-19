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

    // --- DEBUG: Temporarily disable modal elements ---
    const generateEssayButton = document.getElementById('generate-essay-button');
    // const essayModal = document.getElementById('essay-modal');
    // const closeButton = document.querySelector('.close-button');
    // const essayOutput = document.getElementById('essay-output');
    // const saveEssayButton = document.getElementById('final-save-button');

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
            profilePicture.src = `https://i.pravatar.cc/150?u=${username}`;
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

    // --- DEBUG: Temporarily disable essay generation and modal controls ---
    generateEssayButton.addEventListener('click', () => {
        alert('현재 디버깅 모드로 인해 AI 에세이 기능을 일시적으로 비활성화했습니다.');
    });

    /*
    // API-based Essay Generation
    generateEssayButton.addEventListener('click', async () => {
        const entryElements = entriesContainer.querySelectorAll('.entry');
        if (entryElements.length === 0) {
            alert('에세이를 생성하려면 먼저 하나 이상의 기록을 저장해야 합니다.');
            return;
        }

        essayOutput.innerHTML = '<p>AI가 여러분의 소중한 기록들을 바탕으로 에세이를 작성하고 있습니다. 잠시만 기다려주세요...</p>';
        essayModal.classList.remove('hidden');

        // ... (rest of the fetch logic)
    });

    // Modal Controls
    closeButton.addEventListener('click', () => essayModal.classList.add('hidden'));
    essayModal.addEventListener('click', (e) => {
        if (e.target === essayModal) {
            essayModal.classList.add('hidden');
        }
    });

    // Save Essay Button Handler
    saveEssayButton.addEventListener('click', () => {
        alert('에세이가 저장되었습니다! (이 기능은 곧 구현될 예정입니다.)');
        essayModal.classList.add('hidden');
    });
    */

    // --- DOM Manipulation Functions ---
    function addEntryToDOM(date, text, photoSrc) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.dataset.date = date;

        let photoHTML = '';
        if (photoSrc && !photoSrc.endsWith('#')) {
            photoHTML = `<img src="${photoSrc}" alt="기록 사진">`;
        }
        
        const textParagraph = document.createElement('p');
        textParagraph.innerHTML = text.replace(/\n/g, '<br>');

        entryElement.innerHTML = `<h3>${date}</h3>`;
        entryElement.appendChild(textParagraph);
        if(photoHTML) entryElement.insertAdjacentHTML('beforeend', photoHTML);

        entriesContainer.prepend(entryElement);
    }
});
