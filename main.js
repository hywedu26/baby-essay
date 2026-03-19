document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const loginScreen = document.getElementById('login-screen');
    const mainScreen = document.getElementById('main-screen');
    const userIdSpan = document.getElementById('user-id');
    const profilePicture = document.querySelector('.profile-picture');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = e.target.username.value;

        // For now, we'll just simulate a login
        if (username) {
            loginScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
            userIdSpan.textContent = username;
            // You can set a default or user-specific profile picture here
            profilePicture.src = 'https://i.pravatar.cc/150?u=' + username; // Using a placeholder image service
        } else {
            alert('아이디를 입력해주세요.');
        }
    });
});
