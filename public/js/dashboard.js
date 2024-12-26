document.addEventListener("DOMContentLoaded", () => {
    console.log("Dashboard loaded successfully!");
    // Add interactivity if needed, such as filtering or sorting
});
// dashboard.js

document.getElementById('users-tab').addEventListener('click', function () {
    toggleSection('users-section');
});

document.getElementById('orders-tab').addEventListener('click', function () {
    toggleSection('orders-section');
});

document.getElementById('feedback-tab').addEventListener('click', function () {
    toggleSection('feedback-section');
});

function toggleSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.details-section').forEach(section => {
        section.style.display = 'none';
    });

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}
