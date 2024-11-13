// Function to handle scroll animations
function animateOnScroll() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach((card) => {
        const cardTop = card.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Check if the card is in the viewport
        if (cardTop < windowHeight - 50) {
            card.classList.add('animate'); // Trigger animation when in view
        }
    });
}

// Listen for scroll events to trigger animation
window.addEventListener('scroll', animateOnScroll);

// Run on load in case some cards are initially in view
window.addEventListener('load', animateOnScroll);