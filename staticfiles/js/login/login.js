import { login } from '../api/auth.js';

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const loginAlert = document.getElementById('login-alert');
    const loginBtn = document.querySelector('.login-btn');
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    // Toggle password visibility
    if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle eye icon
            const eyeIcon = this.querySelector('i');
            if (eyeIcon) {
                eyeIcon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        lucide.createIcons();
            }
    });
    }
    
    // Handle form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
            // Reset alert
            loginAlert.classList.add('d-none');
            loginAlert.textContent = '';
            
            // Get form data
            const username = document.getElementById('username').value.trim();
            const password = passwordInput.value;
        
            // Validate form
            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }
            
            try {
                // Show loading state
                setLoading(true);
                
                // Attempt login
                const response = await login(username, password);
                
                // Redirect to dashboard on success
                window.location.href = '/dashboard/';
                
            } catch (error) {
                showError(error.message || 'Login failed. Please check your credentials.');
            } finally {
                setLoading(false);
            }
        });
    }

    // Show error message
    function showError(message) {
        loginAlert.textContent = message;
        loginAlert.classList.remove('d-none');
    }

    // Set loading state
    function setLoading(isLoading) {
        if (loginBtn) {
            loginBtn.disabled = isLoading;
            loginBtn.innerHTML = isLoading ? 
                '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Signing in...' : 
                'Sign In';
        }
    }

    // Handle enter key
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !loginBtn.disabled) {
            loginForm.dispatchEvent(new Event('submit'));
}
    });
}); 