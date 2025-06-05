// Verwijder de data-translate-form gerelateerde code
document.addEventListener('DOMContentLoaded', function() {
    // Form validatie en verzending logica
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Form validatie en verzending logica hier
    });
});

// Contact form translations
const contactFormTranslations = {
    nl: {
        name: {
            label: "Naam",
            placeholder: "Uw naam",
            required: "Naam is verplicht"
        },
        email: {
            label: "E-mailadres",
            placeholder: "uw@email.nl",
            required: "E-mailadres is verplicht",
            invalid: "Voer een geldig e-mailadres in"
        },
        phone: {
            label: "Telefoonnummer",
            placeholder: "Uw telefoonnummer",
            required: "Telefoonnummer is verplicht"
        },
        message: {
            label: "Bericht",
            placeholder: "Uw bericht",
            required: "Bericht is verplicht"
        },
        submit: "Versturen",
        success: "Bedankt voor uw bericht! We nemen zo spoedig mogelijk contact met u op.",
        error: "Er is een fout opgetreden. Probeer het later opnieuw."
    },
    en: {
        name: {
            label: "Name",
            placeholder: "Your name",
            required: "Name is required"
        },
        email: {
            label: "Email address",
            placeholder: "your@email.com",
            required: "Email address is required",
            invalid: "Please enter a valid email address"
        },
        phone: {
            label: "Phone number",
            placeholder: "Your phone number",
            required: "Phone number is required"
        },
        message: {
            label: "Message",
            placeholder: "Your message",
            required: "Message is required"
        },
        submit: "Send",
        success: "Thank you for your message! We will contact you as soon as possible.",
        error: "An error occurred. Please try again later."
    },
    es: {
        name: {
            label: "Nombre",
            placeholder: "Su nombre",
            required: "El nombre es obligatorio"
        },
        email: {
            label: "Correo electrónico",
            placeholder: "su@email.com",
            required: "El correo electrónico es obligatorio",
            invalid: "Por favor, introduzca un correo electrónico válido"
        },
        phone: {
            label: "Número de teléfono",
            placeholder: "Su número de teléfono",
            required: "El número de teléfono es obligatorio"
        },
        message: {
            label: "Mensaje",
            placeholder: "Su mensaje",
            required: "El mensaje es obligatorio"
        },
        submit: "Enviar",
        success: "¡Gracias por su mensaje! Nos pondremos en contacto con usted lo antes posible.",
        error: "Se ha producido un error. Por favor, inténtelo de nuevo más tarde."
    }
};

// Function to update contact form translations
function updateContactFormTranslations(lang) {
    const translations = contactFormTranslations[lang];
    if (!translations) return;

    // Update form labels and placeholders
    document.querySelectorAll('[data-translate-form]').forEach(element => {
        const keys = element.getAttribute('data-translate-form').split('.');
        let value = translations;
        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                value = null;
                break;
            }
        }
        if (value) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = value;
            } else if (element.tagName === 'LABEL') {
                element.textContent = value;
            } else if (element.tagName === 'BUTTON') {
                element.textContent = value;
            }
        }
    });
}

// Function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate form
function validateForm(form, lang) {
    const translations = window.translations.contact.form;
    let isValid = true;
    const errors = {};

    // Validate name
    const name = form.querySelector('[name="name"]');
    if (!name.value.trim()) {
        errors.name = translations.name.label[lang] + ' ' + translations.required[lang];
        isValid = false;
    }

    // Validate email
    const email = form.querySelector('[name="email"]');
    if (!email.value.trim()) {
        errors.email = translations.email.label[lang] + ' ' + translations.required[lang];
        isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
        errors.email = translations.email.invalid[lang];
        isValid = false;
    }

    // Validate phone
    const phone = form.querySelector('[name="phone"]');
    if (!phone.value.trim()) {
        errors.phone = translations.phone.label[lang] + ' ' + translations.required[lang];
        isValid = false;
    }

    // Validate message
    const message = form.querySelector('[name="message"]');
    if (!message.value.trim()) {
        errors.message = translations.message.label[lang] + ' ' + translations.required[lang];
        isValid = false;
    }

    // Display errors
    Object.keys(errors).forEach(field => {
        const errorElement = form.querySelector(`[name="${field}"]`).nextElementSibling;
        if (errorElement && errorElement.classList.contains('error-message')) {
            errorElement.textContent = errors[field];
            errorElement.style.display = 'block';
        }
    });

    return isValid;
}

// Initialize contact form
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;

    // Add error message elements
    const formFields = contactForm.querySelectorAll('input, textarea');
    formFields.forEach(field => {
        const errorElement = document.createElement('div');
        errorElement.classList.add('error-message');
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    });

    // Handle form submission
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const lang = document.documentElement.lang;
        if (!validateForm(contactForm, lang)) return;

        const formData = new FormData(contactForm);
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                contactForm.reset();
                const successMessage = document.querySelector('.thank-you-message');
                if (successMessage) {
                    successMessage.style.display = 'block';
                }
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(window.translations.contact.form.error[lang]);
        }
    });
});

// Export functions for use in other scripts
window.updateContactFormTranslations = updateContactFormTranslations; 