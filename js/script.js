/*
 * Casa Mi Sueño - Website Interactivity
 * 
 * GOOGLE SHEETS CONFIGURATION:
 * To connect the booking calendar to your Google Sheet with booked dates:
 * 
 * 1. Create a Google Sheet with booked dates in column A (format: YYYY-MM-DD)
 * 2. Make the sheet public (Share > Anyone with the link can view)
 * 3. Get the Sheet ID from the URL: https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
 * 4. Replace YOUR_GOOGLE_SHEETS_JSON_ENDPOINT_HERE in the GOOGLE_SHEETS_CONFIG below with one of:
 *    
 *    Option A - CSV format (no API key needed):
 *    https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0
 *    
 *    Option B - JSON format with API key:
 *    https://sheets.googleapis.com/v4/spreadsheets/YOUR_SHEET_ID/values/A:A?key=YOUR_API_KEY
 * 
 * 5. Optional: Add fallback dates in fallbackDates array for when the sheet is unavailable
 */

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

// Enhanced form validation
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        // Clear previous error states
        this.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        this.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderColor = 'var(--color-border)';
        });

        requiredFields.forEach(input => {
            const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
            
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
                if (errorElement) {
                    errorElement.style.display = 'block';
                }
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
                if (errorElement) {
                    errorElement.textContent = 'Vul een geldig e-mailadres in (moet @ bevatten)';
                    errorElement.style.display = 'block';
                }
            } else {
                input.style.borderColor = 'var(--color-border)';
                if (errorElement) {
                    errorElement.style.display = 'none';
                }
            }
        });

        // Additional validation for date fields
        const checkinField = this.querySelector('#checkin');
        const checkoutField = this.querySelector('#checkout');
        
        if (checkinField && checkoutField && checkinField.value && checkoutField.value) {
            const checkinDate = new Date(checkinField.value);
            const checkoutDate = new Date(checkoutField.value);
            const today = new Date();
            today.setHours(0,0,0,0);
            
            if (checkinDate < today) {
                isValid = false;
                checkinField.style.borderColor = '#e74c3c';
                const errorElement = document.getElementById('checkin-error');
                if (errorElement) {
                    errorElement.textContent = 'Aankomstdatum kan niet in het verleden liggen';
                    errorElement.style.display = 'block';
                }
            }
            
            if (checkoutDate <= checkinDate) {
                isValid = false;
                checkoutField.style.borderColor = '#e74c3c';
                const errorElement = document.getElementById('checkout-error');
                if (errorElement) {
                    errorElement.textContent = 'Vertrekdatum moet na de aankomstdatum zijn';
                    errorElement.style.display = 'block';
                }
            }
        }

        if (!isValid) {
            event.preventDefault();
            // Focus on first error field
            const firstError = this.querySelector('input[style*="border-color: rgb(231, 76, 60)"], input[style*="border-color: #e74c3c"]');
            if (firstError) {
                firstError.focus();
            }
        }
        // If valid, allow form to submit naturally to Formspree
    });
});

// Email validation helper function
function validateEmail(email) {
    return email.includes('@') && email.length > 3;
}

// Enhanced image gallery modal with keyboard navigation
const galleryImages = document.querySelectorAll('.image-grid img, .gallery-image');
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
modal.setAttribute('role', 'dialog');
modal.setAttribute('aria-modal', 'true');
modal.setAttribute('aria-labelledby', 'modal-title');

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
closeBtn.setAttribute('aria-label', 'Sluit vergrote afbeelding');
closeBtn.setAttribute('tabindex', '0');

const modalTitle = document.createElement('h2');
modalTitle.id = 'modal-title';
modalTitle.style.position = 'absolute';
modalTitle.style.top = '10px';
modalTitle.style.left = '20px';
modalTitle.style.color = '#f1f1f1';
modalTitle.style.fontSize = '1.2rem';
modalTitle.textContent = 'Vergrote afbeelding';
modalTitle.style.display = 'none'; // Hidden but available for screen readers

modal.appendChild(modalTitle);
modal.appendChild(closeBtn);
modal.appendChild(modalImg);
document.body.appendChild(modal);

galleryImages.forEach(img => {
    // Make images keyboard accessible
    if (!img.hasAttribute('tabindex')) {
        img.setAttribute('tabindex', '0');
    }
    
    img.addEventListener('click', function() {
        openModal(this);
    });
    
    img.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openModal(this);
        }
    });
});

function openModal(imgElement) {
    modal.style.display = 'block';
    modalImg.src = imgElement.src;
    modalImg.alt = imgElement.alt;
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    closeBtn.focus(); // Focus on close button for accessibility
}

function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeBtn.onclick = closeModal;

closeBtn.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeModal();
    }
});

window.onclick = function(event) {
    if (event.target == modal) {
        closeModal();
    }
}

console.log("Casa Mi Sueño JavaScript loaded.");

document.addEventListener('DOMContentLoaded', () => {
    // Check for form submission success from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
        // Show appropriate thank you message based on page
        const thankYouMessage = document.querySelector('.thank-you-message');
        if (thankYouMessage) {
            const form = document.querySelector('form');
            if (form) {
                form.style.display = 'none';
            }
            thankYouMessage.style.display = 'block';
            thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        // Clean URL by removing success parameter
        const cleanUrl = window.location.pathname;
        window.history.replaceState(null, '', cleanUrl);
    }

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

    // Enhanced Image Gallery Modal
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
                document.body.style.overflow = 'hidden';
                closeModal.focus();
            });
            
            // Keyboard support for gallery images
            image.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    modal.style.display = 'block';
                    modalImg.src = this.src;
                    modalImg.alt = this.alt;
                    if (modalCaption) {
                        modalCaption.textContent = this.alt;
                    }
                    document.body.style.overflow = 'hidden';
                    closeModal.focus();
                }
            });
        });

        closeModal.addEventListener('click', () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close modal when clicking outside the image
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Check if the click is on the modal background itself
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
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

    // Booking Page Calendar Logic with Google Sheets Integration
    const calendarDaysContainer = document.getElementById('calendarDays');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const loadingStatus = document.getElementById('calendarLoadingStatus');
    const errorStatus = document.getElementById('calendarErrorStatus');

    if (calendarDaysContainer && currentMonthYearElement && prevMonthBtn && nextMonthBtn) {
        let currentDate = new Date();
        let bookedDates = []; // Will be populated from Google Sheets
        let selectedDates = []; // To store selected start and end dates
        let isLoadingBookedDates = true;

        // Configuration for Google Sheets integration
        const GOOGLE_SHEETS_CONFIG = {
            // Sheetbest API endpoint for Casa Mi Sueño booked dates
            jsonEndpoint: 'https://api.sheetbest.com/sheets/821c7f96-b3a5-4916-b146-7aaee27c6076',
            fallbackDates: [] // Fallback dates if API fails
        };

        // Fetch booked dates from Google Sheets
        async function fetchBookedDates() {
            if (!GOOGLE_SHEETS_CONFIG.jsonEndpoint || GOOGLE_SHEETS_CONFIG.jsonEndpoint === 'YOUR_GOOGLE_SHEETS_JSON_ENDPOINT_HERE') {
                console.log('Google Sheets endpoint not configured, using fallback.');
                isLoadingBookedDates = false;
                hideLoadingStatus();
                return;
            }

            try {
                showLoadingStatus();
                console.log('Fetching booked dates from Casa Mi Sueño booking system...');
                
                const response = await fetch(GOOGLE_SHEETS_CONFIG.jsonEndpoint);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                console.log('Raw data from API:', data);
                
                let dates = [];
                
                if (Array.isArray(data)) {
                    // Handle Sheetbest API format: [{"geboekte_datum": "2025-05-28"}, ...]
                    dates = data
                        .filter(item => item && item.geboekte_datum)
                        .map(item => item.geboekte_datum);
                } else if (data.values && Array.isArray(data.values)) {
                    // Google Sheets API format (fallback)
                    dates = data.values.flat().filter(date => date && date.trim());
                } else {
                    throw new Error('Unexpected data format from booking API');
                }

                // Validate and format dates
                bookedDates = dates.map(date => {
                    const dateString = String(date).trim();
                    // Validate ISO date format (YYYY-MM-DD)
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (dateRegex.test(dateString)) {
                        return dateString;
                    }
                    console.warn('Invalid date format found:', dateString);
                    return null;
                }).filter(date => date !== null);

                console.log(`Successfully loaded ${bookedDates.length} booked dates:`, bookedDates);
                isLoadingBookedDates = false;
                hideLoadingStatus();
                renderCalendar(currentDate); // Re-render with loaded data
                
            } catch (error) {
                console.error('Error fetching booked dates from Casa Mi Sueño system:', error);
                bookedDates = GOOGLE_SHEETS_CONFIG.fallbackDates || [];
                isLoadingBookedDates = false;
                showErrorStatus();
                renderCalendar(currentDate); // Render with fallback data
            }
        }

        function showLoadingStatus() {
            if (loadingStatus) {
                loadingStatus.style.display = 'block';
            }
            if (errorStatus) {
                errorStatus.style.display = 'none';
            }
        }

        function hideLoadingStatus() {
            if (loadingStatus) {
                loadingStatus.style.display = 'none';
            }
        }

        function showErrorStatus() {
            if (errorStatus) {
                errorStatus.style.display = 'block';
            }
            hideLoadingStatus();
        }

        function renderCalendar(date) {
            calendarDaysContainer.innerHTML = '';
            const year = date.getFullYear();
            const month = date.getMonth();
            const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
            currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

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

                // Determine cell state
                if (cellDate < today) {
                    dayCell.classList.add('past-date');
                    dayCell.title = 'Datum ligt in het verleden';
                } else if (bookedDates.includes(cellDateString)) {
                    dayCell.classList.add('booked');
                    dayCell.title = 'Reeds geboekt - niet beschikbaar';
                    dayCell.setAttribute('data-tooltip', 'Deze datum is al bezet');
                } else {
                    dayCell.classList.add('available');
                    dayCell.title = 'Beschikbaar voor reservering';
                    
                    // Add click handler for available dates
                    dayCell.addEventListener('click', () => {
                        handleDateSelection(cellDateString, dayCell);
                    });
                }

                if (cellDate.toDateString() === today.toDateString()) {
                    dayCell.classList.add('today');
                }

                calendarDaysContainer.appendChild(dayCell);
            }

            // Re-apply selected range highlighting if we have a valid range
            if (selectedDates.length === 2) {
                highlightDateRange(selectedDates[0], selectedDates[1]);
            } else if (selectedDates.length === 1) {
                // Re-apply single date selection
                const [sYear, sMonth, sDay] = selectedDates[0].split('-').map(Number);
                if (sYear === year && (sMonth - 1) === month) {
                    const dayElem = Array.from(calendarDaysContainer.children).find(d => 
                        d.textContent === String(sDay) && !d.classList.contains('empty')
                    );
                    if (dayElem) {
                        dayElem.classList.add('selected');
                    }
                }
            }
        }

        function handleDateSelection(dateString, dayCell) {
            if (dayCell.classList.contains('booked') || dayCell.classList.contains('past-date')) {
                return; // Don't allow selection of booked or past dates
            }

            // Clear any existing error messages
            clearRangeErrorMessage();

            if (selectedDates.length === 0) {
                // First date selection
                selectedDates.push(dateString);
                dayCell.classList.add('selected');
                
                // Update checkin field
                if (document.getElementById('checkin')) {
                    document.getElementById('checkin').value = dateString;
                }
                
                // Show reset button
                showResetButton();
                
            } else if (selectedDates.length === 1) {
                const firstDate = new Date(selectedDates[0]);
                const secondDate = new Date(dateString);
                
                // Ensure second date is after first date
                if (secondDate <= firstDate) {
                    // If second date is before or same as first, start over with new selection
                    clearSelectedDates();
                    selectedDates.push(dateString);
                    dayCell.classList.add('selected');
                    if (document.getElementById('checkin')) {
                        document.getElementById('checkin').value = dateString;
                    }
                    if (document.getElementById('checkout')) {
                        document.getElementById('checkout').value = '';
                    }
                    showRangeErrorMessage("Vertrekdatum moet na aankomstdatum zijn. Begin opnieuw.");
                    showResetButton();
                    return;
                }
                
                // Check if range contains booked dates
                const dateRange = getDateRange(selectedDates[0], dateString);
                const conflictingDates = dateRange.filter(date => bookedDates.includes(date));
                
                if (conflictingDates.length > 0) {
                    showRangeErrorMessage("Eén of meer van de geselecteerde dagen zijn al geboekt. Kies een ander bereik.");
                    return;
                }
                
                // Valid range selection
                selectedDates.push(dateString);
                highlightDateRange(selectedDates[0], dateString);
                
                // Update checkout field
                if (document.getElementById('checkout')) {
                    document.getElementById('checkout').value = dateString;
                }
                
            } else {
                // Third click - reset and start over
                clearSelectedDates();
                selectedDates.push(dateString);
                dayCell.classList.add('selected');
                
                if (document.getElementById('checkin')) {
                    document.getElementById('checkin').value = dateString;
                }
                if (document.getElementById('checkout')) {
                    document.getElementById('checkout').value = '';
                }
                showResetButton();
            }
        }

        function getDateRange(startDate, endDate) {
            const dates = [];
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dateString = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                dates.push(dateString);
            }
            
            return dates;
        }

        function highlightDateRange(startDate, endDate) {
            // Clear all existing selections
            document.querySelectorAll('.calendar-days div.selected, .calendar-days div.range').forEach(d => {
                d.classList.remove('selected', 'range', 'range-start', 'range-end');
            });
            
            const dateRange = getDateRange(startDate, endDate);
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            dateRange.forEach((date, index) => {
                const [dateYear, dateMonth, dateDay] = date.split('-').map(Number);
                
                // Only highlight dates in current month view
                if (dateYear === year && (dateMonth - 1) === month) {
                    const dayElement = Array.from(calendarDaysContainer.children).find(d => 
                        d.textContent === String(dateDay) && !d.classList.contains('empty')
                    );
                    
                    if (dayElement) {
                        if (index === 0) {
                            dayElement.classList.add('range-start');
                        } else if (index === dateRange.length - 1) {
                            dayElement.classList.add('range-end');
                        } else {
                            dayElement.classList.add('range');
                        }
                    }
                }
            });
        }

        function showRangeErrorMessage(message) {
            clearRangeErrorMessage();
            
            // Create error message element
            const errorDiv = document.createElement('div');
            errorDiv.id = 'calendar-range-error';
            errorDiv.className = 'calendar-error-message';
            errorDiv.textContent = message;
            errorDiv.style.cssText = `
                background-color: #fee;
                border: 1px solid #e74c3c;
                color: #e74c3c;
                padding: 12px;
                border-radius: 8px;
                margin-top: 16px;
                text-align: center;
                font-size: 0.95rem;
                animation: fadeIn 0.3s ease-in;
            `;
            
            // Insert after calendar container
            const calendarContainer = document.querySelector('.calendar-container');
            if (calendarContainer && calendarContainer.parentNode) {
                calendarContainer.parentNode.insertBefore(errorDiv, calendarContainer.nextSibling);
            }
            
            // Auto-hide after 5 seconds
            setTimeout(clearRangeErrorMessage, 5000);
        }

        function clearRangeErrorMessage() {
            const existingError = document.getElementById('calendar-range-error');
            if (existingError) {
                existingError.remove();
            }
        }

        function clearSelectedDates() {
            document.querySelectorAll('.calendar-days div.selected, .calendar-days div.range, .calendar-days div.range-start, .calendar-days div.range-end').forEach(d => {
                d.classList.remove('selected', 'range', 'range-start', 'range-end');
            });
            selectedDates = [];
            clearRangeErrorMessage();
            hideResetButton();
            
            // Clear form fields
            if (document.getElementById('checkin')) {
                document.getElementById('checkin').value = '';
            }
            if (document.getElementById('checkout')) {
                document.getElementById('checkout').value = '';
            }
        }

        function showResetButton() {
            const resetBtn = document.getElementById('resetCalendarSelection');
            if (resetBtn) {
                resetBtn.style.display = 'inline-block';
            }
        }

        function hideResetButton() {
            const resetBtn = document.getElementById('resetCalendarSelection');
            if (resetBtn) {
                resetBtn.style.display = 'none';
            }
        }

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(currentDate);
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(currentDate);
        });

        // Add reset button functionality
        const resetBtn = document.getElementById('resetCalendarSelection');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                clearSelectedDates();
            });
        }

        // Initialize calendar
        renderCalendar(currentDate);
        
        // Fetch booked dates from Google Sheets
        fetchBookedDates();
    }

    // Handle Enhanced Booking Form Submission
    const bookingForm = document.querySelector('.booking-form');
    const thankYouMessage = document.querySelector('.thank-you-message');

    if (bookingForm && thankYouMessage) {
        bookingForm.addEventListener('submit', function(event) {
            let isValid = true;
            const requiredFields = this.querySelectorAll('[required]');
            
            // Clear previous error states
            this.querySelectorAll('.error-message').forEach(error => {
                error.style.display = 'none';
            });
            this.querySelectorAll('input, textarea').forEach(input => {
                input.style.borderColor = 'var(--color-border)';
            });

            requiredFields.forEach(input => {
                const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
                
                if (!input.value.trim()) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                    if (errorElement) {
                        errorElement.style.display = 'block';
                    }
                } else if (input.type === 'email' && !validateEmail(input.value)) {
                    isValid = false;
                    input.style.borderColor = '#e74c3c';
                    if (errorElement) {
                        errorElement.textContent = 'Vul een geldig e-mailadres in (moet @ bevatten)';
                        errorElement.style.display = 'block';
                    }
                } else {
                    input.style.borderColor = 'var(--color-border)';
                    if (errorElement) {
                        errorElement.style.display = 'none';
                    }
                }
            });

            // Additional validation for date fields
            const checkinField = this.querySelector('#checkin');
            const checkoutField = this.querySelector('#checkout');
            
            if (checkinField && checkoutField && checkinField.value && checkoutField.value) {
                const checkinDate = new Date(checkinField.value);
                const checkoutDate = new Date(checkoutField.value);
                const today = new Date();
                today.setHours(0,0,0,0);
                
                if (checkinDate < today) {
                    isValid = false;
                    checkinField.style.borderColor = '#e74c3c';
                    const errorElement = document.getElementById('checkin-error');
                    if (errorElement) {
                        errorElement.textContent = 'Aankomstdatum kan niet in het verleden liggen';
                        errorElement.style.display = 'block';
                    }
                }
                
                if (checkoutDate <= checkinDate) {
                    isValid = false;
                    checkoutField.style.borderColor = '#e74c3c';
                    const errorElement = document.getElementById('checkout-error');
                    if (errorElement) {
                        errorElement.textContent = 'Vertrekdatum moet na de aankomstdatum zijn';
                        errorElement.style.display = 'block';
                    }
                }
            }

            if (!isValid) {
                event.preventDefault();
                // Focus on first error field
                const firstError = this.querySelector('input[style*="border-color: rgb(231, 76, 60)"], input[style*="border-color: #e74c3c"]');
                if (firstError) {
                    firstError.focus();
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            // If valid, allow form to submit naturally to Formspree
        });
    }

    console.log("Modern Casa Mi Sueño JavaScript loaded.");
}); 