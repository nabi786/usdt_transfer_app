// Socket.io connection
const socket = io();

// Global variables
let currentUser = null;

// DOM elements
const registerForm = document.getElementById('registerForm');
const transferForm = document.getElementById('transferForm');
const balanceAmount = document.getElementById('balanceAmount');
const notificationsList = document.getElementById('notificationsList');
const transferHistoryList = document.getElementById('transferHistoryList');
const loading = document.getElementById('loading');
const successAlert = document.getElementById('successAlert');
const errorAlert = document.getElementById('errorAlert');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    // Load saved user data
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForUser();
    }

    // Setup event listeners
    setupEventListeners();
    setupSocketListeners();
});

function setupEventListeners() {
    // Registration form
    registerForm.addEventListener('submit', handleRegistration);

    // Transfer form
    transferForm.addEventListener('submit', handleTransfer);
}

function setupSocketListeners() {
    // Listen for transfer notifications
    socket.on('transfer_sent', (data) => {
        showAlert(`Transfer sent successfully! Amount: ${data.amount} DUSDT to ${data.to}`, 'success');
        loadNotifications();
        loadTransferHistory();
    });

    socket.on('transfer_received', (data) => {
        showAlert(`Transfer received! Amount: ${data.amount} DUSDT from ${data.from}`, 'success');
        loadNotifications();
        loadTransferHistory();
    });
}

async function handleRegistration(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const userData = {
        binanceId: formData.get('binanceId'),
        tronAddress: formData.get('tronAddress'),
        email: formData.get('email')
    };

    try {
        showLoading(true);
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            currentUser = userData;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateUIForUser();
            showAlert('Registration successful!', 'success');
            registerForm.reset();
        } else {
            showAlert(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function handleTransfer(e) {
    e.preventDefault();
    
    const formData = new FormData(transferForm);
    const transferData = {
        fromBinanceId: formData.get('fromBinanceId'),
        toBinanceId: formData.get('toBinanceId'),
        amount: parseFloat(formData.get('amount'))
    };

    try {
        showLoading(true);
        const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transferData)
        });

        const result = await response.json();

        if (response.ok) {
            showAlert(`Transfer successful! Transaction: ${result.transactionHash}`, 'success');
            transferForm.reset();
            checkBalance();
        } else {
            showAlert(result.error || 'Transfer failed', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    } finally {
        showLoading(false);
    }
}

async function checkBalance() {
    const binanceId = document.getElementById('balanceBinanceId').value || 
                     (currentUser ? currentUser.binanceId : '');
    
    if (!binanceId) {
        showAlert('Please enter a Binance ID', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/balance/${binanceId}`);
        const result = await response.json();

        if (response.ok) {
            balanceAmount.textContent = result.balance.toFixed(6);
        } else {
            showAlert(result.error || 'Failed to get balance', 'error');
        }
    } catch (error) {
        showAlert('Network error. Please try again.', 'error');
    }
}

async function loadNotifications() {
    const binanceId = currentUser ? currentUser.binanceId : '';
    
    if (!binanceId) {
        notificationsList.innerHTML = '<p>Please register first to view notifications</p>';
        return;
    }

    try {
        const response = await fetch(`/api/notifications/${binanceId}`);
        const result = await response.json();

        if (response.ok) {
            displayNotifications(result.notifications);
        } else {
            notificationsList.innerHTML = '<p>Failed to load notifications</p>';
        }
    } catch (error) {
        notificationsList.innerHTML = '<p>Error loading notifications</p>';
    }
}

function displayNotifications(notifications) {
    if (notifications.length === 0) {
        notificationsList.innerHTML = '<p>No notifications yet</p>';
        return;
    }

    const notificationsHTML = notifications.map(notification => `
        <div class="notification-item ${notification.isRead ? '' : 'unread'}">
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                <div class="notification-time">
                    ${new Date(notification.createdAt).toLocaleString()}
                </div>
            </div>
            ${!notification.isRead ? '<button onclick="markAsRead(\'' + notification._id + '\')" class="btn" style="width: auto; padding: 5px 10px; font-size: 12px;">Mark Read</button>' : ''}
        </div>
    `).join('');

    notificationsList.innerHTML = notificationsHTML;
}

async function markAsRead(notificationId) {
    try {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ binanceId: currentUser.binanceId })
        });

        if (response.ok) {
            loadNotifications();
        }
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
}

async function loadTransferHistory() {
    const binanceId = document.getElementById('historyBinanceId').value || 
                     (currentUser ? currentUser.binanceId : '');
    
    if (!binanceId) {
        transferHistoryList.innerHTML = '<p>Please enter a Binance ID</p>';
        return;
    }

    try {
        const response = await fetch(`/api/transfers/${binanceId}`);
        const result = await response.json();

        if (response.ok) {
            displayTransferHistory(result.transfers, binanceId);
        } else {
            transferHistoryList.innerHTML = '<p>Failed to load transfer history</p>';
        }
    } catch (error) {
        transferHistoryList.innerHTML = '<p>Error loading transfer history</p>';
    }
}

function displayTransferHistory(transfers, binanceId) {
    if (transfers.length === 0) {
        transferHistoryList.innerHTML = '<p>No transfer history yet</p>';
        return;
    }

    const historyHTML = transfers.map(transfer => {
        const isSent = transfer.fromBinanceId === binanceId;
        const otherParty = isSent ? transfer.toBinanceId : transfer.fromBinanceId;
        const amount = (transfer.amount / 1000000).toFixed(6);
        
        return `
            <div class="history-item">
                <div class="history-details">
                    <div>
                        <strong>${isSent ? 'Sent to' : 'Received from'}:</strong> ${otherParty}
                    </div>
                    <div>
                        <strong>Amount:</strong> 
                        <span class="history-amount ${isSent ? 'sent' : 'received'}">
                            ${isSent ? '-' : '+'}${amount} DUSDT
                        </span>
                    </div>
                    <div>
                        <strong>Status:</strong> 
                        <span class="status-indicator status-${transfer.status}"></span>
                        ${transfer.status}
                    </div>
                    <div>
                        <strong>Time:</strong> ${new Date(transfer.createdAt).toLocaleString()}
                    </div>
                    ${transfer.transactionHash ? `<div><strong>TX:</strong> ${transfer.transactionHash}</div>` : ''}
                </div>
            </div>
        `;
    }).join('');

    transferHistoryList.innerHTML = historyHTML;
}

function updateUIForUser() {
    if (currentUser) {
        // Join socket room for real-time notifications
        socket.emit('join_room', currentUser.binanceId);
        
        // Pre-fill forms with current user data
        document.getElementById('fromBinanceId').value = currentUser.binanceId;
        document.getElementById('balanceBinanceId').value = currentUser.binanceId;
        document.getElementById('historyBinanceId').value = currentUser.binanceId;
        
        // Load user data
        checkBalance();
        loadNotifications();
        loadTransferHistory();
    }
}

function showAlert(message, type) {
    // Hide existing alerts
    successAlert.style.display = 'none';
    errorAlert.style.display = 'none';
    
    // Show appropriate alert
    if (type === 'success') {
        successAlert.textContent = message;
        successAlert.style.display = 'block';
    } else {
        errorAlert.textContent = message;
        errorAlert.style.display = 'block';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';
    }, 5000);
}

function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// Make functions available globally
window.checkBalance = checkBalance;
window.loadTransferHistory = loadTransferHistory;
window.markAsRead = markAsRead;






