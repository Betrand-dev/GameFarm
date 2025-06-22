// Mobile menu toggle
document.getElementById('mobileMenuBtn').addEventListener('click', function () {
    document.getElementById('navMenu').classList.toggle('show');
});
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });

        // Close mobile menu if open
        document.getElementById('navMenu').classList.remove('show');
    });
});
