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
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
    alert("プロフィール画像が正常に更新されました！");

});
document.getElementById('save-class').addEventListener('click', async function () {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
     alert("クラス情報が適切に更新されました！");
    // 最新の学年とクラスを表示
    displayLatestClass(classData);
    displayCurrentClass(classData)});


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
    document.getElementById('latest-class2').textContent = latestClass;
}

function displayCurrentClass(classData) {
    let CurrentClass = "";
    if (classData.year3) {
        CurrentClass = `${classData.year3}`;
    } else if (classData.year2) {
        CurrentClass = `${classData.year2}`;
    } else if (classData.year1) {
        CurrentClass = `${classData.year1}`;
    }
    document.getElementById('loggedUserCurrentClass').textContent = CurrentClass;
}


async function loadUserData() {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
            displayCurrentClass(data.classData);
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
//     const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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




async function fetchWidgetDataedit(widgetId) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return null;
    }

    const widgetRef = doc(db, "users", loggedInUserId, "widgetsCustomize", widgetId);
    const docSnap = await getDoc(widgetRef);

    if (docSnap.exists()) {
        return docSnap.data(); // 取得したデータを返す
    } else {
        console.log("カスタマイズデータが見つかりません");
        return null;
    }
}

// 取得したデータを反映する関数
async function loadCustomizationedit(widgetId) {
    const widgetData = await fetchWidgetDataedit(widgetId);
    if (!widgetData) return;

    // フォーム要素に値をセット
    document.getElementById(`font-color-${widgetId}`).value = widgetData.fontColor || "#000000";
    document.getElementById(`background-color-${widgetId}`).value = widgetData.backgroundColor || "#ffffff";
    document.getElementById(`font-size-${widgetId}`).value = widgetData.fontSize || 16;
    document.getElementById(`font-family-${widgetId}`).value = widgetData.fontFamily || "Arial";

    // 背景画像があればプレビュー表示
    if (widgetData.bgImageURL) {
        const bgPreview = document.getElementById(`bg-preview-${widgetId}`);
        bgPreview.src = widgetData.bgImageURL;
        bgPreview.style.display = "block";
    }
}

// 初期化時にカスタマイズデータを反映
document.addEventListener('DOMContentLoaded', () => {
    loadCustomizationedit("widget1");
    loadCustomizationedit("widget2");
    loadCustomizationedit("widget3");
});



///////////////////////////////////////
///////////////////////////////////////
////////////////////////////////////////
//////////////////////////////////
// Save widget customization data under users/{userid}/widgets/{widgetId}
async function storeWidgetData(widgetId, fontColor, backgroundColor, fontSize, fontFamily, bgImageURL) {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    const fontColorInput = document.getElementById(`font-color-${widgetId}`);
    const backgroundColorInput = document.getElementById(`background-color-${widgetId}`);
    const fontSizeInput = document.getElementById(`font-size-${widgetId}`);
    const fontFamilyInput = document.getElementById(`font-family-${widgetId}`);
    const bgImageUpload = document.getElementById(`bg-image-upload-${widgetId}`);
    const saveButton = document.getElementById(`save-customization-${widgetId}`);

    if (!saveButton) {
        console.error(`ID 'save-customization-${widgetId}' のボタンが見つかりません`);
        return;
    }

    saveButton.addEventListener('click', async function () {
        const fontColor = fontColorInput.value;
        const backgroundColor = backgroundColorInput.value;
        const fontSize = fontSizeInput.value;
        const fontFamily = fontFamilyInput.value;

        let bgImageURL = null;
        if (bgImageUpload.files.length > 0) {
            // ファイルがアップロードされた場合、Firebase Storageに保存
            bgImageURL = await uploadWidgetBackgroundImage(widgetId, bgImageUpload.files[0]);
        }

        applyWidgetCustomization(widget, fontColor, backgroundColor, fontSize, fontFamily, bgImageURL);

        // カスタマイズの保存（Firebaseに保存）
        try {
            await setDoc(doc(db, "users", loggedInUserId, "widgetsCustomize", widgetId), {
                fontColor: fontColor,
                backgroundColor: backgroundColor,
                fontSize: fontSize,
                fontFamily: fontFamily,
                bgImageURL: bgImageURL // 画像URLを保存
            }, { merge: true });
            console.log(`Widget ${widgetId} のデータがユーザー ${loggedInUserId} に保存されました。`);
        } catch (error) {
            console.error("ウィジェットデータの保存エラー:", error);
        }
    });
}


// Load and apply widget customization for a specific user
function initializeWidgetsForUser() {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDが見つかりません
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


// Save Profile Changes
const saveButton = document.getElementById('saveChanges');
saveButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // Ensure user ID is fetched correctly
    const newFirstName = document.getElementById('newFirstName').value.trim(); // Fetch and trim input values
    const newLastName = document.getElementById('newLastName').value.trim();
    const newEmail = document.getElementById('newEmail').value.trim();


    if (!loggedInUserId) {
        alert("ユーザーIDがありません。再度、ログインしてください。");
        return;
    }

    if (!newFirstName && !newLastName && !newEmail) {
        alert("有効な姓または名を入力してください。");
        return;
    }

    const updates = {};
    if (newFirstName) {
        updates.firstName = newFirstName; // Only include changes if a new value is provided
    }
    if (newLastName) {
        updates.lastName = newLastName;
    }
    if (newEmail) {
        updates.email = newEmail;
    }

    try {
        const userRef = doc(db, "users", loggedInUserId); // Firestore document reference
        await updateDoc(userRef, updates); // Update Firestore document
        alert("プロフィールが正常に更新されました！");

        // Reload the user data to reflect changes on the page without requiring a full page reload
        document.getElementById('loggedUserFName').innerText = newFirstName || document.getElementById('loggedUserFName').innerText;
        document.getElementById('loggedUserLName').innerText = newLastName || document.getElementById('loggedUserLName').innerText;
        document.getElementById('loggedUserEmail').innerText = newEmail || document.getElementById('loggedUserEmail').innerText;

        // Optionally, clear the input fields after successful update
        document.getElementById('newFirstName').value = '';
        document.getElementById('newLastName').value = '';
        document.getElementById('newEmail').value = '';

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("あなたのプロフィール更新の際にエラーが発生いたしました。もう一度お試しください。");
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
//toggleSectionVisibility('customizewidget1Button', 'customizewidget1Section');
//toggleSectionVisibility('customizewidget2Button', 'customizewidget2Section');
// toggleSectionVisibility('createPostButton', 'trophyRoomSection');


// Save Trophy Post
const savePostButton = document.getElementById('savePostButton');
savePostButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const postTitle = document.getElementById('postTitle').value.trim();
    const postDate = document.getElementById('postDate').value.trim();
    const postContent = document.getElementById('postContent').value.trim();
    const postImage = document.getElementById('postImage').files[0];
    const TagColor = document.getElementById('TagColor').value;
    const tagText = document.getElementById('tagText').value.trim();
    const postVisibility = document.getElementById('postVisibility').value;
    const termYear = document.getElementById('loggedUserTermYear').innerText;
    const studentID = document.getElementById('loggedUserStudentID').innerText;
    const currentClass = document.getElementById('loggedUserCurrentClass').innerText;

    // 必須項目のチェック
    if (!loggedInUserId || !postTitle || !postDate || !postContent || !postVisibility) {
        alert("すべての必須項目を入力してください。");
        return;
    }

    let imageUrl = null;

    if (postImage) {
        try {
            const storageRef = ref(storage, `trophyPosts/${loggedInUserId}/${postImage.name}`);
            const snapshot = await uploadBytes(storageRef, postImage);
            imageUrl = await getDownloadURL(snapshot.ref);
        } catch (error) {
            console.error("画像のアップロードに失敗しました:", error);
            alert("画像のアップロードに失敗しました。もう一度お試しください。");
            return;
        }
    }

    const postData = {
        title: postTitle,
        date: postDate,
        content: postContent,
        userId: loggedInUserId,
        imageUrl: imageUrl, // Firebase Storage のURLを保存
        TagColor: TagColor,
        tagText: tagText,
        visibility: postVisibility,
        status: false, // 初期状態は false
        termYear: termYear,
        studentID: studentID,
        currentClass: currentClass
    };

    try {
        await addDoc(collection(db, "trophyPosts"), postData);
        alert("投稿が保存されました！");
        setTimeout(() => location.reload(), 0); // アラートが閉じられたら画面を更新
    } catch (error) {
        console.error("投稿の保存に失敗しました:", error);
        alert("投稿の保存に失敗しました。もう一度お試しください。");
    }
});




async function loadPosts(userId) {
    const poseWidget = document.getElementById('poseWidget');
    poseWidget.innerHTML = '<h3>Your Trophy Posts</h3>'; // Clear previous posts
    const q = query(collection(db, "trophyPosts"), where("userId", "==", userId), where("status", "==", "true"));
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



// // Load Trophy Posts
// async function loadPosts(userId) {
//     const poseWidget = document.getElementById('poseWidget');
//     poseWidget.innerHTML = '<h3>Your Trophy Posts</h3>'; // Clear previous posts
//     const q = query(collection(db, "trophyPosts"), where("userId", "==", userId));
//     const querySnapshot = await getDocs(q);

//     querySnapshot.forEach((doc) => {
//         const post = doc.data();
//         const postElement = document.createElement('div');
//         postElement.classList.add('post');
//         postElement.innerHTML = `
//             <h4>${post.title} <span>${post.date}</span> <button class="toggleContent">+</button></h4>
//             <span class="tag" style="color: ${post.TagColor};">${post.tagText}</span>
//             <span class="status">${post.status ? '認証済み' : '認証前'}</span>
//             <div class="post-content">${post.content || ''}</div>
//             <select class="visibility-select" data-post-id="${doc.id}">
//                 <option value="public" ${post.visibility === 'public' ? 'selected' : ''}>公開</option>
//                 <option value="friends" ${post.visibility === 'friends' ? 'selected' : ''}>学校関係者のみ</option>
//                 <option value="private" ${post.visibility === 'private' ? 'selected' : ''}>非公開</option>
//             </select>
//         `;
//         if (post.imageUrl) {
//             postElement.innerHTML += `<img src="${post.imageUrl}" alt="Post Image" style="max-width: 100%;">`;
//         }
//         poseWidget.appendChild(postElement);

//         // Toggle post content visibility
//         const toggleButton = postElement.querySelector('.toggleContent');
//         const content = postElement.querySelector('.post-content');
//         toggleButton.addEventListener('click', () => {
//             if (content.style.display === '' || content.style.display === 'none') {
//                 content.style.display = 'block';
//             } else {
//                 content.style.display = 'none';
//             }
//         });

//         // Add event listener for visibility change
//         const visibilitySelect = postElement.querySelector('.visibility-select');
//         visibilitySelect.addEventListener('change', async (event) => {
//             const newVisibility = event.target.value;
//             const postId = event.target.getAttribute('data-post-id');
//             await editPostVisibility(postId, newVisibility);
//             alert("公開範囲が更新されました！");

//         });

//         async function editPostVisibility(postId, newVisibility) {
//             try {
//                 const postRef = doc(db, "trophyPosts", postId);
//                 await updateDoc(postRef, { visibility: newVisibility });
//                 console.log(`Post ${postId} visibility updated to ${newVisibility}`);
//             } catch (error) {
//                 console.error("Error updating post visibility:", error);
//             }
//         }
        
//     });
// }



// document.addEventListener('DOMContentLoaded', async () => {
//     const loggedInUserId = localStorage.getItem('loggedInUserId');
//     await loadPosts(loggedInUserId);
// });

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
// async function saveWidgetData(userId, widgetId, left, top, width, height) {
//     try 
//         const widgetRef = doc(db, "users", userId, "widgets", widgetId);
//         await setDoc(widgetRef, {
//             left: left,
//             top: top,
//             width: width,
//             height: height
//         });
//         console.log(`Widget ${widgetId} data saved for user ${userId}.`);
//     } catch (error) {
//         console.error("Error saving widget data:", error);
//     }
// }

// // Firestoreからユーザーごとのウィジェットのデータを取得する関数
// async function loadWidgetData(userId, widgetId) {
//     const widgetRef = doc(db, "users", userId, "widgets", widgetId);
//     const docSnap = await getDoc(widgetRef);

//     if (docSnap.exists()) {
//         return docSnap.data();
//     } else {
//         console.log("No such document for widget!");
//         return null;
//     }
// }

// // ウィジェットのドラッグとサイズ変更を可能にする関数
// function makeDraggable(widget, infoElement, moveButton) {
//     $(widget).resizable({ disabled: true }).draggable({ 
//         disabled: true,
//         containment: [ ($(window).width()) / 18 , ($(window).height()) / 6, ($(window).width() - widget.offsetWidth) / 1.4 ] // ドラッグ可能な範囲を指定
//     });
//     moveButton.addEventListener('click', function () {
//         if (moveButton.textContent === "動かす") {
//             $(widget).resizable("enable").draggable("enable");
//             moveButton.textContent = "保存";
//         } else {
//             $(widget).resizable("disable").draggable("disable");
//             moveButton.textContent = "動かす";

//             const left = widget.style.left;
//             const top = widget.style.top;
//             const width = widget.offsetWidth;
//             const height = widget.offsetHeight;

//             // Firestoreに位置とサイズを保存
//             const loggedInUserId = localStorage.getItem('loggedInUserId');
//             if (loggedInUserId) {
//                 saveWidgetData(loggedInUserId, widget.id, Math.round(parseFloat(left)), Math.round(parseFloat(top)), width, height);
//             }
//         }
//     });

//     // 初期位置とサイズをロード
//     const loggedInUserId = localStorage.getItem('loggedInUserId');
//     if (loggedInUserId) {
//         loadWidgetData(loggedInUserId, widget.id).then(data => {
//             if (data) {
//                 widget.style.left = `${data.left}px`;
//                 widget.style.top = `${data.top}px`;
//                 widget.style.width = `${data.width}px`;
//                 widget.style.height = `${data.height}px`;
//                 widget.style.position = 'absolute';

//                 infoElement.textContent = `Position: X = ${data.left}, Y = ${data.top} | Size: W = ${data.width}px, H = ${data.height}px`;
//             }
//         });
//     }
// }

// // すべてのウィジェットにドラッグ機能を適用
// makeDraggable(document.getElementById('widget1'), document.getElementById('info-widget1'), document.getElementById('move-button-widget1'));
// makeDraggable(document.getElementById('widget2'), document.getElementById('info-widget2'), document.getElementById('move-button-widget2'));
// makeDraggable(document.getElementById('widget3'), document.getElementById('info-widget3'), document.getElementById('move-button-widget3'));







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





document.addEventListener('DOMContentLoaded', () => {
    // 学年の編集フォームを表示する関数
    function editYearInfo(year) {
        document.getElementById(`class${year.charAt(4)}`).style.display = 'none';
        document.getElementById(`committee${year.charAt(4)}`).style.display = 'none';
        document.getElementById(`project${year.charAt(4)}`).style.display = 'none';
        document.getElementById(`hobby${year.charAt(4)}`).style.display = 'none';
        document.getElementById(`memory${year.charAt(4)}`).style.display = 'none';

        document.getElementById(`edit-class${year.charAt(4)}`).value = document.getElementById(`class${year.charAt(4)}`).innerText;
        document.getElementById(`edit-class${year.charAt(4)}`).style.display = 'block';

        document.getElementById(`edit-committee${year.charAt(4)}`).value = document.getElementById(`committee${year.charAt(4)}`).innerText;
        document.getElementById(`edit-committee${year.charAt(4)}`).style.display = 'block';

        document.getElementById(`edit-project${year.charAt(4)}`).value = document.getElementById(`project${year.charAt(4)}`).innerText;
        document.getElementById(`edit-project${year.charAt(4)}`).style.display = 'block';

        document.getElementById(`edit-hobby${year.charAt(4)}`).value = document.getElementById(`hobby${year.charAt(4)}`).innerText;
        document.getElementById(`edit-hobby${year.charAt(4)}`).style.display = 'block';

        document.getElementById(`edit-memory${year.charAt(4)}`).value = document.getElementById(`memory${year.charAt(4)}`).innerText;
        document.getElementById(`edit-memory${year.charAt(4)}`).style.display = 'block';

        document.getElementById(`save-button${year.charAt(4)}`).style.display = 'block';

        document.querySelector(`button[onclick="editYearInfo('${year}')"]`).style.display = 'none';
        document.getElementById(`edit-year${year.charAt(4)}`).style.display = 'block';

    }
    // editYearInfo 関数を window オブジェクトに追加
    window.editYearInfo = editYearInfo;

    // 情報を保存する関数
    function saveYearInfo(year) {
        const classValue = document.getElementById(`edit-class${year.charAt(4)}`).value;
        const committeeValue = document.getElementById(`edit-committee${year.charAt(4)}`).value;
        const projectValue = document.getElementById(`edit-project${year.charAt(4)}`).value;
        const hobbyValue = document.getElementById(`edit-hobby${year.charAt(4)}`).value;
        const memoryValue = document.getElementById(`edit-memory${year.charAt(4)}`).value;

        const updatedData = {
            class: classValue || "クラス情報なし",
            committee: committeeValue || "部活・委員会情報なし",
            project: projectValue || "プロジェクト情報なし",
            hobby: hobbyValue || "趣味情報なし",
            memory: memoryValue || "思い出情報なし"
        };

        const loggedInUserId = localStorage.getItem('loggedInUserId');
        const userRef = doc(db, "users", loggedInUserId);

        updateDoc(userRef, {
            [`info.${year}`]: updatedData
        })
            .then(() => {
                console.log(`${year}のデータが更新されました`);
                // 表示を更新
                document.getElementById(`class${year.charAt(4)}`).innerText = updatedData.class;
                document.getElementById(`committee${year.charAt(4)}`).innerText = updatedData.committee;
                document.getElementById(`project${year.charAt(4)}`).innerText = updatedData.project;
                document.getElementById(`hobby${year.charAt(4)}`).innerText = updatedData.hobby;
                document.getElementById(`memory${year.charAt(4)}`).innerText = updatedData.memory;

                // 編集フィールドを非表示に
                document.getElementById(`edit-class${year.charAt(4)}`).style.display = 'none';
                document.getElementById(`edit-committee${year.charAt(4)}`).style.display = 'none';
                document.getElementById(`edit-project${year.charAt(4)}`).style.display = 'none';
                document.getElementById(`edit-hobby${year.charAt(4)}`).style.display = 'none';
                document.getElementById(`edit-memory${year.charAt(4)}`).style.display = 'none';

                // 保存ボタンを非表示に
                document.getElementById(`save-button${year.charAt(4)}`).style.display = 'none';

                document.querySelector(`button[onclick="editYearInfo('${year}')"]`).style.display = 'block';


                // 表示部分を再表示
                document.getElementById(`class${year.charAt(4)}`).style.display = 'inline';
                document.getElementById(`committee${year.charAt(4)}`).style.display = 'inline';
                document.getElementById(`project${year.charAt(4)}`).style.display = 'inline';
                document.getElementById(`hobby${year.charAt(4)}`).style.display = 'inline';
                document.getElementById(`memory${year.charAt(4)}`).style.display = 'inline';
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
    }

    // saveYearInfo 関数も window オブジェクトに追加
    window.saveYearInfo = saveYearInfo;
});

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');// 実際のユーザーIDに置き換えてください
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
                    document.getElementById('class1').innerText =  (yearInfo.year1.class || "クラス情報なし");
                    document.getElementById('committee1').innerText =  (yearInfo.year1.committee || "部活・委員会情報なし");
                    document.getElementById('project1').innerText =  (yearInfo.year1.project || "プロジェクト情報なし");
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


function saveYearInfo(year) {
    const classValue = document.getElementById(`edit-class${year.charAt(4)}`).value;
    const committeeValue = document.getElementById(`edit-committee${year.charAt(4)}`).value;
    const projectValue = document.getElementById(`edit-project${year.charAt(4)}`).value;
    const hobbyValue = document.getElementById(`edit-hobby${year.charAt(4)}`).value;
    const memoryValue = document.getElementById(`edit-memory${year.charAt(4)}`).value;

    const updatedData = {
        class: classValue || "非公開または情報なし",
        committee: committeeValue || "非公開または情報なし",
        project: projectValue || "非公開または情報なし",
        hobby: hobbyValue || "非公開または情報なし",
        memory: memoryValue || "非公開または情報なし"
    };

    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const userRef = doc(db, "users", loggedInUserId);

    updateDoc(userRef, {
        [`info.${year}`]: updatedData
    })
        .then(() => {
            console.log(`${year}のデータが更新されました`);
            // 表示を更新
            document.getElementById(`class${year.charAt(4)}`).innerText = updatedData.class;
            document.getElementById(`committee${year.charAt(4)}`).innerText = updatedData.committee;
            document.getElementById(`project${year.charAt(4)}`).innerText = updatedData.project;
            document.getElementById(`hobby${year.charAt(4)}`).innerText = updatedData.hobby;
            document.getElementById(`memory${year.charAt(4)}`).innerText = updatedData.memory;
            document.getElementById(`edit-year${year.charAt(4)}`).style.display = 'none';
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
        });
}

// saveYearInfo 関数も window オブジェクトに追加
window.saveYearInfo = saveYearInfo;

document.addEventListener('DOMContentLoaded', () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    loadYearInfo(loggedInUserId);
});









document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".widget").forEach(widget => {
        const widgetId = widget.id;  // 例: widget1, widget2, widget3
        const fontColorPicker = document.getElementById(`font-color-${widgetId}`);
        const bgColorPicker = document.getElementById(`background-color-${widgetId}`);
        const fontSizeInput = document.getElementById(`font-size-${widgetId}`);
        const fontFamilySelect = document.getElementById(`font-family-${widgetId}`);
        const saveButton = document.getElementById(`save-customization-${widgetId}`);
        const discardButton = document.getElementById(`discard-customization-${widgetId}`);

        let savedSettings = {};

        function saveCurrentSettings() {
            savedSettings = {
                fontColor: fontColorPicker.value,
                backgroundColor: bgColorPicker.value,
                fontSize: fontSizeInput.value,
                fontFamily: fontFamilySelect.value,
            };
        }

        function applySettings() {
            widget.style.color = fontColorPicker.value;
            widget.style.backgroundColor = bgColorPicker.value;
            widget.style.fontSize = fontSizeInput.value + "px";
            widget.style.fontFamily = fontFamilySelect.value;
        }

        fontColorPicker.addEventListener("input", applySettings);
        bgColorPicker.addEventListener("input", applySettings);
        fontSizeInput.addEventListener("input", applySettings);
        fontFamilySelect.addEventListener("change", applySettings);

        saveButton.addEventListener("click", function () {
            saveCurrentSettings();
            alert(`${widgetId} のカスタマイズが保存されました！`);
        });

        discardButton.addEventListener("click", function () {
            location.reload();  // ページをリロードして元に戻す
            alert(`${widgetId} の変更を破棄しました！`);
        });

        saveCurrentSettings(); // 初回の設定保存
    });
});





async function editPostVisibility(postId, newVisibility) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (!loggedInUserId) {
        console.error("ログインユーザーIDが見つかりません");
        return;
    }

    try {
        const postRef = doc(db, "trophyPosts", postId);
        await updateDoc(postRef, { visibility: newVisibility });
        alert("投稿の公開設定が正常に変更されました！");
    } catch (error) {
        console.error("Error updating post visibility:", error);
    }
}

// Load Trophy Posts with edit option
async function loadEditablePosts(userId) {
    const posteditvisibility = document.getElementById('posteditvisibility');
    posteditvisibility.innerHTML = '<h3>Your Trophy Posts</h3>'; // Clear previous posts
    const q = query(collection(db, "trophyPosts"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((doc) => {
        const post = doc.data();
        const postElement = document.createElement('div');
        postElement.classList.add('post');

        // タイトル、日付、ボタン
        postElement.innerHTML = `
            <h4>
                ${post.title} <span>${post.date}</span>
                <button class="toggleContent">+</button>
            </h4>
            <div class="post-content" style="display: none;">
                <p>${post.content || ''}</p>
                ${post.imageUrl ? `<img src="${post.imageUrl}" alt="Post Image" style="max-width: 100%;">` : ''}
            </div>
            <span class="tag" style="color: ${post.TagColor};">${post.tagText}</span>
            <span class="status">${post.status ? '認証済み' : '認証前'}</span>
            <select class="visibility-select" data-post-id="${doc.id}">
                <option value="public" ${post.visibility === 'public' ? 'selected' : ''}>公開</option>
                <option value="friends" ${post.visibility === 'friends' ? 'selected' : ''}>学校関係者のみ</option>
                <option value="private" ${post.visibility === 'private' ? 'selected' : ''}>非公開</option>
            </select>
        `;

        posteditvisibility.appendChild(postElement);

        // 「+」ボタンでコンテンツと画像を表示・非表示
        const toggleButton = postElement.querySelector('.toggleContent');
        const content = postElement.querySelector('.post-content');
        toggleButton.addEventListener('click', () => {
            content.style.display = content.style.display === 'none' ? 'block' : 'none';
        });

        // 公開範囲変更イベント
        const visibilitySelect = postElement.querySelector('.visibility-select');
        visibilitySelect.addEventListener('change', async (event) => {
            const newVisibility = event.target.value;
            const postId = event.target.getAttribute('data-post-id');
            await editPostVisibility(postId, newVisibility);
        });
    });
}
document.addEventListener('DOMContentLoaded', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    await loadEditablePosts(loggedInUserId);
});


//latestclass
document.getElementById('save-TermYearAndStudentID').addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const termYear = document.getElementById('TremYear').value.trim();
    const studentID = document.getElementById('StudentID').value.trim();

    if (!loggedInUserId) {
        alert("ユーザーIDが見つかりません。再度ログインしてください。");
        return;
    }

    if (!termYear || !studentID) {
        alert("学年(期生)と学籍番号をどちらも入力してください。");
        return;
    }

    try {
        const userRef = doc(db, "users", loggedInUserId);
        await updateDoc(userRef, {
            termYear: termYear,
            studentID: studentID
        });
        alert("学年(期生)と学籍番号が保存されました！");
    } catch (error) {
        console.error("学年(期生)と学籍番号の保存に伴うエラー:", error);
        alert("データ保存の際にエラーが発生しました。もう一度お試しください。");
    }
});

// Display Term Year and Student ID
onAuthStateChanged(auth, (user) => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        const docRef = doc(db, "users", loggedInUserId);
        getDoc(docRef)
            .then((docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('loggedUserStudentID').innerText = userData.studentID || "情報なし";
                    document.getElementById('loggedUserTermYear').innerText = userData.termYear || "情報なし";
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