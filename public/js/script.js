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