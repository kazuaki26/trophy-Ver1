// Firebase SDK の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs, where, query } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

// Firebase 初期化
const firebaseConfig = {
    apiKey: "AIzaSyAG0VHpTTmn3orvV6DUNGc4qEy9xxktr6Y",
    authDomain: "trofii-profile.firebaseapp.com",
    projectId: "trofii-profile",
    storageBucket: "trofii-profile.appspot.com",
    messagingSenderId: "254873311137",
    appId: "1:254873311137:web:04c5319b4c734f6881dde0",
    measurementId: "G-8C10GT23LE"
};

// Firebaseアプリの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 生徒一覧を取得して表示
const displayStudentList = async () => {
    const studentListElement = document.getElementById('studentList');

    try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        querySnapshot.forEach(doc => {
            const userData = doc.data();
            const uid = doc.id; // UIDを取得

            // プロフィール画像が存在するか確認
            const profileImageUrl = userData.profileImageUrl ? userData.profileImageUrl : 'default-icon.png'; // デフォルトアイコンを設定

            // 生徒のプロフィールとリンクを表示
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="profile-public.html?uid=${uid}">
                    <img src="${profileImageUrl}" alt="${userData.firstName}">
                    <span>${userData.firstName}</span>
                </a>
            `;
            studentListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// 全生徒を表示
const displayAllStudents = async () => {
    const querySnapshot = await getDocs(collection(db, 'users'));
    displayStudentList(querySnapshot.docs);
};

// 検索機能の実装
const searchStudents = async (searchQuery) => {
    const studentListElement = document.getElementById('studentList');
    studentListElement.innerHTML = '';  // リストを初期化

    try {
        // 名前に一致するユーザーをFirestoreクエリで検索
        const q = query(
            collection(db, 'users'),
            where('firstName', '>=', searchQuery),
            where('firstName', '<=', searchQuery + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        displayStudentList(querySnapshot.docs); // 検索結果を表示
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// 入力ボックスのイベントリスナーを設定
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchInput = event.target.value;
    if (searchInput) {
        searchStudents(searchInput);
    } else {
        displayAllStudents(); // 検索ボックスが空の場合、全生徒を表示
    }
});

// 初期表示で全生徒を表示
displayAllStudents();