/**
 * TaskPulse - Utility Functions
 */

// Format date to readable string
function formatDate(dateString, options = {}) {
    const date = new Date(dateString);
    const defaultOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        ...options
    };
    return date.toLocaleDateString('en-US', defaultOptions);
}

// Format date to input value
function formatDateForInput(dateString) {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Get relative time (e.g., "2 hours ago")
function getRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return formatDate(dateString);
}

// Get initials from name
function getInitials(name) {
    if (!name) return 'U';
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

// Capitalize first letter
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Truncate text
function truncate(str, length = 50) {
    if (!str || str.length <= length) return str;
    return str.slice(0, length) + '...';
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Show toast notification
function showToast(message, type = 'info', duration = 4000) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <div class="toast-content">
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;

    container.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Show loading overlay
function showLoading() {
    let overlay = document.querySelector('.loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Get status badge class
function getStatusBadgeClass(status) {
    const statusClasses = {
        'Submitted': 'badge-primary',
        'Reviewed': 'badge-success',
        'Pending': 'badge-warning'
    };
    return statusClasses[status] || 'badge-secondary';
}

// Get status dot class
function getStatusDotClass(status) {
    const statusClasses = {
        'Submitted': 'submitted',
        'Reviewed': 'reviewed',
        'Pending': 'pending'
    };
    return statusClasses[status] || 'pending';
}

// Format hours worked
function formatHours(hours) {
    if (hours === 1) return '1 hour';
    return `${hours} hours`;
}

// Check if same day
function isSameDay(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
}

// Check if today
function isToday(dateString) {
    return isSameDay(new Date(dateString), new Date());
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Parse tasks from form
function parseTasksFromForm(container) {
    const taskItems = container.querySelectorAll('.task-item');
    const tasks = [];

    taskItems.forEach(item => {
        const title = item.querySelector('.task-title')?.value?.trim();
        const category = item.querySelector('.task-category')?.value;

        if (title) {
            tasks.push({ title, category });
        }
    });

    return tasks;
}

// Create task item HTML
function createTaskItemHTML(task = {}) {
    return `
    <div class="task-item">
      <input type="text" class="form-control task-title" placeholder="Task description" value="${escapeHtml(task.title || '')}">
      <select class="form-control form-select task-category">
        <option value="development" ${task.category === 'development' ? 'selected' : ''}>Development</option>
        <option value="meeting" ${task.category === 'meeting' ? 'selected' : ''}>Meeting</option>
        <option value="review" ${task.category === 'review' ? 'selected' : ''}>Review</option>
        <option value="documentation" ${task.category === 'documentation' ? 'selected' : ''}>Documentation</option>
        <option value="testing" ${task.category === 'testing' ? 'selected' : ''}>Testing</option>
        <option value="other" ${task.category === 'other' ? 'selected' : ''}>Other</option>
      </select>
      <button type="button" class="btn btn-ghost btn-icon remove-task-btn" onclick="this.parentElement.remove()">✕</button>
    </div>
  `;
}

// Mobile menu toggle
function setupMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (toggle && sidebar) {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) &&
                !toggle.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    }
}

// Initialize common elements
document.addEventListener('DOMContentLoaded', () => {
    setupMobileMenu();

    // Update user info in sidebar
    const user = auth.getUser();
    if (user) {
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        const userAvatarEl = document.querySelector('.user-avatar');

        if (userNameEl) userNameEl.textContent = user.name;
        if (userRoleEl) userRoleEl.textContent = user.role;
        if (userAvatarEl) userAvatarEl.textContent = getInitials(user.name);
    }
});
