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

// Helper function (can be defined early)
function validateEmail(email) {
    return email.includes('@') && email.length > 3;
}

// ---- PRICE CALCULATION LOGIC (Defined globally for access) ----
function isHighSeason(date) {
    const month = date.getMonth(); // 0 (Jan) to 11 (Dec)
    // June, July, August, September are high season
    return month >= 5 && month <= 8; 
}

function isDateRangeInHighSeason(startDate, endDate) {
    if (!startDate || !endDate || startDate >= endDate) {
        return false; 
    }
    let current = new Date(startDate);
    while (current < endDate) { 
        if (!isHighSeason(current)) {
            return false; 
        }
        current.setDate(current.getDate() + 1);
    }
    return true; 
}

function calculateAndDisplayPrice() {
    const checkinInput = document.getElementById('checkin');
    const checkoutInput = document.getElementById('checkout');
    const priceResultDiv = document.getElementById('price-calculation-result');

    if (!checkinInput || !checkoutInput || !priceResultDiv) {
        return; 
    }

    const checkinDateStr = checkinInput.value;
    const checkoutDateStr = checkoutInput.value;

    if (checkinDateStr && checkoutDateStr) {
        const checkinDate = new Date(checkinDateStr);
        const checkoutDate = new Date(checkoutDateStr);

        if (checkoutDate <= checkinDate) {
            priceResultDiv.innerHTML = '<p style="color: #e74c3c;">Vertrekdatum moet na aankomstdatum zijn.</p>';
            return;
        }

        const oneDay = 24 * 60 * 60 * 1000;
        const nights = Math.round(Math.abs((checkoutDate - checkinDate) / oneDay));

        if (nights <= 0) {
            priceResultDiv.innerHTML = ''; 
            return;
        }

        const highSeasonRate = 165;
        const inHighSeason = isDateRangeInHighSeason(checkinDate, checkoutDate);

        let message = '';
        if (inHighSeason) {
            const totalCost = nights * highSeasonRate;
            message = `Verblijf: ${nights} ${nights === 1 ? 'nacht' : 'nachten'} × €${highSeasonRate} = <strong>€${totalCost}</strong>`;
        } else {
            message = `Verblijf: ${nights} ${nights === 1 ? 'nacht' : 'nachten'} – prijs in overleg. <br><small>Indicatief vanaf €120 per nacht bij langer verblijf.</small>`;
        }
        priceResultDiv.innerHTML = `<p>${message}</p>`;

    } else {
        priceResultDiv.innerHTML = '<p>Selecteer aankomst- en vertrekdatum om de prijsindicatie te zien.</p>';
    }
}
// ---- END OF PRICE CALCULATION LOGIC ----

// Smooth scrolling for navigation links
document.querySelectorAll('header nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70, 
                behavior: 'smooth'
            });
        }
    });
});

// Enhanced form validation for all forms
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', function(event) {
        let isValid = true;
        const requiredFields = this.querySelectorAll('[required]');
        
        this.querySelectorAll('.error-message').forEach(error => {
            error.style.display = 'none';
        });
        this.querySelectorAll('input, textarea').forEach(input => {
            input.style.borderColor = 'var(--color-border)';
            input.removeAttribute('aria-invalid');
        });

        requiredFields.forEach(input => {
            const errorElement = document.getElementById(input.getAttribute('aria-describedby'));
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
                input.setAttribute('aria-invalid', 'true');
                if (errorElement) errorElement.style.display = 'block';
            } else if (input.type === 'email' && !validateEmail(input.value)) {
                isValid = false;
                input.style.borderColor = '#e74c3c';
                input.setAttribute('aria-invalid', 'true');
                if (errorElement) {
                    errorElement.textContent = 'Vul een geldig e-mailadres in (moet @ bevatten)';
                    errorElement.style.display = 'block';
                }
            }
        });

        const checkinField = this.querySelector('#checkin');
        const checkoutField = this.querySelector('#checkout');
        
        if (checkinField && checkoutField) { // Specific validation for booking form dates
            const checkinErrorElement = document.getElementById('checkin-error');
            const checkoutErrorElement = document.getElementById('checkout-error');
            if (checkinErrorElement) checkinErrorElement.style.display = 'none';
            if (checkoutErrorElement) checkoutErrorElement.style.display = 'none';
            
            if (checkinField.value && checkoutField.value) {
                const checkinDate = new Date(checkinField.value);
                const checkoutDate = new Date(checkoutField.value);
                const today = new Date();
                today.setHours(0,0,0,0);

                if (checkinDate < today) {
                    isValid = false;
                    checkinField.style.borderColor = '#e74c3c';
                    checkinField.setAttribute('aria-invalid', 'true');
                    if (checkinErrorElement) {
                        checkinErrorElement.textContent = 'Aankomstdatum kan niet in het verleden liggen';
                        checkinErrorElement.style.display = 'block';
                    }
                }
                if (checkoutDate <= checkinDate) {
                    isValid = false;
                    checkoutField.style.borderColor = '#e74c3c';
                    checkoutField.setAttribute('aria-invalid', 'true');
                    if (checkoutErrorElement) {
                        checkoutErrorElement.textContent = 'Vertrekdatum moet na de aankomstdatum zijn';
                        checkoutErrorElement.style.display = 'block';
                    }
                }
            } else { // Handle cases where one or both date fields are empty but required
                if (checkinField.hasAttribute('required') && !checkinField.value) {
                    isValid = false;
                    checkinField.style.borderColor = '#e74c3c';
                    checkinField.setAttribute('aria-invalid', 'true');
                    if (checkinErrorElement) {
                        checkinErrorElement.textContent = 'Selecteer een aankomstdatum';
                        checkinErrorElement.style.display = 'block';
            }
                }
                if (checkoutField.hasAttribute('required') && !checkoutField.value) {
                    isValid = false;
                    checkoutField.style.borderColor = '#e74c3c';
                    checkoutField.setAttribute('aria-invalid', 'true');
                    if (checkoutErrorElement) {
                        checkoutErrorElement.textContent = 'Selecteer een vertrekdatum';
                        checkoutErrorElement.style.display = 'block';
                    }
                }
            }
        }

        if (!isValid) {
            event.preventDefault();
            const firstError = this.querySelector('[aria-invalid="true"]');
            if (firstError) firstError.focus();
        }
    });
});

// Modal variables (declared globally, initialized in DOMContentLoaded)
let modal, modalImg, modalCaption, closeBtn, modalTitle, modalFigure;
let currentGalleryImages = [];
let currentIndex = 0;

// ---- MODAL HELPER FUNCTIONS (defined globally) ----
function openModal(imgElement) {
    if (!modal || !modalImg || !modalCaption) return; 
    modal.style.display = 'block';
    modalImg.src = imgElement.src;
    modalImg.alt = imgElement.alt;
    modalCaption.textContent = imgElement.alt;
    document.body.style.overflow = 'hidden';
    
    const parentGallery = imgElement.closest('.image-gallery-grid, .omgeving-showcase, .inspiration-grid');
    const allImagesInScope = document.querySelectorAll('.image-grid img, .gallery-image, .showcase-item img, .inspiration-image img');

    if (parentGallery) {
        currentGalleryImages = Array.from(parentGallery.querySelectorAll('.gallery-image, .showcase-item img, .inspiration-image img'));
        currentIndex = currentGalleryImages.indexOf(imgElement);
         if (currentIndex === -1) { 
            currentGalleryImages = Array.from(allImagesInScope);
            currentIndex = currentGalleryImages.indexOf(imgElement);
        }
    } else {
        currentGalleryImages = Array.from(allImagesInScope);
        currentIndex = currentGalleryImages.indexOf(imgElement);
    }
    if (closeBtn) closeBtn.focus();
}

function closeModal() {
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Global listener for modal keyboard navigation
document.addEventListener('keydown', function(e) {
    if (modal && modal.style.display === 'block') {
        if (e.key === 'ArrowRight') {
            if (currentGalleryImages.length > 0) {
                currentIndex = (currentIndex + 1) % currentGalleryImages.length;
                openModal(currentGalleryImages[currentIndex]);
            }
        } else if (e.key === 'ArrowLeft') {
            if (currentGalleryImages.length > 0) {
                currentIndex = (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
                openModal(currentGalleryImages[currentIndex]);
            }
        } else if (e.key === 'Escape') {
            closeModal();
        }
    }
});

// THE ONE AND ONLY DOMContentLoaded LISTENER
document.addEventListener('DOMContentLoaded', () => {
    // ---- MODAL DOM SETUP ----
    const galleryImageElements = document.querySelectorAll('.image-grid img, .gallery-image, .showcase-item img, .inspiration-image img');
    modal = document.createElement('div');
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

    modalTitle = document.createElement('h2');
    modalTitle.id = 'modal-title';
    modalTitle.style.position = 'absolute';
    modalTitle.style.top = '10px';
    modalTitle.style.left = '20px';
    modalTitle.style.color = '#f1f1f1';
    modalTitle.style.fontSize = '1.2rem';
    modalTitle.textContent = 'Vergrote afbeelding';
    modalTitle.style.display = 'none'; // Kept for consistency, though not explicitly shown

    closeBtn = document.createElement('span');
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

    modalFigure = document.createElement('figure');
    modalFigure.style.margin = '0';
    modalFigure.style.width = '100%';
    modalFigure.style.height = '100%';
    modalFigure.style.display = 'flex';
    modalFigure.style.flexDirection = 'column';
    modalFigure.style.justifyContent = 'center';
    modalFigure.style.alignItems = 'center';

    modalImg = document.createElement('img');
    modalImg.style.margin = 'auto'; 
    modalImg.style.display = 'block';
    modalImg.style.maxWidth = '80%';
    modalImg.style.maxHeight = '80%';

    modalCaption = document.createElement('figcaption');
    modalCaption.id = 'modalCaption';
    modalCaption.className = 'modal-caption'; // Use class for styling from style.css
    
    modalFigure.appendChild(modalImg);
    modalFigure.appendChild(modalCaption);
    modal.appendChild(modalTitle);
modal.appendChild(closeBtn);
    modal.appendChild(modalFigure);
document.body.appendChild(modal);

    galleryImageElements.forEach(img => {
        if (!img.hasAttribute('tabindex')) {
            img.setAttribute('tabindex', '0');
        }
        img.addEventListener('click', function() { openModal(this); });
        img.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault(); openModal(this);
            }
    });
});

    closeBtn.onclick = closeModal;
    closeBtn.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); closeModal(); }
    });
    modal.addEventListener('click', function(event) {
        if (event.target === modal) { closeModal(); }
    });
    // ---- END MODAL DOM SETUP ----

    // ---- FORMSPREE SUCCESS ----
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === '1') {
        const thankYouMessage = document.querySelector('.thank-you-message');
        if (thankYouMessage) {
            const formToHide = thankYouMessage.closest('form') || document.querySelector('form.contact-form, form.booking-form');
            if (formToHide) formToHide.style.display = 'none';
            thankYouMessage.style.display = 'block';
            thankYouMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        const cleanUrl = window.location.pathname;
        try { window.history.replaceState(null, '', cleanUrl); }
        catch (e) { console.warn("Could not clean URL:", e); }
    }
    // ---- END FORMSPREE SUCCESS ----

    // ---- MOBILE NAVIGATION ----
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
            navToggle.setAttribute('aria-expanded', String(!isExpanded));
            mainNav.classList.toggle('active');
        });
    }
    // ---- END MOBILE NAVIGATION ----

    // ---- FOOTER YEAR ----
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
    // ---- END FOOTER YEAR ----
    
    // ---- ACTIVE NAVIGATION LINK ----
    const currentLocation = window.location.href;
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = new URL(link.href, document.baseURI).pathname;
        const currentPath = new URL(currentLocation, document.baseURI).pathname;
        if (linkPath === currentPath || (linkPath.endsWith('index.html') && currentPath === '/')) {
            link.classList.add('active');
        }
    });
     // If no link is active (e.g. on root path without index.html explicitly) and home link exists, activate home.
    if (!document.querySelector('.main-nav a.active')) {
        const homeLink = document.querySelector('.main-nav a[href="index.html"], .main-nav a[href="/"]');
         if (homeLink && (new URL(currentLocation, document.baseURI).pathname === '/' || new URL(currentLocation, document.baseURI).pathname.endsWith('/index.html'))) {
            homeLink.classList.add('active');
        }
    }
    // ---- END ACTIVE NAVIGATION LINK ----

    // ---- FADE-IN ANIMATION ON SCROLL ----
    const fadeElements = document.querySelectorAll('.fade-in');
    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Special handling for enhanced booking page elements
                if (entry.target.classList.contains('enhanced-calendar')) {
                    entry.target.classList.add('visible');
                }
                if (entry.target.querySelector('.form-wrapper')) {
                    const formWrapper = entry.target.querySelector('.form-wrapper');
                    if (formWrapper) {
                        setTimeout(() => {
                            formWrapper.classList.add('visible');
                        }, 300); // Delay for staggered animation
                    }
                }
                }
            });
        }, { threshold: 0.1 });
        fadeElements.forEach(el => observer.observe(el));
    } else { 
        fadeElements.forEach(el => {
            el.classList.add('visible');
            // Fallback for browsers without IntersectionObserver
            const formWrapper = el.querySelector('.form-wrapper');
            if (formWrapper) formWrapper.classList.add('visible');
        });
    }
    // ---- END FADE-IN ANIMATION ----
    
    // ---- TESTIMONIAL STAR RATINGS ----
    const testimonialRatings = document.querySelectorAll('.testimonial-rating');
    testimonialRatings.forEach(ratingElement => {
        const rating = parseInt(ratingElement.dataset.rating, 10);
        if (!isNaN(rating) && rating >= 0 && rating <= 5) {
            ratingElement.innerHTML = ''; 
            for (let i = 1; i <= 5; i++) {
                const starSpan = document.createElement('span');
                starSpan.classList.add('star');
                starSpan.innerHTML = (i <= rating) ? '&#9733;' : '&#9734;'; 
                if (i <= rating) starSpan.classList.add('filled');
                ratingElement.appendChild(starSpan);
            }
        }
    });
    // ---- END TESTIMONIAL STAR RATINGS ----

    // ---- BOOKING PAGE SPECIFIC LOGIC ----
    const calendarDaysContainer = document.getElementById('calendarDays');
    const currentMonthYearElement = document.getElementById('currentMonthYear');
    const prevMonthBtnCal = document.getElementById('prevMonthBtn'); // Renamed to avoid conflict if any
    const nextMonthBtnCal = document.getElementById('nextMonthBtn'); // Renamed
    const calendarLoadingStatusEl = document.getElementById('calendarLoadingStatus');
    const calendarErrorStatusEl = document.getElementById('calendarErrorStatus');
    const resetCalendarSelectionBtnEl = document.getElementById('resetCalendarSelection');
    const checkinInputEl = document.getElementById('checkin');
    const checkoutInputEl = document.getElementById('checkout');

    if (calendarDaysContainer && currentMonthYearElement && prevMonthBtnCal && nextMonthBtnCal && checkinInputEl && checkoutInputEl) {
        
        let currentCalendarDate = new Date(); // Specific to calendar instance
        let bookedDatesList = [];    // Specific to calendar instance
        let selectedCalendarDates = []; // [startDate, endDate], specific to calendar instance

        const GOOGLE_SHEETS_CONFIG_CALENDAR = { // Scoped config
            jsonEndpoint: 'https://api.sheetbest.com/sheets/821c7f96-b3a5-4916-b146-7aaee27c6076', // Ensure this is your correct endpoint
            fallbackDates: [] 
        };

        function showCalLoadingStatus() {
            if (calendarLoadingStatusEl) calendarLoadingStatusEl.style.display = 'block';
            if (calendarErrorStatusEl) calendarErrorStatusEl.style.display = 'none';
        }

        function hideCalLoadingStatus() {
            if (calendarLoadingStatusEl) calendarLoadingStatusEl.style.display = 'none';
        }

        function showCalErrorStatus() {
            if (calendarErrorStatusEl) calendarErrorStatusEl.style.display = 'block';
            hideCalLoadingStatus();
        }
        
        function renderActualCalendar(dateToRender) {
            calendarDaysContainer.innerHTML = '';
            const year = dateToRender.getFullYear();
            const month = dateToRender.getMonth();
            const monthNames = ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"];
            currentMonthYearElement.textContent = `${monthNames[month]} ${year}`;

            const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) - 6 (Sat)
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Adjust firstDayOfMonth to be 0 (Mon) - 6 (Sun) if your week starts on Monday
            // const displayFirstDay = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; 
            // For now, assuming 0=Sunday as per default getDay()

            for (let i = 0; i < firstDayOfMonth; i++) {
                calendarDaysContainer.appendChild(document.createElement('div')).classList.add('empty');
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dayCell = document.createElement('div');
                dayCell.textContent = day;
                const cellDate = new Date(year, month, day);
                const cellDateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                
                dayCell.setAttribute('data-date', cellDateString); // CRITICAL FIX: Add data-date attribute
                dayCell.setAttribute('role', 'button');
                dayCell.tabIndex = 0;
                
                let statusText = 'Beschikbaar';

                if (cellDate < today) {
                    dayCell.classList.add('past-date');
                    statusText = 'Verleden';
                    dayCell.setAttribute('aria-disabled', 'true');
                } else if (bookedDatesList.includes(cellDateString)) {
                    dayCell.classList.add('booked');
                    dayCell.setAttribute('data-tooltip', 'Deze datum is helaas al bezet');
                    statusText = 'Bezet';
                    dayCell.setAttribute('aria-disabled', 'true');
                } else {
                    dayCell.classList.add('available');
                    dayCell.addEventListener('click', () => handleCalDateSelection(cellDateString, dayCell));
                    dayCell.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCalDateSelection(cellDateString, dayCell);
                        }
                    });
                }
                dayCell.setAttribute('aria-label', `${day} ${monthNames[month]} ${year} - ${statusText}`);

                if (cellDate.toDateString() === today.toDateString()) {
                    dayCell.classList.add('today');
                }
                calendarDaysContainer.appendChild(dayCell);
            }
            applyCalDateSelectionStyles();
        }

        function applyCalDateSelectionStyles() {
            // Reset all styles first
            document.querySelectorAll('.calendar-days div[data-date]').forEach(dayCell => {
                dayCell.classList.remove('selected', 'range', 'range-start', 'range-end', 'invalid-selection');
            });

            const [startDateStr, endDateStr] = selectedCalendarDates;

            // Apply start date styles
            if (startDateStr) {
                const startDateCell = findCalDayCell(startDateStr);
                if (startDateCell) {
                    startDateCell.classList.add('selected');
                    if (endDateStr) {
                        startDateCell.classList.add('range-start');
                    }
                }
            }

            // Apply end date styles
            if (endDateStr) {
                const endDateCell = findCalDayCell(endDateStr);
                if (endDateCell) {
                    endDateCell.classList.add('selected', 'range-end');
                }

                // Style days in between
                if (startDateStr) {
                    const range = getCalDateRange(startDateStr, endDateStr);
                    if (range.length > 2) {
                        for (let i = 1; i < range.length - 1; i++) {
                            const dayCellInRange = findCalDayCell(range[i]);
                            if (dayCellInRange) {
                                dayCellInRange.classList.add('range');
                            }
                        }
                    }
                }
            }
        }

        function findCalDayCell(dateString) {
            return document.querySelector(`.calendar-days div[data-date="${dateString}"]`);
        }

        function handleCalDateSelection(dateString, dayCell) {
            if (dayCell.classList.contains('past-date') || dayCell.classList.contains('booked')) {
                return;
            }

            clearCalRangeErrorMessage();
            const clickedDate = new Date(dateString + 'T00:00:00');
            const MIN_STAY_NIGHTS = 10;

            // If no dates are selected or we have a complete selection, start a new selection
            if (!selectedCalendarDates[0] || (selectedCalendarDates[0] && selectedCalendarDates[1])) {
                selectedCalendarDates = [dateString, null];
                window.updateBookingFormDates(clickedDate, null);
                showCalResetButton();
            } 
            // If we have a start date but no end date, try to complete the selection
            else if (selectedCalendarDates[0] && !selectedCalendarDates[1]) {
                const startDate = new Date(selectedCalendarDates[0] + 'T00:00:00');

                if (clickedDate <= startDate) {
                    // If clicked date is before or same as start date, make it the new start date
                    selectedCalendarDates = [dateString, null];
                    window.updateBookingFormDates(clickedDate, null);
                    showCalRangeErrorMessage("Aankomstdatum gewijzigd. Selecteer nu een vertrekdatum.");
                } else {
                    // Check if the range is valid
                    const range = getCalDateRange(selectedCalendarDates[0], dateString);
                    const isRangeValid = !range.some(d => bookedDatesList.includes(d) && d !== selectedCalendarDates[0] && d !== dateString);

                    if (isRangeValid) {
                        const nights = Math.ceil((clickedDate - startDate) / (1000 * 60 * 60 * 24));
                        
                        if (nights < MIN_STAY_NIGHTS) {
                            showCalRangeErrorMessage(`Minimaal ${MIN_STAY_NIGHTS} nachten vereist. U selecteerde ${nights} ${nights === 1 ? 'nacht' : 'nachten'}.`);
                            // Keep start date, allow selecting new end date
                            selectedCalendarDates[1] = null;
                            window.updateBookingFormDates(startDate, null);
                            
                            // Highlight invalid selection briefly
                            dayCell.classList.add('invalid-selection');
                            setTimeout(() => {
                                dayCell.classList.remove('invalid-selection');
                            }, 1500);
                        } else {
                            // Valid selection
                            selectedCalendarDates[1] = dateString;
                            window.updateBookingFormDates(startDate, clickedDate);
                        }
                    } else {
                        showCalRangeErrorMessage("Geselecteerde periode overlapt met bezette datums.");
                        selectedCalendarDates = [dateString, null];
                        window.updateBookingFormDates(clickedDate, null);
                    }
                }
            }

            applyCalDateSelectionStyles();
        }

        function getCalDateRange(startDateStr, endDateStr) {
            const startDate = new Date(startDateStr);
            const endDate = new Date(endDateStr);
            const range = [];
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                range.push(currentDate.toISOString().split('T')[0]);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return range;
        }
        
        function showCalRangeErrorMessage(message) {
            const errorElement = document.getElementById('calendarError');
            if (errorElement) {
                // Clear any existing timeouts
                if (errorElement.hideTimeout) {
                    clearTimeout(errorElement.hideTimeout);
                }
                
                // Set the message and show it immediately
                errorElement.textContent = message;
                errorElement.classList.add('visible');
                
                // Auto-hide after 5 seconds
                errorElement.hideTimeout = setTimeout(() => {
                    errorElement.classList.remove('visible');
                }, 5000);
            }
        }

        function clearCalRangeErrorMessage() {
            const errorElement = document.getElementById('calendarError');
            if (errorElement) {
                // Clear any existing timeouts
                if (errorElement.hideTimeout) {
                    clearTimeout(errorElement.hideTimeout);
                }
                errorElement.classList.remove('visible');
            }
        }

        function clearCalSelectedDatesAndForm() {
            selectedCalendarDates = [];
            window.updateBookingFormDates(null, null); // This will also call calculateAndDisplayPrice
            applyCalDateSelectionStyles();
            hideCalResetButton();
        }

        function showCalResetButton() {
            if (resetCalendarSelectionBtnEl) resetCalendarSelectionBtnEl.style.display = 'inline-block';
        }

        function hideCalResetButton() {
            if (resetCalendarSelectionBtnEl) resetCalendarSelectionBtnEl.style.display = 'none';
        }
        
        window.updateBookingFormDates = function(checkinDateObj, checkoutDateObj) {
            if (checkinInputEl && checkoutInputEl) {
                checkinInputEl.value = checkinDateObj ? checkinDateObj.toISOString().split('T')[0] : '';
                checkoutInputEl.value = checkoutDateObj ? checkoutDateObj.toISOString().split('T')[0] : '';
                
                checkinInputEl.dispatchEvent(new Event('change', { bubbles: true }));
                checkoutInputEl.dispatchEvent(new Event('change', { bubbles: true }));
                
                calculateAndDisplayPrice(); // Explicitly call price calculation
            }
        };

        async function fetchActualBookedDates() {
            if (!GOOGLE_SHEETS_CONFIG_CALENDAR.jsonEndpoint || GOOGLE_SHEETS_CONFIG_CALENDAR.jsonEndpoint.includes('YOUR_GOOGLE_SHEETS_JSON_ENDPOINT_HERE')) {
                console.warn('Google Sheets endpoint not configured for calendar, using fallback or no booked dates.');
                bookedDatesList = GOOGLE_SHEETS_CONFIG_CALENDAR.fallbackDates || [];
                hideCalLoadingStatus();
                renderActualCalendar(currentCalendarDate);
                return;
            }
            try {
                showCalLoadingStatus();
                const response = await fetch(GOOGLE_SHEETS_CONFIG_CALENDAR.jsonEndpoint);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                
                let datesFromApi = [];
                if (Array.isArray(data)) { // SheetBest format or similar array of objects
                    datesFromApi = data.filter(item => item && item.geboekte_datum).map(item => item.geboekte_datum);
                } else if (data.values && Array.isArray(data.values)) { // Google Sheets API direct format
                    datesFromApi = data.values.flat().filter(date => date && String(date).trim());
                } else {
                    throw new Error('Unexpected data format from booking API for calendar');
                }

                bookedDatesList = datesFromApi.map(date => {
                    const dateString = String(date).trim();
                    // Check for DD-MM-YYYY format
                    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
                        const [day, month, year] = dateString.split('-');
                        return `${year}-${month}-${day}`;
                    }
                    // Check for YYYY-MM-DD format
                    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                        return dateString;
                    }
                    return null;
                }).filter(date => date !== null);

            } catch (error) {
                console.error('Error fetching booked dates for calendar:', error);
                bookedDatesList = GOOGLE_SHEETS_CONFIG_CALENDAR.fallbackDates || [];
                showCalErrorStatus();
            } finally {
                hideCalLoadingStatus();
                renderActualCalendar(currentCalendarDate);
            }
        }

        // Attach event listeners for calendar navigation and inputs
        prevMonthBtnCal.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderActualCalendar(currentCalendarDate);
        });

        nextMonthBtnCal.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderActualCalendar(currentCalendarDate);
        });
        
        checkinInputEl.addEventListener('change', calculateAndDisplayPrice);
        checkoutInputEl.addEventListener('change', calculateAndDisplayPrice);

        if (resetCalendarSelectionBtnEl) {
            resetCalendarSelectionBtnEl.addEventListener('click', clearCalSelectedDatesAndForm);
        }

        // Initial fetch and render for the calendar
        fetchActualBookedDates();
        hideCalResetButton(); // Initially hide reset button
        
        // Initial call for price if form is present
        if (document.getElementById('price-calculation-result')) {
             calculateAndDisplayPrice();
            }
    }
    // ---- END BOOKING PAGE SPECIFIC LOGIC ----

    console.log("Casa Mi Sueño - DOMContentLoaded complete.");
}); // ---- END OF DOMContentLoaded ----

console.log("Casa Mi Sueño JavaScript fully loaded and initialized (end of script).");

// Back to top functionality
document.addEventListener('DOMContentLoaded', function() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        // Show/hide back to top button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
        
        // Smooth scroll to top when button is clicked
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Lazy loading for images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.onload = () => img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for browsers without IntersectionObserver
        lazyImages.forEach(img => img.classList.add('loaded'));
    }
    
    // Create lightbox
    createLightbox();
    
    // Add lightbox functionality to gallery images
    const galleryImages = document.querySelectorAll('.gallery-grid img, .photo-grid img');
    galleryImages.forEach((img, index) => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => openLightbox(img, index, galleryImages));
    });
});

// Lightbox functionality
function createLightbox() {
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.id = 'lightbox';
    lightbox.innerHTML = `
        <div class="lightbox-content">
            <button class="lightbox-close" aria-label="Sluiten">&times;</button>
            <button class="lightbox-nav lightbox-prev" aria-label="Vorige">&#10094;</button>
            <img class="lightbox-image" alt="">
            <button class="lightbox-nav lightbox-next" aria-label="Volgende">&#10095;</button>
        </div>
    `;
    document.body.appendChild(lightbox);
    
    // Close lightbox when clicking outside image or on close button
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            closeLightbox();
        }
    });
    
    // Close lightbox with ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            closeLightbox();
        }
    });
}

let currentImageIndex = 0;
let currentImageArray = [];

function openLightbox(img, index, imageArray) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    
    currentImageIndex = index;
    currentImageArray = imageArray;
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    // Show/hide navigation buttons
    prevBtn.style.display = imageArray.length > 1 ? 'block' : 'none';
    nextBtn.style.display = imageArray.length > 1 ? 'block' : 'none';
    
    // Add navigation event listeners
    prevBtn.onclick = () => navigateLightbox(-1);
    nextBtn.onclick = () => navigateLightbox(1);
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex >= currentImageArray.length) {
        currentImageIndex = 0;
    } else if (currentImageIndex < 0) {
        currentImageIndex = currentImageArray.length - 1;
    }
    
    const lightboxImg = document.querySelector('.lightbox-image');
    const newImg = currentImageArray[currentImageIndex];
    lightboxImg.src = newImg.src;
    lightboxImg.alt = newImg.alt;
} 