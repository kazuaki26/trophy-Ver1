// Firebase SDK の読み込み
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

            // 生徒のプロフィールとリンクを表示
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="profile-public.html?uid=${uid}">
                    <img src="${userData.profileImageUrl}" alt="${userData.firstName}">
                    <span>${userData.firstName}</span>
                </a>
            `;
            studentListElement.appendChild(listItem);
        });
    } catch (error) {
        console.error("Error fetching student data: ", error);
    }
};

// 生徒一覧を表示する関数を呼び出す
displayStudentList();

// カスタマイズボタンを押したらカスタマイズオプションを表示
document.getElementById('customize-button-widget1').addEventListener('click', function () {
    var customizationOptions = document.getElementById('customization-options-widget1');
    if (customizationOptions.style.display === 'none') {
        customizationOptions.style.display = 'block';
    } else {
        customizationOptions.style.display = 'none';
    }
});
