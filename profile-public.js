// Firebase SDKのインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js';

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

// URLからuidを取得
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');

// 生徒データを取得して表示
const getUserData = async () => {
    const userDoc = doc(db, 'users', uid);
    const userSnap = await getDoc(userDoc);
    if (userSnap.exists()) {
        const userData = userSnap.data();
        document.getElementById('profileImageUrl').src = userData.profileImageUrl;
        document.getElementById('firstName').textContent = userData.firstName;

        // ログインしているユーザーがこのページの所有者か確認
        onAuthStateChanged(auth, (user) => {
            if (user && user.uid === uid) {
                document.getElementById('editButton').style.display = 'block';
            }
        });
    } else {
        console.log("ユーザーデータが存在しません");
    }
};

// ページロード時にユーザーデータを取得
getUserData();






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
// Show/Hide sections. add firebase indeed
const toggleSectionVisibility = (buttonId, sectionId) => {
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);
    button.addEventListener('click', () => {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
};

toggleSectionVisibility('editButton', 'editSection');
//toggleSectionVisibility('customizewidget1Button', 'customizewidget1Section');
//toggleSectionVisibility('customizewidget2Button', 'customizewidget2Section');
toggleSectionVisibility('createPostButton', 'trophyRoomSection');


// Load Trophy Posts
async function loadPosts(userId) {
    const poseWidget = document.getElementById('poseWidget');
    widget2.poseWidget = '<h3>Your Trophy Posts</h3>'; // Clear previous posts　　参考
    const q = query(collection(db, "trophyPosts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h4>${post.title} <span>${post.date}</span> <button class="toggleContent">+</button></h4>
            <div class="post-content">${post.content || ''}</div>
        `;
        if (post.imageUrl) {
            postElement.innerHTML += `<img src="${post.imageUrl}" alt

="Post Image" style="max-width: 100%;">`;
        }
        poseWidget.appendChild(postElement);

        // Toggle post content visibility
        const toggleButton = postElement.querySelector('.toggleContent');
        const content = postElement.querySelector('.post-content');
        toggleButton.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });
    });
}


document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    await loadPosts(loggedInUserId);
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



// Load user data and apply customization on page load
onAuthStateChanged(auth, (user) => {
    if (user) {
        const urlParams = new URLSearchParams(window.location.search);
        const uid = urlParams.get('uid');
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
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
    } else {
        console.log("User not logged in");
    }
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
                    document.getElementById('class1').innerText = "クラス：" + (yearInfo.year1.class || "クラス情報なし");
                    document.getElementById('committee1').innerText = "委員会：" + (yearInfo.year1.committee || "委員会情報なし");
                    document.getElementById('project1').innerText = "独自プロジェクト：" + (yearInfo.year1.project || "独自プロジェクト情報なし");
                    document.getElementById('hobby1').innerText = "趣味：" + (yearInfo.year1.hobby || "趣味情報なし");
                    document.getElementById('memory1').innerText = "思い出：" + (yearInfo.year1.memory || "思い出情報なし");
                }

                // 2年生の情報表示
                if (yearInfo.year2) {
                    document.getElementById('class2').innerText = yearInfo.year2.class || "クラス情報なし";
                    document.getElementById('committee2').innerText = yearInfo.year2.committee || "委員会情報なし";
                    document.getElementById('project2').innerText = yearInfo.year2.project || "独自プロジェクト情報なし";
                    document.getElementById('hobby2').innerText = yearInfo.year2.hobby || "趣味情報なし";
                    document.getElementById('memory2').innerText = yearInfo.year2.memory || "思い出情報なし";
                }

                // 3年生の情報表示
                if (yearInfo.year3) {
                    document.getElementById('class3').innerText = yearInfo.year3.class || "クラス情報なし";
                    document.getElementById('committee3').innerText = yearInfo.year3.committee || "委員会情報なし";
                    document.getElementById('project3').innerText = yearInfo.year3.project || "独自プロジェクト情報なし";
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