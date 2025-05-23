// Smooth scrolling for navigation links
document.querySelectorAll('header nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, // Adjust for sticky header height
                behavior: 'smooth'
            });
        }
    });
});

// Basic form validation example (can be expanded)
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        this.querySelectorAll('[required]').forEach(input => {
            if (!input.value) {
                isValid = false;
                input.style.borderColor = 'red'; // Highlight empty required fields
            } else {
                input.style.borderColor = '#ddd'; // Reset border color
            }
        });
        if (!isValid) {
            event.preventDefault(); // Prevent form submission if validation fails
            alert('Please fill out all required fields.');
        }
    });
});

// Simple image gallery modal (basic example)
const galleryImages = document.querySelectorAll('.image-grid img');
const modal = document.createElement('div');
modal.id = 'imageModal';
modal.style.display = 'none';
modal.style.position = 'fixed';
modal.style.zIndex = '1001';
modal.style.left = '0';
modal.style.top = '0';
modal.style.width = '100%';
modal.style.height = '100%';
modal.style.overflow = 'auto';
modal.style.backgroundColor = 'rgba(0,0,0,0.9)';

const modalImg = document.createElement('img');
modalImg.style.margin = 'auto';
modalImg.style.display = 'block';
modalImg.style.maxWidth = '80%';
modalImg.style.maxHeight = '80%';
modalImg.style.position = 'absolute';
modalImg.style.left = '50%';
modalImg.style.top = '50%';
modalImg.style.transform = 'translate(-50%, -50%)';


const closeBtn = document.createElement('span');
closeBtn.innerHTML = '&times;';
closeBtn.style.position = 'absolute';
closeBtn.style.top = '20px';
closeBtn.style.right = '35px';
closeBtn.style.color = '#f1f1f1';
closeBtn.style.fontSize = '40px';
closeBtn.style.fontWeight = 'bold';
closeBtn.style.cursor = 'pointer';

modal.appendChild(closeBtn);
modal.appendChild(modalImg);
document.body.appendChild(modal);

galleryImages.forEach(img => {
    img.addEventListener('click', function() {
        modal.style.display = 'block';
        modalImg.src = this.src;
    });
});

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

console.log("Casa Mi Sueño JavaScript loaded.");

document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation Toggle
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
            navToggle.classList.toggle('active'); // For hamburger icon animation
        });
    }

    // Active Navigation Link
    // This simple version highlights based on URL. More complex logic might be needed for sections on the same page.
    const currentLocation = window.location.href;
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        if (link.href === currentLocation) {
            link.classList.add('active');
        }
        // Remove active class from Home if another link is active, unless we are on index.html
        if (!currentLocation.endsWith('index.html') && currentLocation !== (window.location.origin + '/')){
            if(link.getAttribute('href') === 'index.html' && link.classList.contains('active')) {
                 if(currentLocation.split('/').pop() !== '' && currentLocation.split('/').pop() !== 'index.html') {
                    link.classList.remove('active');
                 }
            }
        }
        // Ensure home is active on root path
        if ((currentLocation.endsWith('/') || currentLocation.endsWith('index.html')) && link.getAttribute('href') === 'index.html'){
             link.classList.add('active');
        }
    });

    // Smooth Scroll for internal links (if any specific targeting is needed beyond CSS)
    // The CSS html { scroll-behavior: smooth; } handles most cases.
    // This can be extended for more complex scrolling logic, e.g., with offsets for sticky header if not handled by CSS scroll-padding-top.

    // Simple Fade-in Animation on Scroll
    const fadeElements = document.querySelectorAll('.fade-in');
    const observerOptions = {
        root: null, // relative to document viewport 
        rootMargin: '0px',
        threshold: 0.1 // 10% of item has to be visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: unobserve after animation to save resources
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => {
        observer.observe(el);
    });

    // Image Gallery Modal
    const galleryImages = document.querySelectorAll('.gallery-image'); // Use this class for clickable gallery images
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const modalCaption = document.getElementById('modalCaption'); // Get the caption element
    const closeModal = document.getElementById('modalClose');

    if (modal && modalImg && closeModal && galleryImages.length > 0) {
        galleryImages.forEach(image => {
            image.addEventListener('click', function() {
                modal.style.display = 'block';
                modalImg.src = this.src;
                modalImg.alt = this.alt; // Set alt for the modal image too for accessibility
                if (modalCaption) { // Check if caption element exists
                    modalCaption.textContent = this.alt; // Use alt text as caption
                }
            });
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // Close modal when clicking outside the image
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Check if the click is on the modal background itself
                modal.style.display = 'none';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
            }
        });
    }

    // Update Copyright Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Generate Star Ratings for Testimonials
    const testimonialRatings = document.querySelectorAll('.testimonial-rating');
    testimonialRatings.forEach(ratingElement => {
        const rating = parseInt(ratingElement.dataset.rating, 10);
        if (!isNaN(rating) && rating >= 0 && rating <= 5) {
            ratingElement.innerHTML = ''; // Clear any existing content
            for (let i = 1; i <= 5; i++) {
                const starSpan = document.createElement('span');
                starSpan.classList.add('star');
                if (i <= rating) {
                    starSpan.innerHTML = '&#9733;'; // Filled star Unicode
                    starSpan.classList.add('filled');
                } else {
                    starSpan.innerHTML = '&#9734;'; // Empty star Unicode
                    starSpan.classList.add('empty');
                }
                ratingElement.appendChild(starSpan);
            }
        }
    });

    // Booking Page Calendar Logic
    const calendarDaysContainer = document.getElementById('calendarDays');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');

    if (calendarDaysContainer && currentMonthYearElement && prevMonthBtn && nextMonthBtn) {
        let currentDate = new Date();
        // For demo purposes, let's define some booked/unavailable dates
        // Format: YYYY-MM-DD
        const unavailableDates = [
            // Add some example dates here if you want to show them as disabled
            // e.g., "2024-07-20", "2024-07-21"
        ];
        let selectedDates = []; // To store selected start and end dates

        function renderCalendar(date) {
            calendarDaysContainer.innerHTML = '';
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
            currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();

            // Add empty cells for days before the first day of the month
            for (let i = 0; i < firstDayOfMonth; i++) {
                const emptyCell = document.createElement('div');
                emptyCell.classList.add('empty');
                calendarDaysContainer.appendChild(emptyCell);
            }

            // Add day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.textContent = day;
                const cellDate = new Date(year, month, day);
                const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                if (cellDate.toDateString() === today.toDateString()) {
                    dayCell.classList.add('today');
                }

                if (unavailableDates.includes(cellDateString)) {
                    dayCell.classList.add('disabled');
                } else {
                    dayCell.addEventListener('click', () => {
                        if (dayCell.classList.contains('disabled')) return;

                        // Simple date selection logic (can be expanded for range selection)
                        if (selectedDates.length < 2) {
                            if (!selectedDates.includes(cellDateString)) {
                                selectedDates.push(cellDateString);
                                dayCell.classList.add('selected');
                                // Update form fields if needed
                                if (document.getElementById('checkin') && selectedDates.length === 1) {
                                    document.getElementById('checkin').value = cellDateString;
                                }
                                if (document.getElementById('checkout') && selectedDates.length === 2) {
                                    // Ensure checkout is after checkin
                                    if (new Date(selectedDates[1]) > new Date(selectedDates[0])){
                                        document.getElementById('checkout').value = cellDateString;
                                    } else {
                                        // Invalid selection, clear checkout or handle error
                                        selectedDates.pop(); // remove last selection
                                        dayCell.classList.remove('selected');
                                        alert("Vertrekdatum moet na aankomstdatum zijn.");
                                    }
                                }
                            } else {
                                // Deselect
                                selectedDates = selectedDates.filter(d => d !== cellDateString);
                                dayCell.classList.remove('selected');
                                // Clear form fields if deselected
                                if (document.getElementById('checkin') && document.getElementById('checkin').value === cellDateString) {
                                    document.getElementById('checkin').value = '';
                                }
                                if (document.getElementById('checkout') && document.getElementById('checkout').value === cellDateString) {
                                    document.getElementById('checkout').value = '';
                                }
                            }
                        } else if (selectedDates.includes(cellDateString)) {
                             // If two dates are selected and we click one of them again, deselect it
                            selectedDates = selectedDates.filter(d => d !== cellDateString);
                            dayCell.classList.remove('selected');
                            // Clear relevant form field
                            if (document.getElementById('checkin').value === cellDateString) document.getElementById('checkin').value = '';
                            if (document.getElementById('checkout').value === cellDateString) document.getElementById('checkout').value = '';
                        } else {
                            // If two dates selected and a third one is clicked, clear previous and select new one as start
                            document.querySelectorAll('.calendar-days div.selected').forEach(d => d.classList.remove('selected'));
                            selectedDates = [cellDateString];
                            dayCell.classList.add('selected');
                            document.getElementById('checkin').value = cellDateString;
                            document.getElementById('checkout').value = '';
                        }
                        // Ensure checkin is always before checkout if both selected
                        if (selectedDates.length === 2 && new Date(selectedDates[0]) > new Date(selectedDates[1])) {
                            selectedDates.sort((a, b) => new Date(a) - new Date(b));
                            document.getElementById('checkin').value = selectedDates[0];
                            document.getElementById('checkout').value = selectedDates[1];
                        }

                    });
                }
                calendarDaysContainer.appendChild(dayCell);
            }
            // Re-apply selected class for dates if month changes
            selectedDates.forEach(selDate => {
                const [sYear, sMonth, sDay] = selDate.split('-').map(Number);
                if (sYear === year && (sMonth - 1) === month) {
                    const dayElem = Array.from(calendarDaysContainer.children).find(d => d.textContent === String(sDay) && !d.classList.contains('empty'));
                    if (dayElem) dayElem.classList.add('selected');
                }
            });
        }

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

        renderCalendar(currentDate); // Initial render
    }

    // Handle Booking Form Submission to show thank you message
    const bookingForm = document.querySelector('.booking-form');
    const thankYouMessage = document.querySelector('.thank-you-message');

    if (bookingForm && thankYouMessage) {
        bookingForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent actual submission for this demo
            
            let isValid = true;
            this.querySelectorAll('[required]').forEach(input => {
                if (!input.value) {
                    isValid = false;
                    input.style.borderColor = 'red';
                } else {
                    input.style.borderColor = 'var(--color-border)'; // Reset to default
                }
            });

            if (isValid) {
                // Optionally, gather form data here if you were to send it
                // const formData = new FormData(this);
                // for (let [key, value] of formData.entries()) { 
                //     console.log(key, value);
                // }
                this.style.display = 'none';
                thankYouMessage.style.display = 'block';
                // You might want to reset the form or redirect after a delay
            } else {
                alert('Vul alstublieft alle verplichte velden in.');
            }
        });
    }

    console.log("Modern Casa Mi Sueño JavaScript loaded.");
}); 