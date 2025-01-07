document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelectorAll('.section-card').forEach(section => section.style.display = 'none');
        const targetSection = document.querySelector(this.getAttribute('href').replace('-tab', '-section'));
        targetSection.style.display = 'block';
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        this.parentElement.classList.add('active');
    });
});

document.querySelectorAll('.block-unblock-user').forEach(button => {
    button.addEventListener('click', async function () {
        const userId = this.getAttribute('data-user-id');
        const action = this.textContent.trim();

        // Using SweetAlert2 for confirmation
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to undo this action!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: `Yes, ${action.toLowerCase()}!`,
            cancelButtonText: 'Cancel'
        });

        if (result.isConfirmed) {
            try {
                const response = await fetch(`/admin/users/${userId}/block-unblock`, { method: 'PUT' });
                const result = await response.json(); // Parse response as JSON

                if (response.ok) {
                    location.reload(); // Reload to reflect changes
                } else {
                    Swal.fire('Error', 'Failed to update user status.', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                Swal.fire('Error', 'An unexpected error occurred.', 'error');
            }
        }
    });
});