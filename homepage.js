



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


//fire wall を新規設置
//back dooreの削除を確認


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




// //save back-ground image to firebase
// async function uploadBackgroundImage(widgetId, file) {
//     const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
//     if (!loggedInUserId) {
//         console.error("ログインユーザーIDが見つかりません");
//         return null;
//     }

//     const storageRef = ref(storage, `widget-backgrounds/${loggedInUserId}/${widgetId}`);

//     try {
//         const snapshot = await uploadBytes(storageRef, file);
//         const downloadURL = await getDownloadURL(snapshot.ref);
//         return downloadURL;
//     } catch (error) {
//         console.error("Error uploading background image:", error);
//         return null;
//     }
// }

// Upload background image to Firebase Storage
async function uploadWidgetBackgroundImage(widgetId, file) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return null;
    }

    const storageRef = ref(storage, `widget-backgrounds/${loggedInUserId}/${widgetId}`);

    try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading background image:", error);
        return null;
    }
}




///////////////////////////////////////
///////////////////////////////////////
////////////////////////////////////////
//////////////////////////////////
// Save widget customization data under users/{userid}/widgets/{widgetId}
async function storeWidgetData(widgetId, fontColor, backgroundColor, fontSize, fontFamily, bgImageURL) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    try {
        await setDoc(doc(db, "users", loggedInUserId, "widgetsCustomize", widgetId), {
            fontColor: fontColor,
            backgroundColor: backgroundColor,
            fontSize: fontSize,
            fontFamily: fontFamily,
            bgImageURL: bgImageURL // 画像URLを保存
        });
        console.log(`Widget ${widgetId} のデータがユーザー ${loggedInUserId} に保存されました。`);
    } catch (error) {
        console.error("ウィジェットデータの保存エラー:", error);
    }
}


// Fetch widget customization data from users/{userid}/widgets/{widgetId}
async function fetchWidgetData(widgetId) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return null;
    }

    const docRef = doc(db, "users", loggedInUserId, "widgetsCustomize", widgetId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("そのようなドキュメントは存在しません");
        return null;
    }
}


// Apply customization including background image to the widget
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

// Add event listener for customization save buttons
document.addEventListener('DOMContentLoaded', function () {
    initializeWidgetsForUser('someUserId');
});

// setupCustomization 関数内
function setupCustomization(widgetId, widget) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const fontColorInput = document.getElementById(`font-color-${widgetId}`);
    const backgroundColorInput = document.getElementById(`background-color-${widgetId}`);
    const fontSizeInput = document.getElementById(`font-size-${widgetId}`);
    const fontFamilyInput = document.getElementById(`font-family-${widgetId}`);
    const bgImageUpload = document.getElementById(`bg-image-upload-${widgetId}`);

 


}


// Load and apply widget customization for a specific user
function initializeWidgetsForUser() {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const widget1 = document.getElementById('widget1');
    const widget2 = document.getElementById('widget2');
    const widget3 = document.getElementById('widget3');

    // widget1のカスタマイズをロードして適用
    fetchWidgetData('widget1').then(data => {
        if (data) {
            applyWidgetCustomization(widget1, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });

    // widget2のカスタマイズをロードして適用
    fetchWidgetData('widget2').then(data => {
        if (data) {
            applyWidgetCustomization(widget2, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });

    // widget3のカスタマイズをロードして適用
    fetchWidgetData('widget3').then(data => {
        if (data) {
            applyWidgetCustomization(widget3, data.fontColor, data.backgroundColor, data.fontSize, data.fontFamily, data.bgImageURL);
        }
    });

    // それぞれのウィジェットにカスタマイズ機能を設定
    setupCustomization('widget1', widget1);
    setupCustomization('widget2', widget2);
    setupCustomization('widget3', widget3);
}



// Call this function to initialize widgets for a specific user
//initializeWidgetsForUser('someUserId');


// Save customization data


// Load and apply customizations
function loadCustomization(userData) {
    if (userData.Widget1customization) {
        applyCustomization(userData.Widget1customization);
    }
}

function applyCustomization(Widget1customization) {
    let dynamicStyles = document.getElementById('dynamicStyles');

    // dynamicStyles がまだ存在しない場合は、新しく作成する
    if (!dynamicStyles) {
        dynamicStyles = document.createElement('style');
        dynamicStyles.id = 'dynamicStyles';
        document.head.appendChild(dynamicStyles);
    }

    let styleString = dynamicStyles.innerHTML || '';

    // 既存のスタイルに追加する形でカスタマイズのスタイルを作成
    if (Widget1customization.background) {
        styleString += `#widget1 { background: ${Widget1customization.background}; }`;
    }

    if (Widget1customization.fontSize) {
        styleString += `#widget1 { font-size: ${Widget1customization.fontSize}px; }`;
    }

    if (Widget1customization.fontFamily) {
        styleString += `#widget1 { font-family: ${Widget1customization.fontFamily}; }`;
    }

    if (Widget1customization.fontColor) {
        styleString += `#widget1 { color: ${Widget1customization.fontColor}; }`;
    }

    // 新しいカスタマイズを適用
    dynamicStyles.innerHTML = styleString;
}








//toggleSectionVisibility('customizewidget1Button', 'customizewidget1Section');
//toggleSectionVisibility('customizewidget2Button', 'customizewidget2Section');

// Save Trophy Post

// Load Trophy Posts
async function loadPosts(userId) {
    const poseWidget = document.getElementById('poseWidget');
    poseWidget.innerHTML = '<h3>Your Trophy Posts</h3>'; // Clear previous posts
    const q = query(collection(db, "trophyPosts"), where("userId", "==", uid), where("status", "==", "true"));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');
        postElement.innerHTML = `
            <h4>${post.title} <span>${post.date}</span> <button class="toggleContent">+</button></h4>
            <div class="post-content" style="display: none;">${post.content || ''}</div>
            ${post.imageUrl ? `<img class="post-img" src="${post.imageUrl}" alt="Post Image" style="max-width: 100%; display: none;">` : ''}
            <span class="tag" style="color: ${post.TagColor};">${post.tagText}</span>
            ${post.status === undefined ? '申請前' : post.status === false ? '申請差し戻し' : '承認済み'}
        `;
        poseWidget.appendChild(postElement);

        // Toggle post content visibilityclass
        const toggleButton = postElement.querySelector('.toggleContent');
        const content = postElement.querySelector('.post-content');
        const postImage = postElement.querySelector('.post-img');

        toggleButton.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
            postImage.style.display = postImage.style.display === 'none' ? 'block' : 'none';
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    await loadPosts(loggedInUserId);
});

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





//MARK-ここからcardコーナー
// ウィジェットのデータをユーザーごとにFirestoreに保存する関数
async function saveWidgetData(userId, widgetId, left, top, width, height) {
    try {
        const screenWidth = 1000;
        const scaleFactor = screenWidth / window.innerWidth;

        const scaledLeft = Math.round(left * scaleFactor);
        const scaledTop = Math.round(top * scaleFactor);
        const scaledWidth = Math.round(width * scaleFactor);
        const scaledHeight = Math.round(height * scaleFactor);   
        const widgetRef = doc(db, "users", userId, "widgets", widgetId);
        await setDoc(widgetRef, {
            left: scaledLeft,
            top: scaledTop,
            width: scaledWidth,
            height: scaledHeight
        });
        console.log(`Widget ${widgetId} data saved for user ${userId}.`);
    } catch (error) {
        console.error("Error saving widget data:", error);
    }
}

// Firestoreからユーザーごとのウィジェットのデータを取得する関数
async function loadWidgetData(userId, widgetId) {
    const widgetRef = doc(db, "users", userId, "widgets", widgetId);
    const docSnap = await getDoc(widgetRef);

    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document for widget!");
        return null;
    }
}

// ウィジェットのドラッグとサイズ変更を可能にする関数
function makeDraggable(widget, infoElement, moveButton) {
    $(widget).resizable({ disabled: true }).draggable({ 
        disabled: true,
        containment: [ ($(window).width()) / 18 , ($(window).height()) / 6, ($(window).width() - widget.offsetWidth) / 1.4 ] // ドラッグ可能な範囲を指定
    });
    moveButton.addEventListener('click', function () {
        if (moveButton.textContent === "動かす") {
            $(widget).resizable("enable").draggable("enable");
            moveButton.textContent = "保存";
        } else {
            $(widget).resizable("disable").draggable("disable");
            moveButton.textContent = "動かす";

            const left = widget.style.left;
            const top = widget.style.top;
            const width = widget.offsetWidth;
            const height = widget.offsetHeight;

            // Firestoreに位置とサイズを保存
            const loggedInUserId = localStorage.getItem('loggedInUserId');
            if (loggedInUserId) {
                saveWidgetData(loggedInUserId, widget.id, Math.round(parseFloat(left)), Math.round(parseFloat(top)), width, height);
            }
        }
    });

    // 初期位置とサイズをロード
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        loadWidgetData(loggedInUserId, widget.id).then(data => {
            if (data) {
                const scaleFactor = window.innerWidth / 1000;
                widget.style.left = `${data.left * scaleFactor}px`;
                widget.style.top = `${data.top * scaleFactor}px`;
                widget.style.width = `${data.width * scaleFactor}px`;
                widget.style.height = `${data.height * scaleFactor}px`;
                widget.style.position = 'absolute';

                infoElement.textContent = `Position: X = ${data.left * scaleFactor}, Y = ${data.top * scaleFactor} | Size: W = ${data.width * scaleFactor}px, H = ${data.height * scaleFactor}px`;
            }
        });
    }
}

// すべてのウィジェットにドラッグ機能を適用
makeDraggable(document.getElementById('widget1'), document.getElementById('info-widget1'), document.getElementById('move-button-widget1'));
makeDraggable(document.getElementById('widget2'), document.getElementById('info-widget2'), document.getElementById('move-button-widget2'));
makeDraggable(document.getElementById('widget3'), document.getElementById('info-widget3'), document.getElementById('move-button-widget3'));







// Load user data and apply customization on page load
onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
               
                    // Update Widget 1 with user information
                    document.getElementById('loggedUserFNameInWidget').innerText = userData.firstName;
                    document.getElementById('loggedUserFNameInWidget2').innerText = userData.firstName;
                    document.getElementById('loggedUserLNameInWidget1').innerText = userData.lastName;
                    document.getElementById('loggedUserLNameInWidget').innerText = userData.lastName;
                    document.getElementById('loggedUserEmail').innerText = userData.email;

                    document.getElementById('loggedUserEmailInWidget').innerText = userData.email;

                    loadCustomization(userData); // Load and apply customization
                    loadPosts(loggedInUserId); // Load posts after saving
                    initializeWidgetsForUser(); // 全てのウィジェットのカスタマイズを適用
                    // 

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





document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    loadYearInfo(loggedInUserId);  // ユーザー情報を読み込む
});

function loadYearInfo(loggedInUserId) {
    const userRef = doc(db, "users", loggedInUserId);
    getDoc(userRef)
        .then((docSnap) => {
            if (docSnap.exists()) {
                const yearInfo = docSnap.data().info || {};

                // 1年生の情報表示
                if (yearInfo.year1) {
                    document.getElementById('class1').innerText = (yearInfo.year1.class || "クラス情報なし");
                    document.getElementById('committee1').innerText = (yearInfo.year1.committee || "部活・委員会情報なし");
                    document.getElementById('project1').innerText = (yearInfo.year1.project || "プロジェクト情報なし");
                    document.getElementById('hobby1').innerText =  (yearInfo.year1.hobby || "趣味情報なし");
                    document.getElementById('memory1').innerText = (yearInfo.year1.memory || "思い出情報なし");
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







const teacherControlMenu = document.getElementById("teacherControlMenu");

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const email = user.email;
        
        // メールアドレスのドメインチェック
        if (email.endsWith("@staff.bunri-s.ed.jp")) {
            teacherControlMenu.style.display = "block";
            return;
        }

        // Firestore から StudentID を取得
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().studentID === "z2025PT-bunri-az4kgr-t") {
            teacherControlMenu.style.display = "block";
        }
    }
});


document.addEventListener("DOMContentLoaded", function () {
    const homeLink = document.querySelector('nav.menu ul li a[href="homepage.html"]');

    if (homeLink && window.innerWidth <= 768) {
        homeLink.setAttribute("href", "homepageForPhone.html");
    }
});