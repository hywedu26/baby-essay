document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const userIdSpan = document.getElementById('user-id');
    const profilePicture = document.querySelector('.profile-picture');

    const entryForm = document.getElementById('entry-form');
    const entryDate = document.getElementById('entry-date');
    const entryPhoto = document.getElementById('entry-photo');
    const photoPreview = document.getElementById('photo-preview');
    const entriesContainer = document.getElementById('entries-container');

    // Set default date to today
    entryDate.valueAsDate = new Date();

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

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const date = entryDate.value;
        const text = e.target['entry-text'].value;
        const photoSrc = photoPreview.src;

        if (!date || !text) {
            alert('날짜와 기록을 모두 입력해주세요.');
            return;
        }

        const entryElement = document.createElement('div');
        entryElement.classList.add('entry');

        let photoHTML = '';
        if (photoSrc && !photoSrc.endsWith('#')) {
            photoHTML = `<img src="${photoSrc}" alt="기록 사진">`;
        }

        entryElement.innerHTML = `
            <h3>${date}</h3>
            <p>${text.replace(/\n/g, '<br>')}</p>
            ${photoHTML}
        `;

        entriesContainer.prepend(entryElement);

        // Reset form
        entryForm.reset();
        photoPreview.classList.add('hidden');
        photoPreview.src = '';
        entryDate.valueAsDate = new Date();
    });
});
