document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const userSelect = document.getElementById('userSelect');
    const passwordChangeForm = document.getElementById('passwordChangeForm');
    const userIdInput = document.getElementById('userId');
    const successAlert = document.querySelector('.alert-success');
    const errorAlert = document.querySelector('.alert-error');

    // Initialize
    initializeEventListeners();
    hideAlerts();

    function initializeEventListeners() {
        // User selection change
        userSelect.addEventListener('change', handleUserChange);

        // Form submission
        passwordChangeForm.addEventListener('submit', handleFormSubmit);
    }

    function handleUserChange() {
        const userId = userSelect.value;
        if (!userId) {
            passwordChangeForm.style.display = 'none';
            return;
        }

        // Show the form and set the user ID
        passwordChangeForm.style.display = 'block';
        userIdInput.value = userId;
    }

    async function handleFormSubmit(event) {
        event.preventDefault();

        const userId = userIdInput.value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (newPassword !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        // Validate password strength
        if (newPassword.length < 8) {
            showError('Password must be at least 8 characters long');
            return;
        }

        try {
            const response = await fetch('/dashboard/user/change-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({
                    user_id: userId,
                    new_password: newPassword
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to change password');
            }

            showSuccess('Password changed successfully');
            resetForm();
            
            // Scroll to top of the page smoothly
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } catch (error) {
            console.error('Error changing password:', error);
            showError(error.message || 'Failed to change password. Please try again.');
        }
    }

    function resetForm() {
        passwordChangeForm.reset();
        userSelect.value = '';
        passwordChangeForm.style.display = 'none';
    }

    function showSuccess(message) {
        successAlert.textContent = message;
        successAlert.style.display = 'block';
        errorAlert.style.display = 'none';
    }

    function showError(message) {
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
        successAlert.style.display = 'none';
    }

    function hideAlerts() {
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';
    }
}); 