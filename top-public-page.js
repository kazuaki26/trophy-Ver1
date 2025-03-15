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

// 学生リストを表示する関数
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
            latestClass = `3年: ${userData.classData.year3}`;
        } else if (userData.classData?.year2) {
            latestClass = `2年: ${userData.classData.year2}`;
        } else if (userData.classData?.year1) {
            latestClass = `1年: ${userData.classData.year1}`;
        } else {
            latestClass = "クラス未登録";
        }

        // 生徒のプロフィールとリンクを表示
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="profile-public.html?uid=${uid}">
                <img src="${profileImageUrl}" alt="${userData.firstName || '名無し'}">
                <span>${latestClass}</span>
                <span>${userData.firstName || '名無し'}</span>
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
const searchStudents = async (searchQuery, searchYear, searchClass) => {
    const studentListElement = document.getElementById('studentList');
    studentListElement.innerHTML = '';  // リストを初期化

    try {
        let q = query(collection(db, 'users'));

        if (searchQuery) {
            q = query(q, where('firstName', '>=', searchQuery), where('firstName', '<=', searchQuery + '\uf8ff'));
        }

        if (searchYear) {
            q = query(q, where(`classData.year${searchYear}`, '!=', null));
        }

        if (searchClass) {
            q = query(q, where(`classData.year${searchYear}`, '==', searchClass));
        }

        const querySnapshot = await getDocs(q);
        displayStudentList(querySnapshot.docs); // 検索結果を表示
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// 入力ボックスのイベントリスナーを設定
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchInput = event.target.value;
    const searchYear = document.getElementById('searchYear').value;
    const searchClass = document.getElementById('searchClass').value;
    searchStudents(searchInput, searchYear, searchClass);
});

document.getElementById('searchYear').addEventListener('input', (event) => {
    const searchYear = event.target.value;
    const searchInput = document.getElementById('searchInput').value;
    const searchClass = document.getElementById('searchClass').value;
    searchStudents(searchInput, searchYear, searchClass);
});

document.getElementById('searchClass').addEventListener('input', (event) => {
    const searchClass = event.target.value;
    const searchInput = document.getElementById('searchInput').value;
    const searchYear = document.getElementById('searchYear').value;
    searchStudents(searchInput, searchYear, searchClass);
});

// 初期表示で全生徒を表示
displayAllStudents();