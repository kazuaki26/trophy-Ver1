import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore,  setDoc, getDoc, doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";
import{getStorage, ref, uploadBytes, getDownloadURL} from "https://www.gstatic.com/firebasejs/10.11.1/firebase-storage.js"

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



 // カスタマイズボタンを押したらカスタマイズオプションを表示
 document.getElementById('customize-button-widget1').addEventListener('click', function() {
    var customizationOptions = document.getElementById('customization-options-widget1');
    if (customizationOptions.style.display === 'none') {
        customizationOptions.style.display = 'block';
    } else {
        customizationOptions.style.display = 'none';
    }
});
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
document.getElementById('save-class').addEventListener('click', async function () {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログイン中のユーザーIDを取得
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

    // 最新の学年とクラスを表示
    displayLatestClass(classData);
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
    const saveButton = document.getElementById(`save-customization-${widgetId}`);

    if (!saveButton) {
        console.error(`ID 'save-customization-${widgetId}' のボタンが見つかりません`);
        return;
    }

    saveButton.addEventListener('click', async function() {
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
        storeWidgetData(widgetId, fontColor, backgroundColor, fontSize, fontFamily, bgImageURL);
    });
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

    // それぞれのウィジェットにカスタマイズ機能を設定
    setupCustomization('widget1', widget1);
    setupCustomization('widget2', widget2);
}



// Call this function to initialize widgets for a specific user
//initializeWidgetsForUser('someUserId');


// Save Profile Changes
const saveButton = document.getElementById('saveChanges');
saveButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // Ensure user ID is fetched correctly
    const newFirstName = document.getElementById('newFirstName').value.trim(); // Fetch and trim input values
    const newLastName = document.getElementById('newLastName').value.trim();

    if (!loggedInUserId) {
        alert("User ID not found. Please log in again.");
        return;
    }

    if (!newFirstName && !newLastName) {
        alert("Please enter a valid first or last name.");
        return;
    }

    const updates = {};
    if (newFirstName) {
        updates.firstName = newFirstName; // Only include changes if a new value is provided
    }
    if (newLastName) {
        updates.lastName = newLastName;
    }

    try {
        const userRef = doc(db, "users", loggedInUserId); // Firestore document reference
        await updateDoc(userRef, updates); // Update Firestore document
        alert("Profile updated successfully!");

        // Reload the user data to reflect changes on the page without requiring a full page reload
        document.getElementById('loggedUserFName').innerText = newFirstName || document.getElementById('loggedUserFName').innerText;
        document.getElementById('loggedUserLName').innerText = newLastName || document.getElementById('loggedUserLName').innerText;

        // Optionally, clear the input fields after successful update
        document.getElementById('newFirstName').value = '';
        document.getElementById('newLastName').value = '';
        
    } catch (error) {
        console.error("Error updating profile:", error);
        alert("There was an error updating your profile. Please try again.");
    }
});

// Save customization data
const saveCustomizationwidget1Button = document.getElementById('saveCustomizationwidget1');
saveCustomizationwidget1Button.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const bgInput = document.getElementById('bgInput').value;
    const fontSizeInput = document.getElementById('fontSizeInput').value;
    const fontFamilyInput = document.getElementById('fontFamilyInput').value;
    const fontColorInput = document.getElementById('fontColorInput').value;

    if (loggedInUserId) {
        const customizationData = {
            background: bgInput || null,
            fontSize: fontSizeInput || null,
            fontFamily: fontFamilyInput || null,
            fontColor: fontColorInput || null
        };

        try {
            const userRef = doc(db, "users", loggedInUserId);
            await updateDoc(userRef, { Widget1customization: customizationData });
            alert("Customization saved successfully!");
            applyCustomization(customizationData); // Apply customization immediately after saving
        } catch (error) {
            console.error("Error saving customization:", error);
        }
    } else {
        alert("User not found.");
    }
});

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





// Save customization data for  widget2
// const saveCustomizationwidget2Button = document.getElementById('saveCustomizationwidget2');
// saveCustomizationwidget2Button.addEventListener('click', async () => {
//     const loggedInUserId = localStorage.getItem('loggedInUserId');
//     const bgInput = document.getElementById('bgInput').value;
//     const fontSizeInput = document.getElementById('fontSizeInput').value;
//     const fontFamilyInput = document.getElementById('fontFamilyInput').value;
//     const fontColorInput = document.getElementById('fontColorInput').value;

//     if (loggedInUserId) {
//         const customizationDatawidget2 = {
//             background: bgInput || null,
//             fontSize: fontSizeInput || null,
//             fontFamily: fontFamilyInput || null,
//             fontColor: fontColorInput || null
//         };

//         try {
//             const userRef = doc(db, "users", loggedInUserId);
//             await updateDoc(userRef, { Widget2customization: customizationDatawidget2 });
//             alert("Customization saved successfully!");
//             applyCustomizationwidget2(customizationDatawidget2); // Apply customization immediately after saving
//         } catch (error) {
//             console.error("Error saving customization:", error);
//         }
//     } else {
//         alert("User not found.");
//     }
// });

// // Load and apply customizations
// function loadCustomizationwidget2(userData) {
//     if (userData.Widget2customization) {
//         applyCustomizationwidget2(userData.Widget2customization);
//     }
// }

// function applyCustomizationwidget2(Widget2customization) {
//     let dynamicStyles = document.getElementById('dynamicStyles');

//     // dynamicStyles がまだ存在しない場合は、新しく作成する
//     if (!dynamicStyles) {
//         dynamicStyles = document.createElement('style');
//         dynamicStyles.id = 'dynamicStyles';
//         document.head.appendChild(dynamicStyles);
//     }

//     let styleString = dynamicStyles.innerHTML || '';

//     // 既存のスタイルに追加する形でカスタマイズのスタイルを作成
//     if (Widget2customization.background) {
//         styleString += `#widget2 { background: ${Widget2customization.background}; }`;
//     }

//     if (Widget2customization.fontSize) {
//         styleString += `#widget2 { font-size: ${Widget2customization.fontSize}px; }`;
//     }

//     if (Widget2customization.fontFamily) {
//         styleString += `#widget2 { font-family: ${Widget2customization.fontFamily}; }`;
//     }

//     if (Widget2customization.fontColor) {
//         styleString += `#widget2 { color: ${Widget2customization.fontColor}; }`;
//     }

//     // 新しいカスタマイズを適用
//     dynamicStyles.innerHTML = styleString;
// }



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

// Save Trophy Post
const savePostButton = document.getElementById('savePostButton');
savePostButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const postTitle = document.getElementById('postTitle').value;
    const postDate = document.getElementById('postDate').value;
    const postContent = document.getElementById('postContent').value;
    const postImage = document.getElementById('postImage').files[0];

    if (loggedInUserId && postTitle && postDate) {
        const postData = {
            title: postTitle,
            date: postDate,
            content: postContent,
            userId: loggedInUserId,
            imageUrl: postImage ? URL.createObjectURL(postImage) : null
        };

        try {
            await addDoc(collection(db, "trophyPosts"), postData);
            alert("Post saved successfully!");
            loadPosts(loggedInUserId); // Reload posts after saving
        } catch (error) {
            console.error("Error saving post:", error);
        }
    } else {
        alert("Please fill in the required fields.");
    }
});

// Load Trophy Posts
async function loadPosts(userId) {
    const poseWidget = document.getElementById('poseWidget');
    widget2.poseWidget = '<h3>Your Trophy Posts</h3>'; // Clear previous posts
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
        const widgetRef = doc(db, "users", userId, "widgets", widgetId);
        await setDoc(widgetRef, {
            left: left,
            top: top,
            width: width,
            height: height
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
    let offsetX, offsetY, isDragging = false, isMovable = false;

    moveButton.addEventListener('click', function () {
        if (moveButton.textContent === "動かす") {
            isMovable = true;
            moveButton.textContent = "保存";
            widget.style.resize = "both";  
            widget.style.overflow = "auto";  
            widget.style.position = "absolute"; 
        } else {
            isMovable = false;
            moveButton.textContent = "動かす";
            widget.style.resize = "none";  

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

    widget.addEventListener('mousedown', function (e) {
        if (isMovable) {
            isDragging = true;
            offsetX = e.clientX - widget.getBoundingClientRect().left;
            offsetY = e.clientY - widget.getBoundingClientRect().top;
        }
    });

    document.addEventListener('mousemove', function (e) {
        if (isDragging) {
            const left = e.clientX - offsetX;
            const top = e.clientY - offsetY;
            widget.style.left = `${left}px`;
            widget.style.top = `${top}px`;

            const width = widget.offsetWidth;
            const height = widget.offsetHeight;
            infoElement.textContent = `Position: X = ${Math.round(left)}, Y = ${Math.round(top)} | Size: W = ${width}px, H = ${height}px`;
        }
    });

    document.addEventListener('mouseup', function () {
        isDragging = false;
    });

    // 初期位置とサイズをロード
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    if (loggedInUserId) {
        loadWidgetData(loggedInUserId, widget.id).then(data => {
            if (data) {
                widget.style.left = `${data.left}px`;
                widget.style.top = `${data.top}px`;
                widget.style.width = `${data.width}px`;
                widget.style.height = `${data.height}px`;
                widget.style.position = 'absolute';
                widget.style.resize = 'none';  // 初期状態ではサイズ変更を無効化

                infoElement.textContent = `Position: X = ${data.left}, Y = ${data.top} | Size: W = ${data.width}px, H = ${data.height}px`;
            }
        });
    }
}

// すべてのウィジェットにドラッグ機能を適用
makeDraggable(document.getElementById('widget1'), document.getElementById('info-widget1'), document.getElementById('move-button-widget1'));
makeDraggable(document.getElementById('widget2'), document.getElementById('info-widget2'), document.getElementById('move-button-widget2'));







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
                    document.getElementById('loggedUserLNameInWidget').innerText = userData.lastName;
                    document.getElementById('loggedUserEmailInWidget').innerText = userData.email;

                    loadCustomization(userData); // Load and apply customization
                    //loadCustomizationwidget2(userData);
                    loadPosts(loggedInUserId); // Load posts after saving
                    initializeWidgetsForUser(); // 全てのウィジェットのカスタマイズを適用

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
async function loadReservationsForWeek(startDate, selectedFacility) {
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

    // Firestoreの予約コレクションを参照（施設でフィルタリング）
    const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
    const reservations = reservationsSnapshot.docs
        .map(doc => doc.data())
        .filter(reservation => reservation.facility === selectedFacility); // 選択した施設のみ取得

    // 予約表を1週間分
    const startTime = 8;
    const endTime = 19;

    reservationTable.innerHTML = ''; // テーブルをクリア

    // 時間列を作成
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

  

// 予約フォームの送信ボタンのイベントリスナー
document.getElementById('submitReservation').addEventListener('click', function() {
    const date = document.getElementById('reservationDate').value;
    const time = parseFloat(document.getElementById('reservationTime').value);
    const purpose = document.getElementById('reservationPurpose').value;

    if (!date || !time || !purpose) {
        alert('すべてのフィールドを入力してください。');
        return;
    }

    makeReservation(date, time, purpose);
});

// 特定の日付と時間で予約を作成
async function makeReservation(facility, startDate, startTime, endTime, purpose, contact) {
    const loggedInUserId = localStorage.getItem('loggedInUserId');
    const userName = localStorage.getItem('userName'); // ログインユーザーの名前

    if (!loggedInUserId) {
        alert("ユーザーがログインしていません。");
        return;
    }

    try {
        // 開始時間と終了時間から予約時間を作成
        const reservationTimes = [];
        for (let time = startTime; time <= endTime; time += 0.5) {
            reservationTimes.push(time);
        }

        // Firestoreからすでにある予約を取得
        const reservationsSnapshot = await getDocs(collection(db, 'reservations'));
        const existingReservations = reservationsSnapshot.docs.map(doc => doc.data());

        // 予約時間の重複チェック
        let hasDuplicates = false;
        for (const time of reservationTimes) {
            const isOverlapping = existingReservations.some(
                reservation =>
                    reservation.date === startDate &&
                    reservation.time === time &&
                    reservation.facility === facility && // 施設もチェック
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
                    name: userName,
                    contact: contact, // 連絡先を追加
                    facility: facility, // 施設情報を追加
                    date: startDate, // 日付（YYYY-MM-DD形式）
                    time: time, // 時間
                    purpose: purpose,
                    timestamp: serverTimestamp() // サーバータイムスタンプを使用
                };

                await addDoc(collection(db, 'reservations'), reservationData);
            }

            alert('予約が完了しました！');
            loadReservationsForWeek(new Date(), facility); // 予約後にリロード
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
    const facility = document.getElementById('reservationFacility').value;
    const startTime = parseFloat(document.getElementById('reservationStartTime').value);
    const endTime = parseFloat(document.getElementById('reservationEndTime').value);
    const purpose = document.getElementById('reservationPurpose').value;
    const contact = document.getElementById('reservationContact').value;
  
    makeReservation(startDate, startTime, endTime, purpose, contact), facility;
  });

// 施設選択時にその施設の予約を表示
document.getElementById('facilitySelect').addEventListener('change', () => {
    const selectedFacility = document.getElementById('facilitySelect').value;
    loadReservationsForWeek(new Date(), selectedFacility);
});

// 初期ロード
window.onload = () => {
    const defaultFacility = document.getElementById('facilitySelect').value;
    loadReservationsForWeek(new Date(), defaultFacility);
};

// 施設選択の変更イベント
document.getElementById('facility').addEventListener('change', () => {
    const today = new Date();
    const facility = document.getElementById('facility').value;
    loadReservationsForWeek(today, facility);
});
