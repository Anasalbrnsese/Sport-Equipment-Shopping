document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('container');
    const registerBtn = document.getElementById('register');
    const loginBtn = document.getElementById('login');
    const roleSelect = document.getElementById('roleSelect');
    const activationCodeContainer = document.getElementById('activationCodeContainer');
    const form = document.getElementById('loginForm');
    const inputs = document.querySelectorAll('input');

    if (registerBtn && loginBtn && container) {
        registerBtn.addEventListener('click', () => {
            container.classList.add("active");
        });

        loginBtn.addEventListener('click', () => {
            container.classList.remove("active");
        });
    }

    if (roleSelect && activationCodeContainer) {
        roleSelect.addEventListener('change', function () {
            if (this.value === 'merchant') {
                activationCodeContainer.style.display = 'block'; // Show activation code field
            } else {
                activationCodeContainer.style.display = 'none'; // Hide activation code field
            }
        });
    }

    if (inputs && form) {
        inputs.forEach((input, index) => {
            input.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Prevent default form submission

                    if (index < inputs.length - 1) {
                        inputs[index + 1].focus(); // Focus the next field
                    } else {
                        form.submit(); // Submit the form
                    }
                }
            });
        });
    }

    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const password = this.value;

            // Check password criteria
            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            document.getElementById('password-feedback')?.classList.toggle('valid', hasLowercase || hasUppercase || hasNumber || hasSpecialChar);
            document.getElementById('lowercase-msg')?.classList.toggle('valid', hasLowercase);
            document.getElementById('uppercase-msg')?.classList.toggle('valid', hasUppercase);
            document.getElementById('number-msg')?.classList.toggle('valid', hasNumber);
            document.getElementById('special-char-msg')?.classList.toggle('valid', hasSpecialChar);
        });
    }

    const confirmPasswordInput = document.getElementById('confirm_password');
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function () {
            const password = this.value;

            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            document.getElementById('password-feedback-2')?.classList.toggle('valid', hasLowercase || hasUppercase || hasNumber || hasSpecialChar);
            document.getElementById('lowercase-msg-2')?.classList.toggle('valid', hasLowercase);
            document.getElementById('uppercase-msg-2')?.classList.toggle('valid', hasUppercase);
            document.getElementById('number-msg-2')?.classList.toggle('valid', hasNumber);
            document.getElementById('special-char-msg-2')?.classList.toggle('valid', hasSpecialChar);
        });
    }

    const passwordLoginInput = document.getElementById('passwordLogin');
    if (passwordLoginInput) {
        passwordLoginInput.addEventListener('input', function () {
            const password = this.value;

            const hasLowercase = /[a-z]/.test(password);
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /\d/.test(password);
            const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

            document.getElementById('password-feedback-3')?.classList.toggle('valid', hasLowercase || hasUppercase || hasNumber || hasSpecialChar);
            document.getElementById('lowercase-msg-3')?.classList.toggle('valid', hasLowercase);
            document.getElementById('uppercase-msg-3')?.classList.toggle('valid', hasUppercase);
            document.getElementById('number-msg-3')?.classList.toggle('valid', hasNumber);
            document.getElementById('special-char-msg-3')?.classList.toggle('valid', hasSpecialChar);
        });
    }
});
