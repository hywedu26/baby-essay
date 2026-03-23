
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase 설정 --- 
    const firebaseConfig = {
      apiKey: "AIzaSyADKPqaFUa83F0uRwb0qcN_6ldVz0tmcJQ",
      authDomain: "babyessay-2ea30.firebaseapp.com",
      projectId: "babyessay-2ea30",
      storageBucket: "babyessay-2ea30.appspot.com",
      messagingSenderId: "638810242116",
      appId: "1:638810242116:web:4e699f861c759798719011"
    };

    // Firebase 앱 초기화
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // 전역 상태 변수
    let currentUser = null;
    let userProfile = {};

    // --- DOM 요소 참조 --- //
    const appContainer = document.getElementById('app-container');
    const authScreen = document.getElementById('auth-screen');
    const mainScreen = document.getElementById('main-screen');

    // 인증 관련
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginButton = document.getElementById('login-button');
    const signupButton = document.getElementById('signup-button');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const logoutButton = document.getElementById('logout-button');

    // 메인 화면 헤더
    const profilePicture = document.querySelector('.profile-picture');
    const userDisplayName = document.getElementById('user-display-name');
    const dDayCounter = document.getElementById('d-day-counter');
    const profileButton = document.getElementById('profile-button');

    // 프로필 관리 모달
    const profileModal = document.getElementById('profile-modal');
    const closeModalButtons = document.querySelectorAll('.close-button');
    const profileModalPicture = document.getElementById('profile-modal-picture');
    const photoUpload = document.getElementById('photo-upload');
    const defaultAvatarsContainer = document.getElementById('default-avatars');
    const babyBirthdateInput = document.getElementById('baby-birthdate');
    const saveProfileButton = document.getElementById('save-profile-button');
    let selectedAvatarUrl = null;

    // 탭
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // 기록 및 에세이
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    const essaysContainer = document.getElementById('essays-container');
    const generateEssayButton = document.getElementById('generate-essay-button');
    const essayModal = document.getElementById('essay-modal');
    const essayOutput = document.getElementById('essay-output');
    const finalSaveButton = document.getElementById('final-save-button');


    // --- 인증 로직 --- //

    // 회원가입 처리
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = signupForm['signup-email'].value;
        const password = signupForm['signup-password'].value;

        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // 회원가입 성공 시, 기본 프로필 생성
                const user = userCredential.user;
                const defaultProfile = {
                    displayName: email.split('@')[0], // 이메일 앞부분을 기본 이름으로
                    photoURL: `https://api.dicebear.com/8.x/miniavs/svg?seed=${user.uid}`,
                    babyBirthdate: '',
                };
                db.collection('users').doc(user.uid).set(defaultProfile);
            })
            .catch(error => alert(`회원가입 실패: ${error.message}`))
    });

    // 로그인 처리
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm['email'].value;
        const password = loginForm['password'].value;

        auth.signInWithEmailAndPassword(email, password)
            .catch(error => alert(`로그인 실패: ${error.message}`));
    });

    // 로그아웃 처리
    logoutButton.addEventListener('click', () => {
        auth.signOut();
    });

    // 인증 상태 감지
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            loadUserProfile(user.uid);
            authScreen.classList.add('hidden');
            mainScreen.classList.remove('hidden');
        } else {
            currentUser = null;
            userProfile = {};
            authScreen.classList.remove('hidden');
            mainScreen.classList.add('hidden');
            entriesContainer.innerHTML = '';
            essaysContainer.innerHTML = '';
        }
    });

    // --- UI 전환 (로그인/회원가입) --- //
    showSignup.addEventListener('click', () => {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    });

    showLogin.addEventListener('click', () => {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    });

    // --- 프로필 관리 --- //
    function loadUserProfile(uid) {
        const docRef = db.collection('users').doc(uid);
        docRef.onSnapshot(doc => {
            if (doc.exists) {
                userProfile = doc.data();
                updateUIWithProfile(userProfile);
                loadEntries(); // 프로필 로드 후 기록 로드
                loadEssays();  // 프로필 로드 후 에세이 로드
            } else {
                console.log("User profile does not exist!");
            }
        });
    }

    function updateUIWithProfile(profile) {
        userDisplayName.textContent = profile.displayName || '사용자';
        profilePicture.src = profile.photoURL || 'https://via.placeholder.com/50';
        
        if (profile.babyBirthdate) {
            const dDay = calculateDday(profile.babyBirthdate);
            dDayCounter.textContent = `D+${dDay}`;
            dDayCounter.classList.remove('hidden');
        } else {
            dDayCounter.classList.add('hidden');
        }
    }

    function calculateDday(birthdateString) {
        const birthDate = new Date(birthdateString);
        const today = new Date();
        const differenceInTime = today.getTime() - birthDate.getTime();
        const differenceInDays = Math.floor(differenceInTime / (1000 * 3600 * 24));
        return differenceInDays + 1; // 태어난 날을 1일로 계산
    }

    // 프로필 모달 열기
    profileButton.addEventListener('click', () => {
        // 모달 열 때 현재 프로필 정보로 채우기
        profileModalPicture.src = userProfile.photoURL || 'https://via.placeholder.com/100';
        babyBirthdateInput.value = userProfile.babyBirthdate || '';
        loadDefaultAvatars();
        profileModal.classList.remove('hidden');
    });

    // 기본 아바타 로드
    function loadDefaultAvatars() {
        defaultAvatarsContainer.innerHTML = '';
        selectedAvatarUrl = null;
        const avatars = ['avatar1', 'avatar2', 'avatar3', 'avatar4', 'avatar5'];
        avatars.forEach(seed => {
            const img = document.createElement('img');
            img.src = `https://api.dicebear.com/8.x/miniavs/svg?seed=${seed}`;
            img.classList.add('avatar-option');
            img.addEventListener('click', () => {
                document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
                img.classList.add('selected');
                selectedAvatarUrl = img.src;
                profileModalPicture.src = img.src; // 미리보기 업데이트
                photoUpload.value = ''; // 파일 업로드 선택 해제
            });
            defaultAvatarsContainer.appendChild(img);
        });
    }
    
    // 프로필 사진 파일 선택 시
    photoUpload.addEventListener('change', (e) => {
         const file = e.target.files[0];
         if(file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                profileModalPicture.src = event.target.result;
            };
            reader.readAsDataURL(file);
            selectedAvatarUrl = null; // 기본 아바타 선택 해제
            document.querySelectorAll('.avatar-option').forEach(el => el.classList.remove('selected'));
         }
    });

    // 프로필 저장
    saveProfileButton.addEventListener('click', async () => {
        const newBirthdate = babyBirthdateInput.value;
        const uploadedFile = photoUpload.files[0];
        let newPhotoURL = userProfile.photoURL;

        saveProfileButton.textContent = '저장 중...';
        saveProfileButton.disabled = true;

        try {
            // 1. 사진 처리 (업로드 또는 선택)
            if (uploadedFile) {
                const filePath = `profile_images/${currentUser.uid}/${uploadedFile.name}`;
                const fileRef = storage.ref(filePath);
                const snapshot = await fileRef.put(uploadedFile);
                newPhotoURL = await snapshot.ref.getDownloadURL();
            } else if (selectedAvatarUrl) {
                newPhotoURL = selectedAvatarUrl;
            }

            // 2. Firestore에 업데이트
            await db.collection('users').doc(currentUser.uid).update({
                photoURL: newPhotoURL,
                babyBirthdate: newBirthdate
            });

            alert('프로필이 저장되었습니다!');
            profileModal.classList.add('hidden');

        } catch (error) {
            alert(`프로필 저장 실패: ${error.message}`);
            console.error(error);
        } finally {
            saveProfileButton.textContent = '저장하기';
            saveProfileButton.disabled = false;
        }
    });

    // --- 탭 기능 --- //
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            tabContents.forEach(content => {
                if (content.id === `${tab}-tab`) {
                    content.classList.add('active');
                } else {
                    content.classList.remove('active');
                }
            });
        });
    });
    
    // --- 기록 관리 (Firestore) --- //
    function getEntriesRef() {
        return db.collection('users').doc(currentUser.uid).collection('entries');
    }

    function loadEntries() {
        if (!currentUser) return;
        getEntriesRef().orderBy('date', 'desc').onSnapshot(snapshot => {
            entriesContainer.innerHTML = '';
            if (snapshot.empty) {
                entriesContainer.innerHTML = '<p>아직 기록이 없어요.</p>';
                return;
            }
            snapshot.forEach(doc => {
                const entry = { id: doc.id, ...doc.data() };
                addEntryToDOM(entry);
            });
        });
    }

    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = entryForm.querySelector('#entry-date').value;
        const text = entryForm.querySelector('#entry-text').value;
        const photoFile = entryForm.querySelector('#entry-photo').files[0];
        
        if (!date || !text) return alert('날짜와 내용을 입력하세요.');

        let photoURL = null;
        if (photoFile) {
            const filePath = `entry_photos/${currentUser.uid}/${Date.now()}_${photoFile.name}`;
            const fileRef = storage.ref(filePath);
            const snapshot = await fileRef.put(photoFile);
            photoURL = await snapshot.ref.getDownloadURL();
        }

        await getEntriesRef().add({
            date,
            text,
            photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        entryForm.reset();
    });

    function addEntryToDOM(entry) {
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
            <h3>${new Date(entry.date).toLocaleDateString()}</h3>
            ${entry.photoURL ? `<img src="${entry.photoURL}" alt="기록 사진">` : ''}
            <p>${entry.text.replace(/\n/g, '<br>')}</p>
            <button class="delete-button" data-id="${entry.id}">삭제</button>
        `;
        entriesContainer.appendChild(div);
    }

    entriesContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            if (confirm('정말 이 기록을 삭제하시겠어요?')) {
                getEntriesRef().doc(id).delete();
            }
        }
    });
    
    // --- 에세이 관리 (Firestore) --- //
    function getEssaysRef() {
        return db.collection('users').doc(currentUser.uid).collection('essays');
    }
    
    async function loadEssays() {
        if (!currentUser) return;
        getEssaysRef().orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            essaysContainer.innerHTML = '';
            if (snapshot.empty) {
                 essaysContainer.innerHTML = '<p>저장된 에세이가 없어요.</p>';
                 return;
            }
            snapshot.forEach(doc => {
                const essay = { id: doc.id, ...doc.data() };
                const div = document.createElement('div');
                div.className = 'essay-card';
                div.innerHTML = `
                    <div class="essay-content">${essay.content}</div>
                    <small>${new Date(essay.createdAt.toDate()).toLocaleString()}</small>
                    <button class="delete-button" data-id="${essay.id}">삭제</button>
                `;
                essaysContainer.appendChild(div);
            });
        });
    }
    
    finalSaveButton.addEventListener('click', () => {
        const content = essayOutput.innerHTML;
        getEssaysRef().add({
            content,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            alert('에세이가 저장되었습니다.');
            essayModal.classList.add('hidden');
        });
    });
    
    essaysContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-button')) {
            const id = e.target.dataset.id;
            if (confirm('정말 이 에세이를 삭제하시겠어요?')) {
                getEssaysRef().doc(id).delete();
            }
        }
    });
    
    // 에세이 생성 로직 (API 호출 부분은 기존과 유사)
    generateEssayButton.addEventListener('click', async () => {
       const snapshot = await getEntriesRef().get();
       if(snapshot.empty || snapshot.size < 2) {
           alert('AI 에세이를 만들려면 2개 이상의 기록이 필요해요.');
           return;
       }
       
       const entriesForAPI = snapshot.docs.map(doc => {
           const { date, text } = doc.data();
           return { date, text };
       });
       
       essayOutput.innerHTML = '<p>AI가 글을 만들고 있어요...</p>';
       essayModal.classList.remove('hidden');
       
       try {
            // !! 중요 !!
            // Cloud Function 또는 다른 백엔드 서비스를 호출하는 로직입니다.
            // '/generate-essay' 엔드포인트가 Gemini API를 호출하도록 구현해야 합니다.
            const response = await fetch('/generate-essay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entries: entriesForAPI }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unknown error');
            essayOutput.innerHTML = data.essay;
        } catch (error) {
            essayOutput.innerHTML = `<p style="color:red;">에세이 생성 실패: ${error.message}</p>`;
            console.error(error);
        }
    });

    // --- 모달 공통 로직 --- //
    closeModalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal').classList.add('hidden');
        });
    });

    // 모달 바깥 클릭 시 닫기
    [profileModal, essayModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    });
});
