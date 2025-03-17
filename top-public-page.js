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

        // 画面サイズに応じてリンク先を変更
        const profilePage = window.innerWidth <= 600 ? 'Phone-profile-public.html' : 'profile-public.html';

        // 生徒のプロフィールとリンクを表示
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <a href="${profilePage}?uid=${uid}" style="display: flex; align-items: center;">
            <img src="${profileImageUrl}" alt="${userData.firstName || '名無し'}" style="vertical-align: middle; margin-right: 10px;">
            <div>
                <samp><strong>　　${userData.TermYear ? `${userData.TermYear}期生` : ''}　</strong></samp>
                <span><strong>${latestClass}　　</strong></span>
                <span style="font-size: 120%;"><strong>${userData.firstName || '名無し'}　${userData.lastName}</strong></span>
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

        // すべてのユーザーを取得（Firestoreでは OR 検索ができないため）
        const querySnapshot = await getDocs(q);
        const filteredDocs = querySnapshot.docs.filter(doc => {
            const userData = doc.data();
            let match = false;

            // firstName, lastName, fullName で検索
            const fullName = `${userData.firstName} ${userData.lastName}`.toLowerCase();
            const searchLower = searchQuery.toLowerCase();

            if (searchQuery) {
                match = userData.firstName?.toLowerCase().includes(searchLower) ||
                        userData.lastName?.toLowerCase().includes(searchLower) ||
                        fullName.includes(searchLower);
            } else {
                match = true;  // 検索クエリなしの場合は true にする
            }

            // 学年フィルタ
            if (searchYear) {
                if (searchYear === '3' && !userData.classData?.year3) {
                    match = false;
                } else if (searchYear === '2' && (!userData.classData?.year2 || userData.classData?.year3)) {
                    match = false;
                } else if (searchYear === '1' && (!userData.classData?.year1 || userData.classData?.year2 || userData.classData?.year3)) {
                    match = false;
                }
            }

            // クラスフィルタ
            if (searchClass) {
                if (searchYear === '3' && userData.classData?.year3 !== searchClass) {
                    match = false;
                } else if (searchYear === '2' && userData.classData?.year2 !== searchClass) {
                    match = false;
                } else if (searchYear === '1' && userData.classData?.year1 !== searchClass) {
                    match = false;
                }
            }

            // 期生フィルタ
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
document.getElementById('searchInput').addEventListener('input', (event) => {
    const searchInput = event.target.value;
    const searchYear = document.getElementById('searchYear').value;
    const searchClass = document.getElementById('searchClass').value;
    const searchTermYear = document.getElementById('searchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('searchYear').addEventListener('input', (event) => {
    const searchYear = event.target.value;
    const searchInput = document.getElementById('searchInput').value;
    const searchClass = document.getElementById('searchClass').value;
    const searchTermYear = document.getElementById('searchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('searchClass').addEventListener('input', (event) => {
    const searchClass = event.target.value;
    const searchInput = document.getElementById('searchInput').value;
    const searchYear = document.getElementById('searchYear').value;
    const searchTermYear = document.getElementById('searchTermYear').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

document.getElementById('searchTermYear').addEventListener('input', (event) => {
    const searchTermYear = event.target.value;
    const searchInput = document.getElementById('searchInput').value;
    const searchYear = document.getElementById('searchYear').value;
    const searchClass = document.getElementById('searchClass').value;
    if (!searchInput && !searchYear && !searchClass && !searchTermYear) {
        displayAllStudents();
    } else {
        searchStudents(searchInput, searchYear, searchClass, searchTermYear);
    }
});

// 初期表示で全生徒を表示
displayAllStudents();


