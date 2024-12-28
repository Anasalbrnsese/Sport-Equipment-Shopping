document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded successfully!");

    // Sidebar navigation
    document.getElementById('users-tab').addEventListener('click', () => toggleSection('users-section'));
    document.getElementById('orders-tab').addEventListener('click', () => toggleSection('orders-section'));
    document.getElementById('feedback-tab').addEventListener('click', () => toggleSection('feedback-section'));
    document.getElementById('block-unblock-tab').addEventListener('click', () => toggleSection('block-unblock-section'));

    // Block/Unblock functionality
    document.querySelectorAll('.block-unblock-user').forEach(button => {
        button.addEventListener('click', async function () {
            const userId = this.getAttribute('data-user-id');
            const action = this.textContent.trim();
            const confirmed = confirm(`Are you sure you want to ${action.toLowerCase()} this user?`);

            if (confirmed) {
                try {
                    const response = await fetch(`/admin/users/${userId}/block-unblock`, { method: 'PUT' });
                    const result = await response.json(); // Parse response as JSON

                    if (response.ok) {
                        alert(result.message);
                        if (result.message.includes("blocked") && result.user._id === currentUserId) {
                            // Logout if the current logged-in user is blocked
                            alert("Your account has been blocked. You will be logged out.");
                            window.location.href = "users/login"; // Redirect to logout
                        }
                        location.reload(); // Reload to reflect changes
                    } else {
                        alert('Error: ' + (result.message || 'Failed to update user status.'));
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('An unexpected error occurred.');
                }
            }
        });
    });
});

function toggleSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.details-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}
