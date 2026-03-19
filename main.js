document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const loginForm = document.getElementById('login-form');
    const entryForm = document.getElementById('entry-form');
    const userIdSpan = document.getElementById('user-id');
    const profilePicture = document.querySelector('.profile-picture');
    const entryDate = document.getElementById('entry-date');
    const entryPhoto = document.getElementById('entry-photo');
    const photoPreview = document.getElementById('photo-preview');
    const entriesContainer = document.getElementById('entries-container');
    const generateEssayButton = document.getElementById('generate-essay-button');
    const essayModal = document.getElementById('essay-modal');
    const closeButton = document.querySelector('.close-button');
    const essayOutput = document.getElementById('essay-output');
    const finalSaveButton = document.getElementById('final-save-button');

    entryDate.valueAsDate = new Date();

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = e.target.username.value;
        if (username) {
            loginScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            userIdSpan.textContent = username;
            profilePicture.src = `https://api.dicebear.com/8.x/miniavs/svg?seed=${username}`;
        }
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
        addEntryToDOM(date, text, photoPreview.src);
        entryForm.reset();
        photoPreview.classList.add('hidden');
        photoPreview.src = '';
        entryDate.valueAsDate = new Date();
    });

    generateEssayButton.addEventListener('click', async () => {
        const entryElements = entriesContainer.querySelectorAll('.entry');
        if (entryElements.length < 2) {
            alert('AI 에세이를 생성하려면 최소 2개 이상의 기록이 필요합니다.');
            return;
        }

        essayOutput.innerHTML = '<p>AI가 아가의 소중한 기록으로 예쁜 글을 만들고 있어요. 잠시만 기다려주세요...</p>';
        essayModal.classList.remove('hidden');

        const entries = Array.from(entryElements).map(entry => ({
            date: entry.dataset.date,
            text: entry.querySelector('p').innerText,
        }));

        try {
            const response = await fetch('/generate-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entries }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw data; // Throw the parsed JSON error object from the server
            }

            essayOutput.innerHTML = data.essay.replace(/\n/g, '<br><br>');

        } catch (error) {
            console.error('에세이 생성 실패:', error);

            // [Graceful Failure] Check for the specific model issue flag from the server
            if (error && error.isModelIssue) {
                essayOutput.innerHTML = `<div style="text-align: center; color: #d9534f;">
                    <h3 style="margin-bottom: 15px;">AI 기능 점검 중</h3>
                    <p>현재 AI 에세이 생성 기능에 문제가 발생하여<br>일시적으로 사용이 중단되었습니다.</p>
                    <p>개발팀이 이 문제를 인지하고 있으며,<br>빠르게 해결하도록 노력하겠습니다.</p>
                    <p style="margin-top: 20px;">이용에 불편을 드려 대단히 죄송합니다.</p>
                </div>`;
            } else {
                const errorMessage = error.error ? `${error.error} - ${error.details || ''}` : (error.message || JSON.stringify(error));
                essayOutput.innerHTML = `<p style="color: red;">에세이 생성에 실패했어요. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요.<br><br><strong>오류 상세:</strong> ${errorMessage}</p>`;
            }
        }
    });

    closeButton.addEventListener('click', () => essayModal.classList.add('hidden'));
    essayModal.addEventListener('click', (e) => {
        if (e.target === essayModal) {
            essayModal.classList.add('hidden');
        }
    });

    finalSaveButton.addEventListener('click', () => {
        alert('에세이가 저장되었습니다! (이 기능은 곧 구현될 예정입니다.)');
        essayModal.classList.add('hidden');
    });

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

        entryElement.innerHTML = `<h3>${new Date(date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}</h3>`;
        if(photoHTML) entryElement.insertAdjacentHTML('beforeend', photoHTML);
        entryElement.appendChild(textParagraph);

        entriesContainer.prepend(entryElement);
    }
});
