// =========================================================================
// 🔑 auth-router.js - محرك إدارة الصلاحيات والتوجيه الذكي لأكاديمية القارئ
// =========================================================================

// 📡 إعدادات اتصال الفايربيز الموحدة والمعتمدة للمشروع كاملاً
const firebaseConfig = {
  apiKey: "AIzaSyDlNsxfXon1Mz97aSNWFm8pm1lXY8rla_I",
  authDomain: "alqareebackend.firebaseapp.com",
  projectId: "alqareebackend",
  storageBucket: "alqareebackend.firebasestorage.app",
  messagingSenderId: "226570489798",
  appId: "1:226570489798:web:3bb987af6b7ccfc3faecc7",
  measurementId: "G-PEFEFJY558",
};

// تشغيل وبدء تهيئة قنوات الاتصال بالفايربيز بشكل آمن
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
var db = firebase.firestore();
var auth = firebase.auth();

// متغير الحالة المركزي للمشرفين لمعالجة الرتب داخل الصفحات
var currentSupervisor = "المدير العام";

/**
 * 🔒 دالة فحص وتأمين الصلاحيات للمستخدم الحالي وحماية الصفحات الحساسة
 */
function checkPageProtection(requiredRole = "كل المشرفين") {
  const savedSupervisor = localStorage.getItem("currentSupervisor");
  console.log("🔐 فحص الحماية - المشرف الحالي في الذاكرة هو:", savedSupervisor);

  if (!savedSupervisor) {
    window.location.href = "index.html";
    return;
  }

  currentSupervisor = savedSupervisor;

  if (
    requiredRole === "المدير العام" &&
    !currentSupervisor.includes("المدير العام")
  ) {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "دخول غير مصرح به! 🛑",
        text: "عذراً، هذه اللوحة الإدارية وأدوات السيرفر حصرية للمدير العام فقط.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "العودة للرئيسية",
      }).then(() => {
        window.location.href = "dashboard.html";
      });
    } else {
      alert("عذراً، هذه اللوحة الإدارية حصرية للمدير العام فقط.");
      window.location.href = "dashboard.html";
    }
  }
}

/**
 * 🔄 دالة تبديل صلاحيات الحساب للاختبار
 */
function simulateSupervisorToggle() {
  if (currentSupervisor === "المدير العام") {
    currentSupervisor = "عبد الرحمن";
    Swal.fire({
      icon: "warning",
      title: "تم تبديل الصلاحيات 🔄",
      text: "أنت الآن تتصفح النظام بصلاحيات المشرف المساعد: عبد الرحمن",
      timer: 2000,
      showConfirmButton: false,
    });
  } else {
    currentSupervisor = "المدير العام";
    Swal.fire({
      icon: "info",
      title: "تمت العودة للمدير 🔑",
      text: "تمت استعادة كامل صلاحيات الإدارة العامة.",
      timer: 2000,
      showConfirmButton: false,
    });
  }

  localStorage.setItem("currentSupervisor", currentSupervisor);
  updateDynamicUIElements();

  if (typeof updateDashboardStats === "function") updateDashboardStats();
  if (typeof buildPaymentChart === "function") buildPaymentChart();
  if (typeof buildTeacherCards === "function") buildTeacherCards();
}

/**
 * 🎨 تحديث النصوص والشارات في الهيدر
 */
function updateDynamicUIElements() {
  const welcomeText = document.getElementById("supervisor-welcome-text");
  const userBadge = document.getElementById("current-user-badge");

  if (!userBadge && !welcomeText) return;

  if (currentSupervisor.includes("المدير العام")) {
    if (welcomeText)
      welcomeText.innerText =
        "مرحباً بك في لوحة تحكم: الإدارة العامة للسيرفر السحابي";
    if (userBadge) {
      userBadge.innerText = "المشرف: المدير العام";
      userBadge.style.backgroundColor = "rgba(212, 175, 55, 0.1)";
      userBadge.style.color = "var(--gold-primary)";
    }
  } else {
    if (welcomeText)
      welcomeText.innerText = `مرحباً بك في لوحة تحكم المشرف والمسؤول: ${currentSupervisor}`;
    if (userBadge) {
      userBadge.innerText = `المشرف الحالي: ${currentSupervisor}`;
      userBadge.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
      userBadge.style.color = "var(--info)";
    }
  }
}

/**
 * 🔐 دالة تسجيل الدخول المحدثة والموحدة
 */
function login() {
  const userInput = document.getElementById("login-username");
  const passwordInput = document.getElementById("login-password");
  const loginBtn = document.getElementById("submit-btn");

  if (!userInput || !passwordInput) return;

  const email = userInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "تنبيه",
      text: "الرجاء إدخال البريد الإلكتروني وكلمة المرور!",
    });
    return;
  }

  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.innerText = "جاري تسجيل الدخول...";
  }

  console.log("🚀 محاولة تسجيل الدخول");
  console.log("Email:", email);
  console.log("Password:", password);

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      console.log("✅ تم تسجيل الدخول");
      console.log(userCredential.user);

      Swal.fire({
        icon: "success",
        title: "تم تسجيل الدخول بنجاح 🎉",
        text: "مرحباً بك.",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "dashboard.html";
      });
    })
    .catch((error) => {
      console.error("❌ فشل تسجيل الدخول:", error);

      if (loginBtn) {
        loginBtn.disabled = false;
        loginBtn.innerText = "تسجيل الدخول";
      }

      Swal.fire({
        icon: "error",
        title: "فشل تسجيل الدخول",
        text: error.message,
      });
    });
}

/**
 * 🚪 دالة تسجيل الخروج
 */
function logout() {
  Swal.fire({
    title: "تسجيل الخروج من النظام",
    text: "هل تود مغادرة النظام الإداري الآن؟",
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#475569",
    confirmButtonText: "نعم، خروج",
    cancelButtonText: "إلغاء",
  }).then((result) => {
    if (result.isConfirmed) {
      auth
        .signOut()
        .then(() => {
          localStorage.removeItem("currentSupervisor");
          Swal.fire({
            icon: "success",
            title: "تم الخروج بأمان 👋",
            text: "في أمان الله ورعايته.",
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            window.location.href = "index.html";
          });
        })
        .catch((err) => {
          localStorage.removeItem("currentSupervisor");
          window.location.href = "index.html";
        });
    }
  });
}
