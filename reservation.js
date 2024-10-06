



/**
 * @fileoverview This script handles user authentication, data retrieval, and reservation management for a trophy page.
 * It uses Firebase for backend services and jQuery for DOM manipulation.
 * 
 * The script includes the following functionalities:
 * - Initialize Firebase app and services (Auth, Firestore)
 * - Load and display user data (profile image, class data)
 * - Load and display reservations for a specific week
 * - Make and delete reservations
 * - Handle user authentication state changes
 * 
 * @requires https://code.jquery.com/jquery-3.6.0.min.js
 * @requires https://code.jquery.com/ui/1.13.2/jquery-ui.min.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js
 * @requires https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js
 * 
 * @version 1.0.0
 * @license MIT
 */

import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://code.jquery.com/ui/1.13.2/jquery-ui.min.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, getDoc, doc, addDoc, collection, getDocs, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

//const db = firebase.firestore(); // Firestoreを使用







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
                
            

                    // Load user info for each year (1年, 2年, 3年)
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







// 特定の日付の予約を取得して表示するための関数
async function loadReservationsForWeek(startDate) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const reservationTable = document.getElementById('reservationBody');

    // 開始日から1週間分の日付を取得
    const dates = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const formattedDate = date.toISOString().split('T')[0]; // YYYY-MM-DD形式
        dates.push(formattedDate);
        document.getElementById(`date${i + 1}`).innerText = formattedDate; // 表ヘッダーに日付を表示
    }

    // Firestoreの予約コレクションを参照
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
    const reservations = reservationsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // doc.idを追加

    // 予約表を1週間分作成（8:00〜19:00を30分ごとに）
    const startTime = 8;
    const endTime = 19;

    reservationTable.innerHTML = ''; // テーブルをクリア

    // 時間列を作成
    const timeRow = document.createElement('tr');
    const timeCell = document.createElement('td');
    timeCell.innerText = '時間';
    timeRow.appendChild(timeCell);
    reservationTable.appendChild(timeRow);

    for (let time = startTime; time <= endTime; time += 0.5) {
        const row = document.createElement('tr');

        // 時間列を作成
        const timeCell = document.createElement('td');
        timeCell.innerText = `${Math.floor(time)}:${time % 1 === 0 ? '00' : '30'}`;
        row.appendChild(timeCell);

        // 各日のセルを作成
        dates.forEach((date, index) => {
            const cell = document.createElement('td');
            cell.classList.add('available'); // 初期状態は空きとして設定
            cell.dataset.date = date; // セルに日付情報を設定
            cell.dataset.time = time; // セルに時間情報を設定

            // 予約データに基づいてセルを塗りつぶす
            const reservation = reservations.find(
                r => r.date === date && r.time === time
            );

            if (reservation) {
                if (reservation.userId === loggedInUserId) {
                    cell.classList.remove('available');
                    cell.classList.add('reserved-by-user');

                    // 削除ボタンを追加
                    const deleteButton = document.createElement('button');
                    deleteButton.innerText = '削除';
                    deleteButton.addEventListener('click', async (event) => {
                        event.stopPropagation(); // セルのクリックイベントを止める
                        await deleteReservation(reservation.id);
                        loadReservationsForWeek(startDate); // 削除後に再読み込み
                    });
                    cell.appendChild(deleteButton); // 削除ボタンをセルに追加

                } else {
                    cell.classList.remove('available');
                    cell.classList.add('reserved-by-others');
                }

                // クリック時に詳細を表示
                cell.addEventListener('click', () => {
                    alert(
                        `予約者: ${reservation.name}\n目的: ${reservation.purpose}\n連絡先: ${reservation.contact}`
                    );
                });
            }

            row.appendChild(cell);
        });

        reservationTable.appendChild(row);
    }
}

// 予約を削除する関数
async function deleteReservation(reservationId) {
    try {
        await deleteDoc(doc(db, 'reservations', reservationId));
        alert('予約が削除されました。');
    } catch (error) {
        console.error('削除エラー:', error);
        alert('予約の削除に失敗しました。');
    }
}

// ページロード時に今週の日付の予約データを読み込む
window.onload = () => {
    const today = new Date();
    loadReservationsForWeek(today);
};


// 予約フォームの送信ボタンにイベントリスナーを追加
document.getElementById('submitReservation').addEventListener('click', function () {
    const date = document.getElementById('reservationDate').value;
    const time = parseFloat(document.getElementById('reservationTime').value);
    const purpose = document.getElementById('reservationPurpose').value;

    if (!date || !time || !purpose) {
        alert('すべてのフィールドを入力してください。');
        return;
    }

    makeReservation(date, time, purpose);
});

// Firestoreからユーザー情報を取得する関数
async function getUserInfo(loggedInUserId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', loggedInUserId));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
                firstName: userData.firstName,
                lastName: userData.lastName
            };
        } else {
            throw new Error('ユーザーデータが見つかりません。');
        }
    } catch (error) {
        console.error("ユーザーデータ取得エラー:", error);
        return null;
    }
}

// 特定の日付と時間で予約を作成する関数
async function makeReservation(startDate, startTime, endTime, purpose, contact) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');

    if (!loggedInUserId) {
        alert("ユーザーがログインしていません。");
        return;
    }

    try {
        // ユーザーの firstName と lastName を取得
        const userInfo = await getUserInfo(loggedInUserId);
        if (!userInfo) {
            alert("ユーザー情報の取得に失敗しました。");
            return;
        }

        const userName = `${userInfo.firstName} ${userInfo.lastName}`; // firstName と lastName を結合

        // 開始時間と終了時間から予約時間を作成
        const reservationTimes = [];
        for (let time = startTime; time <= endTime; time += 0.5) {
            reservationTimes.push(time);
        }

        // Firestoreから既存の予約を取得
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const existingReservations = reservationsSnapshot.docs.map(doc => doc.data());

        // 予約時間の重複チェック
        let hasDuplicates = false;
        for (const time of reservationTimes) {
            const isOverlapping = existingReservations.some(
                reservation =>
                    reservation.date === startDate &&
                    reservation.time === time &&
                    reservation.userId !== loggedInUserId // 自分の予約は除外
            );

            if (isOverlapping) {
                hasDuplicates = true;
                alert(`日付: ${startDate}, 時間: ${time} は既に予約されています。`);
                break; // 重複している場合はループを終了
            }
        }

        // 重複がなければ予約データを作成
        if (!hasDuplicates) {
            for (const time of reservationTimes) {
                const reservationData = {
                    userId: loggedInUserId,
                    name: userName, // 結合された名前
                    contact: contact, // 連絡先を追加
                    date: startDate, // 日付（YYYY-MM-DD形式）
                    time: time, // 時間
                    purpose: purpose,
                    timestamp: serverTimestamp() // サーバータイムスタンプを使用
                };

                await addDoc(collection(db, 'reservations'), reservationData);
            }

            alert('予約が完了しました！');
            loadReservationsForWeek(new Date()); // 予約後にリロード
        } else {
            alert("別の時間を選択するか、予約者の連絡先から連絡をとりご相談ください。");
        }
    } catch (error) {
        console.error("予約エラー:", error);
        alert('予約に失敗しました。');
    }


}

// 予約フォームのイベントリスナー
document.getElementById('submitReservation').addEventListener('click', () => {
    const startDate = document.getElementById('reservationDate').value;
    const startTime = parseFloat(document.getElementById('reservationStartTime').value);
    const endTime = parseFloat(document.getElementById('reservationEndTime').value);
    const purpose = document.getElementById('reservationPurpose').value;
    const contact = document.getElementById('reservationContact').value;

    makeReservation(startDate, startTime, endTime, purpose, contact);
});


// ページロード時に今週の日付の予約データを読み込む
window.onload = () => {
    const today = new Date();
    loadReservationsForWeek(today);
};