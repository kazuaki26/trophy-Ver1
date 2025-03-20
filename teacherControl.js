
/**
 * @fileoverview This script handles various functionalities for a trophy page, including:
 * - Firebase initialization and configuration
 * - User authentication and state management
 * - Profile image upload and display
 * - Class data management and display
 * - Widget customization and storage
 * - Trophy post creation and display
 * - User logout
 * - Widget drag and resize functionality
 * 
 * The script uses Firebase services such as Firestore, Storage, and Authentication to manage user data and interactions.
 * It also utilizes jQuery for DOM manipulation and event handling.
 * 
 * @requires https://code.jquery.com/jquery-3.6.0.min.js
 * @requires https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js
 */


import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://code.jquery.com/ui/1.13.2/jquery-ui.min.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, getDoc, doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js"

const firebaseConfig = {
    apiKey: "AIzaSyAG0VHpTTmn3orvV6DUNGc4qEy9xxktr6Y",
    authDomain: "trofii-profile.firebaseapp.com",
    projectId: "trofii-profile",
    storageBucket: "trofii-profile.appspot.com",
    messagingSenderId: "254873311137",
    appId: "1:254873311137:web:04c5319b4c734f6881dde0",
    measurementId: "G-8C10GT23LE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage(app);

//const db = firebase.firestore(); // Firestoreを使用













//プロフィーwう
async function uploadProfileImage(file) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return null;
    }

    const storageRef = ref(storage, `profile-images/${loggedInUserId}`);
    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading profile image:", error);
        return null;
    }
}

// プロフィール画像保存処理
document.getElementById('save-profile-image').addEventListener('click', async function () {
    const file = document.getElementById('profile-image-upload').files[0];
    if (file) {
        const imageUrl = await uploadProfileImage(file);
        if (imageUrl) {
            document.getElementById('profile-image').src = imageUrl;
            const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
            await setDoc(doc(db, "users", loggedInUserId), { profileImageUrl: imageUrl }, { merge: true });
        }
    }
});
document.getElementById('save-class').addEventListener('click', async function () {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const year1 = document.getElementById('class-year-1').value;
    const year2 = document.getElementById('class-year-2').value;
    const year3 = document.getElementById('class-year-3').value;

    const classData = {
        year1: year1 || null,
        year2: year2 || null,
        year3: year3 || null,
    };

    await setDoc(doc(db, "users", loggedInUserId), { classData: classData }, { merge: true });

    // 最新の学年とクラスを表示
    displayLatestClass(classData);
});

// 最新の学年とクラスを表示する関数
function displayLatestClass(classData) {
    let latestClass = "";
    if (classData.year3) {
        latestClass = `3年: ${classData.year3}`;
    } else if (classData.year2) {
        latestClass = `2年: ${classData.year2}`;
    } else if (classData.year1) {
        latestClass = `1年: ${classData.year1}`;
    }
    document.getElementById('latest-class').textContent = latestClass;
}

async function loadUserData() {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const userDoc = await getDoc(doc(db, "users", loggedInUserId));
    if (userDoc.exists()) {
        const data = userDoc.data();
        if (data.profileImageUrl) {
            document.getElementById('profile-image').src = data.profileImageUrl;
        }
        if (data.classData) {
            displayLatestClass(data.classData);
            document.getElementById('class-year-1').value = data.classData.year1 || "";
            document.getElementById('class-year-2').value = data.classData.year2 || "";
            document.getElementById('class-year-3').value = data.classData.year3 || "";
        }
    }
}

// 初期データのロード
loadUserData();






// Call this function to initialize widgets for a specific user
//initializeWidgetsForUser('someUserId');


// Save Profile Changes
const saveButton = document.getElementById('saveChanges');
saveButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // Ensure user ID is fetched correctly
    const newFirstName = document.getElementById('newFirstName').value.trim(); // Fetch and trim input values
    const newLastName = document.getElementById('newLastName').value.trim();

    if (!loggedInUserId) {
        alert("ユーザーIDが見つかりません。再度ログインしてください。");
        return;
    }

    if (!newFirstName && !newLastName) {
        alert("有効な姓と名を入力してください。");
        return;
    }

    const updates = {};
    if (newFirstName) {
        updates.firstName = newFirstName; // Only include changes if a new value is provided
    }
    if (newLastName) {
        updates.lastName = newLastName;
    }

    try {
        const userRef = doc(db, "users", loggedInUserId); // Firestore document reference
        await updateDoc(userRef, updates); // Update Firestore document
        alert("プロフィールが適切に保存されました!");

        // Reload the user data to reflect changes on the page without requiring a full page reload
        document.getElementById('loggedUserFName').innerText = newFirstName || document.getElementById('loggedUserFName').innerText;
        document.getElementById('loggedUserLName').innerText = newLastName || document.getElementById('loggedUserLName').innerText;

        // Optionally, clear the input fields after successful update
        document.getElementById('newFirstName').value = '';
        document.getElementById('newLastName').value = '';

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("あなたのプロフィール更新にエラーが発生致しました。もう一度お試しください。");
    }
});









// Show/Hide sections. add firebase indeed
const toggleSectionVisibility = (buttonId, sectionId) => {
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);
    button.addEventListener('click', () => {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
};

toggleSectionVisibility('editButton', 'editSection');




// Logout Button
const logoutButton = document.getElementById('logout');
logoutButton.addEventListener('click', () => {
    localStorage.removeItem('loggedInUserId');
    signOut(auth)
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
});







// Load user data and apply customization on page load
onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserFName').innerText = userData.firstName;
                    document.getElementById('loggedUserLName').innerText = userData.lastName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;

                    // Update Widget 1 with user information
                    document.getElementById('loggedUserFNameInWidget').innerText = userData.firstName;
                    document.getElementById('loggedUserFNameInWidget2').innerText = userData.firstName;
                    document.getElementById('loggedUserLNameInWidget').innerText = userData.lastName;
                    document.getElementById('loggedUserEmailInWidget').innerText = userData.email;

                    loadCustomization(userData); // Load and apply customization
                    loadPosts(loggedInUserId); // Load posts after saving
                    initializeWidgetsForUser(); // 全てのウィジェットのカスタマイズを適用

                    // Load user info for each year (1年, 2年, 3年)
                    loadYearInfo(loggedInUserId); // Load year-specific data
                } else {
                    console.log("No document found matching ID");
                }
            })
            .catch((error) => {
                console.log("Error getting document:", error);
            });
    } else {
        console.log("User ID not found in local storage");
    }
});













// ユーザーの名前を取得する関数
async function getUserName(userId) {
    if (!userId) return "不明なユーザー";

    try {
        const userRef = doc(db, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();
            return `${userData.firstName} ${userData.lastName}`;
        } else {
            return "不明なユーザー";
        }
    } catch (error) {
        console.error("Error fetching user name:", error);
        return "不明なユーザー";
    }
}



// Trophy Posts を読み込む
// Trophy Posts を読み込む
async function loadEditablePosts() {
    const posteditvisibility = document.getElementById('posteditvisibility');
    posteditvisibility.innerHTML = '<h3>担当生徒の投稿一覧</h3>'; // Clear previous posts

    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    // ログインユーザーの情報を取得
    const userRef = doc(db, "users", loggedInUserId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        console.error("ユーザー情報が見つかりません");
        return;
    }

    const userData = userSnap.data();
    const userTermYear = userData.handleTermYear;
    const userClass = userData.handleClass;

    const q = query(collection(db, "trophyPosts"));
    const querySnapshot = await getDocs(q);

    for (const doc of querySnapshot.docs) {
        const post = doc.data();

        // status が false または undefined の場合のみ表示
        if (post.status === true || post.status === "true") {
            continue; // スキップして次のループへ
        }

        // ログインユーザーの handleTermYear, handleClass がある場合、フィルタリング
        if (userTermYear && userClass) {
            if (post.termYear !== userTermYear || post.currentClass !== userClass) {
                continue; // 一致しない場合スキップ
            }
        }

        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // ユーザー名を非同期で取得
        const userName = await getUserName(post.userId);

        postElement.innerHTML = `
            <h4>${userName}</h4> <!-- ここにユーザー名を表示 -->
            <h4>${post.title} <span>${post.date}</span> <button class="toggleContent">+</button></h4>
            <span class="tag" style="color: ${post.TagColor};">${post.tagText}</span>
            <span class="status">
                ${post.status === undefined ? '申請前' : post.status === false ? '申請差し戻し' : '承認済み'}
            </span>
            <div class="post-content">${post.content || ''}</div>
            <select class="visibility-select" data-post-id="${doc.id}">
                <option>--申請の承認を選択--</option>
                <option value="true" ${post.status === true ? 'selected' : ''}>申請を承認</option>
                <option value="false" ${post.status === false ? 'selected' : ''}>申請を差し戻し</option>
            </select>
        `;

        if (post.imageUrl) {
            postElement.innerHTML += `<img src="${post.imageUrl}" alt="Post Image" style="max-width: 100%;">`;
        }
        posteditvisibility.appendChild(postElement);

        // Toggle post content visibility
        const toggleButton = postElement.querySelector('.toggleContent');
        const content = postElement.querySelector('.post-content');
        toggleButton.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        // Add event listener for visibility change
        const visibilitySelect = postElement.querySelector('.visibility-select');
        visibilitySelect.addEventListener('change', async (event) => {
            const newVisibility = event.target.value;
            const postId = event.target.getAttribute('data-post-id');
            await editPostVisibility(postId, newVisibility);
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadEditablePosts();
});




async function editPostVisibility(postId, newVisibility) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    try {
        const postRef = doc(db, "trophyPosts", postId);
        await updateDoc(postRef, { status: newVisibility });
        alert("公開範囲設定が正常に更新されました!");
        await loadEditablePosts(loggedInUserId);
    } catch (error) {
        console.error("Error updating post visibility:", error);
    }
}

// visibility　→ 　status






// 学生リストを表示する関数
const displayStudentList = (docs) => {
    const studentListElement = document.getElementById('studentList');
    studentListElement.innerHTML = ''; // リストを初期化

    docs.forEach((doc) => {
        const userData = doc.data();
        const uid = doc.id; // UIDを取得

        // プロフィール画像が存在するか確認
        const profileImageUrl = userData.profileImageUrl || 'default-icon.png'; // デフォルトアイコンを設定

        // 最新のクラスを取得
        let latestClass = "";
        if (userData.classData?.year3) {
            latestClass = `3 - ${userData.classData.year3}`;
        } else if (userData.classData?.year2) {
            latestClass = `2 - ${userData.classData.year2}`;
        } else if (userData.classData?.year1) {
            latestClass = `1 - ${userData.classData.year1}`;
        } else {
            latestClass = "クラス未登録";
        }

        // 生徒のプロフィールとリンクを表示
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="profile-public.html?uid=${uid}" style="display: flex; align-items: center;">
            <img src="${profileImageUrl}" alt="${userData.firstName || '名無し'}" style="vertical-align: middle; margin-right: 10px;">
            <div style="width: 400%;">
                <samp><strong>${userData.TermYear ? `${userData.TermYear}期生` : ''}　</strong></samp>
                <span><strong>${latestClass}</strong></span>
                <span style="font-size: 120%;"><strong>　${userData.firstName || '名無し'}</strong></span>
            </div>
            </a>
        `;
        studentListElement.appendChild(listItem);
    });
};

// 全生徒を表示
const displayAllStudents = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        displayStudentList(querySnapshot.docs);
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// ページ読み込み時に実行
document.addEventListener('DOMContentLoaded', displayAllStudents);

// 検索機能の実装
const searchStudents = async (searchQuery, searchYear, searchClass, searchTermYear) => {
    const studentListElement = document.getElementById('studentList');
    studentListElement.innerHTML = '';  // リストを初期化

    try {
        let q = query(collection(db, 'users'));

        if (searchQuery) {
            q = query(q, where('firstName', '>=', searchQuery), where('firstName', '<=', searchQuery + '\uf8ff'));
        }

        const querySnapshot = await getDocs(q);
        const filteredDocs = querySnapshot.docs.filter(doc => {
            const userData = doc.data();
            let match = true;

            if (searchYear) {
                if (searchYear === '3' && !userData.classData?.year3) {
                    match = false;
                } else if (searchYear === '2' && (!userData.classData?.year2 || userData.classData?.year3)) {
                    match = false;
                } else if (searchYear === '1' && (!userData.classData?.year1 || userData.classData?.year2 || userData.classData?.year3)) {
                    match = false;
                }
            }

            if (searchClass) {
                if (searchYear === '3' && userData.classData?.year3 !== searchClass) {
                    match = false;
                } else if (searchYear === '2' && userData.classData?.year2 !== searchClass) {
                    match = false;
                } else if (searchYear === '1' && userData.classData?.year1 !== searchClass) {
                    match = false;
                }
            }

            if (searchTermYear && userData.TermYear !== searchTermYear) {
                match = false;
            }

            return match;
        });

        displayStudentList(filteredDocs); // 検索結果を表示
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// 入力ボックスのイベントリスナーを設定
document.getElementById('studentSearchInput').addEventListener('input', (event) => {
    const searchInput = event.target.value;
    const searchYear = document.getElementById('studentSearchYear').value;
    const searchClass = document.getElementById('studentSearchClass').value;
    const searchTermYear = document.getElementById('studentSearchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('studentSearchYear').addEventListener('input', (event) => {
    const searchYear = event.target.value;
    const searchInput = document.getElementById('studentSearchInput').value;
    const searchClass = document.getElementById('studentSearchClass').value;
    const searchTermYear = document.getElementById('studentSearchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('studentSearchClass').addEventListener('input', (event) => {
    const searchClass = event.target.value;
    const searchInput = document.getElementById('studentSearchInput').value;
    const searchYear = document.getElementById('studentSearchYear').value;
    const searchTermYear = document.getElementById('studentSearchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('studentSearchTermYear').addEventListener('input', (event) => {
    const searchTermYear = event.target.value;
    const searchInput = document.getElementById('studentSearchInput').value;
    const searchYear = document.getElementById('studentSearchYear').value;
    const searchClass = document.getElementById('studentSearchClass').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

// 初期表示で全生徒を表示
displayAllStudents();

document.getElementById('SaveHandle').addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const handleTermYear = document.getElementById('studentHandleTermYear-trophyPost').value.trim();
    const handleClass = document.getElementById('studentHandleClass-trophyPost').value.trim();

    if (!handleTermYear && !handleClass) {
        alert("有効な学年とクラスを入力してください。");
        return;
    }

    const updates = {};
    if (handleTermYear) {
        updates.handleTermYear = handleTermYear;
    }
    if (handleClass) {
        updates.handleClass = handleClass;
    }

    try {
        const userRef = doc(db, "users", loggedInUserId);
        await updateDoc(userRef, updates);
        alert("担当の学年(期生)とクラス情報が正常に保存されました!");
    } catch (error) {
        console.error("Error updating handle term year and class:", error);
        alert("情報の更新中にエラーが発生しました。もう一度お試しください。");
    }
});


// FirestoreからhandleTermYearとhandleClassを取得して表示
async function displayHandleTermClass() {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    try {
        const userDoc = await getDoc(doc(db, "users", loggedInUserId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            document.getElementById('handleTermYearDisplay').textContent = data.handleTermYear || "-";
            document.getElementById('handleClassDisplay').textContent = data.handleClass || "-";
        }
    } catch (error) {
        console.error("Error fetching handle term year and class:", error);
    }
}

// ページ読み込み時に保存されたデータを表示
document.addEventListener('DOMContentLoaded', displayHandleTermClass);

