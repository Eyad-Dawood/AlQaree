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
  const userRole = localStorage.getItem("userRole");
  console.log("🔐 فحص الحماية - المشرف:", savedSupervisor, "الرتبة:", userRole);

  if (!savedSupervisor) {
    window.location.href = "index.html";
    return;
  }

  currentSupervisor = savedSupervisor;

  // إذا كان دور المستخدم معلماً، وحاول دخول صفحات الإدارة (مثل سجل المعلمين أو الإعدادات)
  if (userRole === "teacher") {
    if (typeof Swal !== "undefined") {
      Swal.fire({
        icon: "error",
        title: "غير مصرح لك 🛑",
        text: "هذه الصفحة مخصصة لمدراء النظام فقط.",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "الذهاب للوحة المعلم",
      }).then(() => {
        window.location.href = "teacherDashboard.html";
      });
    } else {
      alert("غير مصرح لك بدخول هذه الصفحة.");
      window.location.href = "teacherDashboard.html";
    }
    return;
  }

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

  auth
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("✅ تم تسجيل الدخول بنجاح، جلب البيانات للـ UID:", user.uid);

      // جلب الصلاحية والدور والاسم من مجموعة مستخدمي النظام Firestore
      return db.collection("users").doc(user.uid).get();
    })
    .then((doc) => {
      if (doc.exists) {
        const userData = doc.data();
        const role = userData.Role || userData.role || "";
        const name = userData.Name || userData.name || "مستخدم";

        localStorage.setItem("currentSupervisor", name);
        localStorage.setItem("userRole", role);

        Swal.fire({
          icon: "success",
          title: "تم تسجيل الدخول بنجاح 🎉",
          text: `مرحباً بك مجدداً في المنظومة: ${name}`,
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          if (role === "admin") {
            window.location.href = "dashboard.html";
          } else if (role === "teacher") {
            window.location.href = "teacherDashboard.html";
          } else {
            Swal.fire(
              "صلاحيات غير كافية",
              "عذراً، هذا الحساب لا يملك دوراً معتمداً بالنظام.",
              "error",
            );
            auth.signOut();
            if (loginBtn) {
              loginBtn.disabled = false;
              loginBtn.innerText = "تسجيل الدخول";
            }
          }
        });
      } else {
        // إذا لم يكن اسم الوثيقة هو UID، نبحث بواسطة حقل البريد الإلكتروني
        const userEmail = auth.currentUser.email;
        return db
          .collection("users")
          .where("Email", "==", userEmail)
          .get()
          .then((snapshot) => {
            if (!snapshot.empty) {
              const userData = snapshot.docs[0].data();
              const role = userData.Role || userData.role || "";
              const name = userData.Name || userData.name || "مستخدم";

              localStorage.setItem("currentSupervisor", name);
              localStorage.setItem("userRole", role);

              Swal.fire({
                icon: "success",
                title: "تم تسجيل الدخول بنجاح 🎉",
                text: `مرحباً بك مجدداً في المنظومة: ${name}`,
                timer: 1500,
                showConfirmButton: false,
              }).then(() => {
                if (role === "admin") {
                  window.location.href = "dashboard.html";
                } else if (role === "teacher") {
                  window.location.href = "teacherDashboard.html";
                } else {
                  Swal.fire(
                    "صلاحيات غير كافية",
                    "عذراً، هذا الحساب لا يملك دوراً معتمداً بالنظام.",
                    "error",
                  );
                  auth.signOut();
                  if (loginBtn) {
                    loginBtn.disabled = false;
                    loginBtn.innerText = "تسجيل الدخول";
                  }
                }
              });
            } else {
              // احتياطي للطوارئ: الدخول الافتراضي كـ admin
              console.warn(
                "⚠️ لم يتم العثور على وثيقة المستخدم في Firestore. الدخول الافتراضي كمدير.",
              );
              localStorage.setItem(
                "currentSupervisor",
                userEmail.split("@")[0],
              );
              localStorage.setItem("userRole", "admin");

              Swal.fire({
                icon: "success",
                title: "تم تسجيل الدخول بنجاح 🎉",
                text: "مرحباً بك (حساب افتراضي).",
                timer: 1500,
                showConfirmButton: false,
              }).then(() => {
                window.location.href = "dashboard.html";
              });
            }
          });
      }
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
          localStorage.removeItem("userRole");
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
          localStorage.removeItem("userRole");
          window.location.href = "index.html";
        });
    }
  });
}
