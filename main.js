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

    // Essay Modal Elements
    const generateEssayButton = document.getElementById('generate-essay-button');
    const essayModal = document.getElementById('essay-modal');
    const closeButton = document.querySelector('.close-button');
    const essayOutput = document.getElementById('essay-output');
    const saveEssayButton = document.getElementById('save-essay-button');

    // --- Initialization ---
    entryDate.valueAsDate = new Date();

    // --- Event Listeners ---

    // Login
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
        const photoSrc = photoPreview.src;

        if (!date || !text) {
            alert('날짜와 기록을 모두 입력해주세요.');
            return;
        }

        addEntryToDOM(date, text, photoSrc);

        // Reset form
        entryForm.reset();
        photoPreview.classList.add('hidden');
        photoPreview.src = '';
        entryDate.valueAsDate = new Date();
    });

    // Essay Modal Control
    generateEssayButton.addEventListener('click', () => {
        const entries = entriesContainer.querySelectorAll('.entry');
        if (entries.length === 0) {
            alert('에세이를 생성하려면 먼저 하나 이상의 기록을 저장해야 합니다.');
            return;
        }
        const generatedEssay = generateMockEssay(entries);
        essayOutput.innerHTML = generatedEssay;
        essayModal.classList.remove('hidden');
    });

    closeButton.addEventListener('click', () => essayModal.classList.add('hidden'));
    essayModal.addEventListener('click', (e) => {
        if (e.target === essayModal) {
            essayModal.classList.add('hidden');
        }
    });

    saveEssayButton.addEventListener('click', () => {
        alert('에세이가 저장되었습니다! (이 기능은 곧 구현될 예정입니다.)');
        essayModal.classList.add('hidden');
    });

    // --- Functions ---

    function addEntryToDOM(date, text, photoSrc) {
        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');
        entryElement.dataset.date = date; // Store data for essay generation

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

    function generateMockEssay(entries) {
        let essayText = '<h2>우리의 작은 기록들</h2><br>';
        essayText += '<p>너와 함께한 모든 순간은 반짝이는 별과 같았어. 하루하루가 모여 아름다운 추억의 은하수가 되었지.</p><br>';

        const sortedEntries = Array.from(entries).sort((a, b) => new Date(a.dataset.date) - new Date(b.dataset.date));

        sortedEntries.forEach(entry => {
            const date = entry.querySelector('h3').textContent;
            const text = entry.querySelector('p').innerText;
            essayText += `<strong>${date}</strong><p>${text}</p><br>`;
        });

        essayText += '<p>이 모든 날들이 모여 너의 세상이 되고, 우리의 행복이 되었네. 앞으로도 너의 모든 첫 순간을 함께할게. 사랑한다, 아가.</p>';
        return essayText;
    }
});
