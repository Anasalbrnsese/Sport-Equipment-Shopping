const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

const roleSelect = document.getElementById('roleSelect');
const activationCodeContainer = document.getElementById('activationCodeContainer');

roleSelect.addEventListener('change', function () {
    if (this.value === 'merchant') {
        activationCodeContainer.style.display = 'block'; // Show activation code field
    } else {
        activationCodeContainer.style.display = 'none'; // Hide activation code field
    }
});

const inputs = document.querySelectorAll('input');
const form = document.getElementById('loginForm');

inputs.forEach((input, index) => {
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // منع الإرسال الافتراضي للنموذج

            if (index < inputs.length - 1) {
                inputs[index + 1].focus(); // التركيز على الحقل التالي
            } else {
                // إذا كان هذا هو الحقل الأخير، قم بإرسال النموذج
                form.submit(); // إرسال النموذج
            }
        }
    });
});


document.getElementById('password').addEventListener('input', function () {
    let password = this.value;

    // تحقق من الحروف الكبيرة والصغيرة والأرقام والرموز
    let div = /[a-z]/.test(password) || /[A-Z]/.test(password) || /\d/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // أظهر الرسائل بناءً على الشروط
    document.getElementById('password-feedback').classList.toggle('valid', div);
    document.getElementById('lowercase-msg').classList.toggle('valid', hasLowercase);
    document.getElementById('uppercase-msg').classList.toggle('valid', hasUppercase);
    document.getElementById('number-msg').classList.toggle('valid', hasNumber);
    document.getElementById('special-char-msg').classList.toggle('valid', hasSpecialChar);
});



document.getElementById('confirm_password').addEventListener('input', function () {
    const password = this.value;

    // تحقق من الحروف الكبيرة والصغيرة والأرقام والرموز
    let div = /[a-z]/.test(password) || /[A-Z]/.test(password) || /\d/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // أظهر الرسائل بناءً على الشروط
    document.getElementById('password-feedback-2').classList.toggle('valid', div);
    document.getElementById('lowercase-msg-2').classList.toggle('valid', hasLowercase);
    document.getElementById('uppercase-msg-2').classList.toggle('valid', hasUppercase);
    document.getElementById('number-msg-2').classList.toggle('valid', hasNumber);
    document.getElementById('special-char-msg-2').classList.toggle('valid', hasSpecialChar);
});


document.getElementById('passwordLogin').addEventListener('input', function () {
    let password = this.value;

    // تحقق من الحروف الكبيرة والصغيرة والأرقام والرموز
    let div = /[a-z]/.test(password) || /[A-Z]/.test(password) || /\d/.test(password) || /[!@#$%^&*(),.?":{}|<>]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasUppercase = /[A-Z]/.test(password);
    let hasNumber = /\d/.test(password);
    let hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // أظهر الرسائل بناءً على الشروط
    document.getElementById('password-feedback-3').classList.toggle('valid', div);
    document.getElementById('lowercase-msg-3').classList.toggle('valid', hasLowercase);
    document.getElementById('uppercase-msg-3').classList.toggle('valid', hasUppercase);
    document.getElementById('number-msg-3').classList.toggle('valid', hasNumber);
    document.getElementById('special-char-msg-3').classList.toggle('valid', hasSpecialChar);
});
