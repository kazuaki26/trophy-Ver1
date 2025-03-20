// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendEmailVerification ,sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-auth.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.11.1/firebase-firestore.js";

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();



const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');

togglePassword.classList.add('fa-eye-slash');

togglePassword.addEventListener('click', function() {
  // パスワードのタイプを切り替える
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);

  // 目のアイコンを切り替える
  if (type === 'text') {
    // パスワードが表示されている場合
    togglePassword.classList.remove('fa-eye-slash'); // 斜線を消す
    togglePassword.classList.add('fa-eye'); // 目のアイコンを表示
  } else {
    // パスワードが非表示の場合
    togglePassword.classList.remove('fa-eye'); // 目のアイコンを消す
    togglePassword.classList.add('fa-eye-slash'); // 斜線付きの目のアイコンを表示
  }
});

// Show message function
function showMessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;
    setTimeout(() => {
        messageDiv.style.opacity = 0;
    }, 5000);
}

// Sign Up functionality
const signUp = document.getElementById('submitSignUp');
signUp.addEventListener('click', async (event) => {
    event.preventDefault();
    
    const email = document.getElementById('rEmail').value;
    const password = document.getElementById('rPassword').value;
    const firstName = document.getElementById('fName').value;
    const lastName = document.getElementById('lName').value;
    const studentID = document.getElementById('rStudentID').value;
    const termYear = document.getElementById('rTermYear').value;
    //ここに追加

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Send verification email
        await sendEmailVerification(user);

        const userData = { email, firstName, lastName, studentID, termYear };
        const docRef = doc(db, "users", user.uid);
        
        await setDoc(docRef, userData);
        showMessage('アカウントが適切に制作されました！', 'signUpMessage');
        
        // Redirect after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        
    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
            showMessage('そのメールアドレスはすでに登録されています!!', 'signUpMessage');
        } else {
            showMessage('アカウントを制作することができません。', 'signUpMessage');
        }
    }
});

// Sign In functionality
const signIn = document.getElementById('submitSignIn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;

            // Check if the user's email is verified
            if (user.emailVerified) {
                showMessage('ログインが成功しました！', 'signInMessage');
                localStorage.setItem('loggedInUserId', user.uid);

                // 画面幅をチェックして適切なページにリダイレクト
                if (window.innerWidth <= 768) {  
                    window.location.href = 'homepageForPhone.html';
                } else {
                    window.location.href = 'homepage.html';
                }
            } else {
                showMessage('ログイン前にメールアドレスの認証を行なってください。ご登録時に使用したメールアドレスに認証URLを送信しました。', 'signInMessage');
            }
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-credential') {
                showMessage('パスワードまたは、e-mailアドレスが間違っています。', 'signInMessage');
            } else {
                showMessage('アカウントが存在しません。メールアドレスが正しいかご確認ください。', 'signInMessage');
            }
        });
});


// // パスワードリセットのための関数を定義
// const forgotPassword = document.getElementById('forgotPassword');
// forgotPassword.addEventListener('click', (event) => {
//     event.preventDefault();
//     const email = document.getElementById('email').value; // ユーザーのメールアドレスを取得
//     const auth = getAuth();

//     // パスワードリセットメールを送信
//     sendPasswordResetEmail(auth, email)
//         .then(() => {
//             showMessage('パスワードリセットリンクを送信しました。メールをご確認ください。', 'resetPasswordMessage');
//         })
//         .catch((error) => {
//             const errorCode = error.code;
//             if (errorCode === 'auth/user-not-found') {
//                 showMessage('指定されたメールアドレスは登録されていません。', 'resetPasswordMessage');
//             } else {
//                 showMessage('パスワードリセットの送信に失敗しました。', 'resetPasswordMessage');
//             }
//         });
// });
const forgotPasswordBtn = document.getElementById('forgotPassword');
const signInDiv = document.getElementById('signIn');
const forgotDiv = document.getElementById('forggot');

// "パスワードを忘れましたか？" ボタンが押されたら
forgotPasswordBtn.addEventListener('click', (event) => {
    event.preventDefault();
    
    // サインイン画面を非表示にする
    signInDiv.style.display = 'none';
    
    // フォーゴット画面を表示する
    forgotDiv.style.display = 'block';
});

// 他に画面遷移のためのボタンを設定している場合
const signUpButton = document.getElementById('signUpButton');
const signUpDiv = document.getElementById('signup');

// "サインアップ" ボタンが押されたら、サインインとフォーゴットを非表示にし、サインアップ画面を表示
signUpButton.addEventListener('click', () => {
    signInDiv.style.display = 'none';
    forgotDiv.style.display = 'none';
    signUpDiv.style.display = 'block';
});

// パスワードリセットのフォーム処理も忘れずに記述
// "パスワードリセットリンクを送信" ボタンが押されたら
const sendResetEmail = document.getElementById('sendResetEmail');

sendResetEmail.addEventListener('click', (event) => {
    event.preventDefault();
    
    signUpContainer.style.display = 'none';
    forgotContainer.style.display = 'none';
    signInContainer.style.display = 'block';


    // メールアドレスの入力欄から値を取得
    const email = document.getElementById('resetEmail').value;
    
    if (email) {
        const auth = getAuth();
        sendPasswordResetEmail(auth, email)
            .then(() => {
                alert('パスワードリセットリンクが送信されました。');
            })
            .catch((error) => {
                alert('エラーが発生しました: ' + error.message);
            });
    } else {
        alert('メールアドレスを入力してください。');
    }
});

// コンテナ要素の取得
const signUpButton2 = document.getElementById('signUpButton2'); // サインアップボタン
const signUpContainer = document.getElementById('signup'); // サインアップ画面
const forgotContainer = document.getElementById('forggot'); // パスワードリセット画面
const signInContainer = document.getElementById('signIn'); // サインイン画面

// サインアップボタンを押したときの処理
signUpButton2.addEventListener('click', () => {
    // パスワードリセット画面とサインイン画面を非表示にして、サインアップ画面を表示
    forgotContainer.style.display = 'none';
    signInContainer.style.display = 'none';
    signUpContainer.style.display = 'block';
});

// サインインボタンを押したときの処理
const signInButton = document.getElementById('signInButton');

signInButton.addEventListener('click', () => {
    // サインアップ画面とパスワードリセット画面を非表示にして、サインイン画面を表示
    signUpContainer.style.display = 'none';
    forgotContainer.style.display = 'none';
    signInContainer.style.display = 'block';
});

// サインインボタン2を押したときの処理（他のサインインボタンがある場合）
const signInButton2 = document.getElementById('signInButton2');

signInButton2.addEventListener('click', () => {
    // サインアップ画面とパスワードリセット画面を非表示にして、サインイン画面を表示
    signUpContainer.style.display = 'none';
    forgotContainer.style.display = 'none';
    signInContainer.style.display = 'block';
});


// // もしサインイン画面へ戻すためのサインインボタンの処理も追加したい場合
// const signInButton = document.getElementById('signInButton');

// signInButton.addEventListener('click', () => {
//     // サインアップ画面を非表示にして、サインイン画面を表示
//     signUpContainer.style.display = 'none';
//     forgotContainer.style.display = 'none';
//     signInContainer.style.display = 'block';
// });

