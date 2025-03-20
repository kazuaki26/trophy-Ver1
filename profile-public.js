// Firebase SDKのインポート
import "https://code.jquery.com/jquery-3.6.0.min.js";
import "https://code.jquery.com/ui/1.13.2/jquery-ui.min.js";

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, getDoc, doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js"

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


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);



// 生徒データを取得して表示
const getUserData = async () => {
    const userDoc = doc(db, 'users', uid);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        document.getElementById('profileImageUrl').src = userData.profileImageUrl;

        // ログインしているユーザーがこのページの所有者か確認
 
    } else {
        console.log("ユーザーデータが存在しません");
    }
};

// ページロード時にユーザーデータを取得
getUserData();




async function loadUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    if (!uid) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
        const data = userDoc.data();

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

// カスタマイズの適用
function applyWidgetCustomization(widget, fontColor, backgroundColor, fontSize, fontFamily, bgImageURL) {
    if (fontColor) widget.style.color = fontColor;
    if (backgroundColor) widget.style.backgroundColor = backgroundColor;
    if (fontSize) widget.style.fontSize = `${fontSize}px`;
    if (fontFamily) widget.style.fontFamily = fontFamily;

    if (bgImageURL) {
        widget.style.backgroundImage = `url(${bgImageURL})`;
        widget.style.backgroundSize = 'cover'; // Make sure the image covers the widget
        widget.style.backgroundPosition = 'center'; // Center the image
        widget.style.backgroundRepeat = 'no-repeat'; // Prevent repeating of the image
    } else {
        widget.style.backgroundImage = ''; // Reset if no image
    }
}





async function fetchWidgetData(widgetId) {

    const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');



    const docRef = doc(db, "users", uid, "widgetsCustomize", widgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("そのようなドキュメントは存在しません");
        return null;
    }
}




// カスタマイズの読み込みと適用
function initializeWidgetsForUser() {
    const widget1 = document.getElementById('widget1');
    const widget2 = document.getElementById('widget2');
    const widget3 = document.getElementById('widget3');

    // カスタマイズをロードして適用
    fetchWidgetData('widget1').then(data => {
        if (data) {
            applyWidgetCustomization(widget1, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });

    fetchWidgetData('widget2').then(data => {
        if (data) {
            applyWidgetCustomization(widget2, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });

    fetchWidgetData('widget3').then(data => {
        if (data) {
            applyWidgetCustomization(widget3, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });
}

// Call this function to initialize widgets for a specific user
initializeWidgetsForUser();



////////ここから

// Load Trophy Posts

// Load Trophy Posts
async function loadPosts(uid) {
    const poseWidget = document.getElementById('poseWidget');
    poseWidget.innerHTML = '<h3>実績一覧</h3>'; // Clear previous posts

    // UIDを使ってユーザーの投稿を取得
    const q = query(collection(db, "trophyPosts"), where("userId", "==", uid), where("status", "==", "true"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const post = doc.data();
        if (post.visibility === 'public' || (post.visibility === 'friends' && auth.currentUser)) {
            const postElement = document.createElement('div');
            postElement.classList.add('post');
            postElement.innerHTML = `
                <h4>${post.title} <span>${post.date}</span> <button class="toggleContent">+</button></h4>
                <div class="post-content" style="display: none;">${post.content || ''} </div>
            `;
            // 画像がある場合は表示
            if (post.imageUrl) {
                postElement.innerHTML += `<img class="post-img" src="${post.imageUrl}" alt="Post Image" style="max-width: 100%; display: none;">`;
            }

            // 新しい投稿を追加
            poseWidget.appendChild(postElement);

            // コンテンツの表示・非表示の切り替え
            const toggleButton = postElement.querySelector('.toggleContent');
            const content = postElement.querySelector('.post-content');
            const img = postElement.querySelector('.post-img');

            toggleButton.addEventListener('click', () => {
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
                if (img) {
                    img.style.display = img.style.display === 'none' ? 'block' : 'none';
                }
            });
        }
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');

    if (uid) {
        await loadPosts(uid);
    } else {
        console.error('UID not found in URL parameters.');
    }
});




// Firestoreからユーザーごとのウィジェットのデータを取得する関数
async function loadWidgetData(uid, widgetId) {
    const widgetRef = doc(db, "users", uid, "widgets", widgetId);
    const docSnap = await getDoc(widgetRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document for widget!");
        return null;
    }
}


// ウィジェットのドラッグとサイズ変更を可能にする関数
function makeDraggable(widget, infoElement) {
 

    // 初期位置とサイズをロード
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
    if (uid) {
        loadWidgetData(uid, widget.id).then(data => {
            if (data) {
                const scaleFactor = (window.innerWidth / 1000);
                widget.style.left = `${data.left * scaleFactor}px`;
                widget.style.top = `${data.top * scaleFactor}px`;
                widget.style.width = `${data.width * scaleFactor-30}px`;
                widget.style.height = `${data.height * scaleFactor}px`;
                widget.style.position = 'absolute';

                infoElement.textContent = `Position: X = ${data.left * scaleFactor}, Y = ${data.top * scaleFactor} | Size: W = ${data.width * scaleFactor}px, H = ${data.height * scaleFactor}px`;
            }
        });
    }
}

// すべてのウィジェットにドラッグ機能を適用
makeDraggable(document.getElementById('widget1'), document.getElementById('info-widget1'));
makeDraggable(document.getElementById('widget2'), document.getElementById('info-widget2'));
makeDraggable(document.getElementById('widget3'), document.getElementById('info-widget3'));








// Load user data and apply customization on page load
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');
const docRef = doc(db, "users", uid);

getDoc(docRef)
    .then((docSnap) => {
        if (docSnap.exists()) {
            const userData = docSnap.data();
            document.getElementById('profileImageUrl').src = userData.profileImageUrl;

            document.getElementById('loggedUserFName').innerText = userData.firstName;
            document.getElementById('loggedUserLName').innerText = userData.lastName;
            document.getElementById('loggedUserEmail').innerText = userData.email;

            // Update Widget 1 with user information
            document.getElementById('loggedUserFNameInWidget').innerText = userData.firstName;
            document.getElementById('loggedUserLNameInWidget').innerText = userData.lastName;
            document.getElementById('loggedUserEmailInWidget').innerText = userData.email;

            loadCustomization(userData); // Load and apply customization
            loadPosts(uid); // Load posts after saving
            initializeWidgetsForUser(uid); // 全てのウィジェットのカスタマイズを適用

            // Load user info for each year (1年, 2年, 3年)
            loadYearInfo(uid); // Load year-specific data
        } else {
            console.log("No document found matching ID");
        }
    })
    .catch((error) => {
        console.log("Error getting document:", error);
    });


document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const uid = urlParams.get('uid');
        loadYearInfo(uid);  // ユーザー情報を読み込む
});

function loadYearInfo(uid) {
    const userRef = doc(db, "users", uid);
    getDoc(userRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const yearInfo = docSnap.data().info || {};

                // 1年生の情報表示
                if (yearInfo.year1) {
                    document.getElementById('class1').innerText = yearInfo.year1.class || "クラス情報なし";
                    document.getElementById('committee1').innerText = yearInfo.year1.committee || "部活・委員会情報なし";
                    document.getElementById('project1').innerText = yearInfo.year1.project || "プロジェクト情報なし";
                    document.getElementById('hobby1').innerText = yearInfo.year1.hobby || "趣味情報なし";
                    document.getElementById('memory1').innerText = yearInfo.year1.memory || "思い出情報なし";
                }

                // 2年生の情報表示
                if (yearInfo.year2) {
                    document.getElementById('class2').innerText = yearInfo.year2.class || "クラス情報なし";
                    document.getElementById('committee2').innerText = yearInfo.year2.committee || "部活・委員会情報なし";
                    document.getElementById('project2').innerText = yearInfo.year2.project || "プロジェクト情報なし";
                    document.getElementById('hobby2').innerText = yearInfo.year2.hobby || "趣味情報なし";
                    document.getElementById('memory2').innerText = yearInfo.year2.memory || "思い出情報なし";
                }

                // 3年生の情報表示
                if (yearInfo.year3) {
                    document.getElementById('class3').innerText = yearInfo.year3.class || "クラス情報なし";
                    document.getElementById('committee3').innerText = yearInfo.year3.committee || "部活・委員会情報なし";
                    document.getElementById('project3').innerText = yearInfo.year3.project || "プロジェクト情報なし";
                    document.getElementById('hobby3').innerText = yearInfo.year3.hobby || "趣味情報なし";
                    document.getElementById('memory3').innerText = yearInfo.year3.memory || "思い出情報なし";
                }
            } else {
                console.log("ユーザーデータが見つかりません");
            }
        })
        .catch((error) => {
            console.error("エラーが発生しました: ", error);
        });
}

document.addEventListener('DOMContentLoaded', () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            const uid = urlParams.get('uid');
            loadYearInfo(uid);  // ユーザー情報を読み込む
        } else {
            console.log("ユーザーがログインしていません");
        }
    });
});



const teacherControlMenu = document.getElementById("teacherControlMenu");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const email = user.email;

        // メールアドレスのドメインチェック
        if (email.endsWith("@staff.bunri-s.ed.jp")) {
            teacherControlMenu.style.display = "block";
        } else {
            // Firestore から StudentID を取得
            const userDocRef = doc(db, "users", user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().studentID === "z2025PT-bunri-az4kgr-t") {
                teacherControlMenu.style.display = "block";
            } else {
                teacherControlMenu.style.display = "none"; // 非表示に設定
            }
        }
    } else {
        teacherControlMenu.style.display = "none"; // 非表示に設定
    }
});