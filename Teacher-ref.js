const submit_btn = document.getElementById("submit_btn");

const contact_name = document.getElementById("name");
const email = document.getElementById("subject");  // 件名を入力するフィールドは 'subject' に変更
const body = document.getElementById("body");



// ドロップダウンメニューのクリックイベント
document.querySelectorAll('.dropdown').forEach(function(dropdown) {
    dropdown.addEventListener('click', function() {
        this.setAttribute('tabindex', 1);
        this.focus();
        this.classList.toggle('active');
        let dropdownMenu = this.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.style.display = (dropdownMenu.style.display === 'block') ? 'none' : 'block';
        }
    });
});

// ドロップダウンメニューのフォーカスアウトイベント
document.querySelectorAll('.dropdown').forEach(function(dropdown) {
    dropdown.addEventListener('focusout', function() {
        this.classList.remove('active');
        let dropdownMenu = this.querySelector('.dropdown-menu');
        if (dropdownMenu) {
            dropdownMenu.style.display = 'none';
        }
    });
});

// ドロップダウンメニュー内の項目クリック時の処理
document.querySelectorAll('.dropdown .dropdown-menu li').forEach(function(item) {
    item.addEventListener('click', function() {
        let dropdown = this.closest('.dropdown');
        if (dropdown) {
            dropdown.querySelector('span').textContent = this.textContent;
            let input = dropdown.querySelector('input');
            if (input) {
                input.setAttribute('value', this.getAttribute('id'));
            }
        }
    });
});

// メッセージを表示する処理
document.querySelectorAll('.dropdown-menu li').forEach(function(item) {
    item.addEventListener('click', function() {
        let dropdown = this.closest('.dropdown');
        if (dropdown) {
            let inputVal = dropdown.querySelector('input').value;
            let msgElement = document.querySelector('.msg');
            if (msgElement) {
                msgElement.innerHTML = '<span class="msg">　　現在選択中:　 <strong>' + inputVal + '</strong></span>';
            }
        }
    });
});



// Firebaseのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore,collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";


// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAG0VHpTTmn3orvV6DUNGc4qEy9xxktr6Y",
    authDomain: "trofii-profile.firebaseapp.com",
    projectId: "trofii-profile",
    storageBucket: "trofii-profile.appspot.com",
    messagingSenderId: "254873311137",
    appId: "1:254873311137:web:04c5319b4c734f6881dde0",
    measurementId: "G-8C10GT23LE"
};


// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// カテゴリー選択イベント処理
document.querySelectorAll('.dropdown-menu li').forEach(function (item) {
    item.addEventListener('click', function () {
        let dropdown = this.closest('.dropdown');
        dropdown.querySelector('span').textContent = this.textContent;
        dropdown.querySelector('input').value = this.id;  // 選択されたIDをhidden inputに保存
    });
});

// 送信ボタンが押されたときの処理
document.getElementById('submit_btn').addEventListener('click', async function (e) {
    e.preventDefault();
    alert(`お名前：${contact_name.value}\n件名：${email.value}\nお問合せ内容：${body.value}`);

    // フォームのデータを取得
    const teacherName = document.getElementById('name').value;
    const category = document.getElementById('category').value;
    const subject = document.getElementById('subject').value;
    const body = document.getElementById('body').value;

    // 必須フィールドのチェック
    if (!teacherName || !category || !subject || !body) {
        alert("すべてのフィールドを入力してください！");
        return;
    }

    try {
        // Firebaseにデータを送信
        await addDoc(collection(db, "Teacher"), {
            teacherName: teacherName,
            category: category,
            subject: subject,
            body: body,
            timestamp: serverTimestamp() // サーバー側のタイムスタンプを使用
        });
        alert("お問合せが送信されました！");
        document.querySelector('form').reset();
        document.querySelector('.dropdown span').textContent = 'カテゴリーを選択してください';  // ドロップダウンをリセット
    } catch (error) {
        console.error("エラーが発生しました: ", error);
    }
});

// 送信ボタンがクリックされたときの処理
submit_btn.addEventListener("click", (e) => {
    e.preventDefault();
    alert(`お名前：${contact_name.value}\n件名：${email.value}\nお問合せ内容：${body.value}`);

    // フォームが正しく入力されているかチェック
    if (!contact_name.value || !email.value || !body.value) {
        alert('全てのフィールドを入力してください');
        return;
    }

    // Firebaseに送信処理を行う（Firebaseの設定は前述のコードに含まれているものとする）
    addDoc(collection(db, "Teacher"), {
        teacherName: contact_name.value,
        category: document.getElementById("category").value, // ドロップダウンの選択値
        subject: email.value,
        body: body.value,
        timestamp: serverTimestamp() // サーバー側のタイムスタンプを使用
    })
    .then(() => {
        alert("お問合せが送信されました！");
        document.querySelector('form').reset();  // フォームをリセット
        document.querySelector('.dropdown span').textContent = 'カテゴリーを選択してください';  // ドロップダウンをリセット
    })
    .catch((error) => {
        console.error("エラーが発生しました: ", error);
    });
});