import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore,  setDoc, getDoc, doc, updateDoc, addDoc, collection, query, where, getDocs, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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
const saveCustomizationButton = document.getElementById('saveCustomization');
saveCustomizationButton.addEventListener('click', async () => {
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




// Show/Hide sections. add firebase indeed
const toggleSectionVisibility = (buttonId, sectionId) => {
    const button = document.getElementById(buttonId);
    const section = document.getElementById(sectionId);
    button.addEventListener('click', () => {
        section.style.display = section.style.display === 'none' ? 'block' : 'none';
    });
};

toggleSectionVisibility('editButton', 'editSection');
toggleSectionVisibility('customizeButton', 'customizeSection');
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

// 時刻の更新
function updateTime() {
    const timeElement = document.getElementById('time');
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    timeElement.textContent = `${hours}:${minutes}:${seconds}`;
}

// 1秒ごとに時間を更新
setInterval(updateTime, 1000);
window.onload = updateTime;







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
                    loadPosts(loggedInUserId); // Load posts after saving
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








// Save Reservation
const saveReservationButton = document.getElementById('saveReservationButton');
saveReservationButton.addEventListener('click', async () => {
    const loggedInUserId = localStorage.getItem('loggedInUserId'); // ログインしているユーザーのID
    const userName = document.getElementById('userName').value; // ユーザー名
    const userContact = document.getElementById('userContact').value; // 連絡先
    const reservationTime = document.getElementById('reservationTime').value; // 予約時間
    const meetingName = document.getElementById('meetingName').value; // 会議名

    if (loggedInUserId && userName && userContact && reservationTime && meetingName) {
        const reservationData = {
            userId: loggedInUserId,
            userName: userName,
            contact: userContact,
            time: reservationTime,
            meetingName: meetingName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp() // 作成日時
        };

        try {
            await addDoc(collection(db, "reservations"), reservationData); // Firestoreにデータを保存
            alert("予約が正常に保存されました！");
            loadReservations(); // 予約リストをリロード
        } catch (error) {
            console.error("予約の保存中にエラーが発生しました:", error);
        }
    } else {
        alert("すべてのフィールドに入力してください。");
    }
});

// Load Reservations
async function loadReservations() {
    const reservationList = document.getElementById('reservationList');
    reservationList.innerHTML = '<h3>予約一覧</h3>'; // 予約リストをクリア
    const q = query(collection(db, "reservations"), orderBy("time", "asc")); // 時間で並び替え

    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        const reservation = doc.data();
        const reservationElement = document.createElement('div');
        reservationElement.classList.add('reservation');
        reservationElement.innerHTML = `
            <p><strong>${reservation.time}</strong> - ${reservation.meetingName} (予約者: ${reservation.userName}, 連絡先: ${reservation.contact})</p>
        `;
        reservationList.appendChild(reservationElement);
    });
}

// ページ読み込み時に予約リストをロード
window.onload = function() {
    loadReservations();
};