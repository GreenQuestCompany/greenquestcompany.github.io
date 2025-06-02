// Mock Data
let userData = {
    id: 1,
    name: "Alex Johnson",
    level: 7,
    xp: 2450,
    xpToNext: 3000,
    coins: 1250,
    rank: 15
};

let questsData = [
    {
        id: 1,
        title: "Drink 8 Glasses of Water",
        description: "Stay hydrated throughout the day by drinking at least 8 glasses of water.",
        xpReward: 50,
        coinReward: 10,
        completed: false,
        category: "health"
    },
    {
        id: 2,
        title: "Walk 10,000 Steps",
        description: "Take a walk and reach your daily step goal of 10,000 steps.",
        xpReward: 75,
        coinReward: 15,
        completed: true,
        category: "health"
    },
    {
        id: 3,
        title: "Use Reusable Bag",
        description: "Bring your own reusable bag when shopping to reduce plastic waste.",
        xpReward: 40,
        coinReward: 8,
        completed: false,
        category: "environment"
    },
    {
        id: 4,
        title: "Recycle Properly",
        description: "Sort and recycle your waste according to local guidelines.",
        xpReward: 30,
        coinReward: 6,
        completed: false,
        category: "environment"
    },
    {
        id: 5,
        title: "Call a Friend",
        description: "Connect with a friend or family member and have a meaningful conversation.",
        xpReward: 35,
        coinReward: 7,
        completed: false,
        category: "social"
    }
];

let leaderboardData = [
    { id: 1, name: "Emma Wilson", level: 25, xp: 15420, rank: 1 },
    { id: 2, name: "David Chen", level: 23, xp: 14890, rank: 2 },
    { id: 3, name: "Sofia Rodriguez", level: 22, xp: 13750, rank: 3 },
    { id: 4, name: "Marcus Johnson", level: 20, xp: 12340, rank: 4 },
    { id: 5, name: "Lisa Park", level: 19, xp: 11890, rank: 5 },
    { id: 6, name: "Tom Anderson", level: 18, xp: 10950, rank: 6 },
    { id: 7, name: "Maya Patel", level: 17, xp: 10200, rank: 7 },
    { id: 8, name: "Chris Brown", level: 16, xp: 9750, rank: 8 },
    { id: 9, name: "Anna Schmidt", level: 15, xp: 9200, rank: 9 },
    { id: 10, name: "Jake Miller", level: 14, xp: 8650, rank: 10 },
    { id: 11, name: "Rachel Green", level: 13, xp: 8100, rank: 11 },
    { id: 12, name: "Kevin Lee", level: 12, xp: 7550, rank: 12 },
    { id: 13, name: "Nicole Davis", level: 11, xp: 7000, rank: 13 },
    { id: 14, name: "Ryan Taylor", level: 10, xp: 6450, rank: 14 },
    { id: 15, name: "Alex Johnson", level: 7, xp: 2450, rank: 15 }
];

// Initialize App
document.addEventListener('DOMContentLoaded', function() {
    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        document.getElementById('app').classList.remove('hidden');
        initializeApp();
    }, 1500);
});

function initializeApp() {
    updateUserDisplay();
    renderQuests();
    renderLeaderboard();
    setupEventListeners();
}

function updateUserDisplay() {
    // Update XP Bar
    const progress = (userData.xp / userData.xpToNext) * 100;
    document.getElementById('xp-progress').style.width = progress + '%';
    
    // Update user info
    document.getElementById('user-level').textContent = userData.level;
    document.getElementById('current-xp').textContent = userData.xp.toLocaleString();
    document.getElementById('max-xp').textContent = userData.xpToNext.toLocaleString();
    document.getElementById('user-coins').textContent = userData.coins.toLocaleString();
    document.getElementById('username').textContent = userData.name;
    document.getElementById('profile-level').textContent = userData.level;
}

function renderQuests() {
    const container = document.getElementById('quests-container');
    container.innerHTML = '';
    
    questsData.forEach(quest => {
        const questElement = createQuestElement(quest);
        container.appendChild(questElement);
    });
}

function createQuestElement(quest) {
    const questDiv = document.createElement('div');
    questDiv.className = `quest-item ${quest.completed ? 'completed' : ''}`;
    
    questDiv.innerHTML = `
        <div class="quest-header">
            <div class="quest-info">
                <div class="quest-title-row">
                    <h3 class="quest-title ${quest.completed ? 'completed' : ''}">${quest.title}</h3>
                    <span class="quest-category category-${quest.category}">${quest.category}</span>
                </div>
                <p class="quest-description ${quest.completed ? 'completed' : ''}">${quest.description}</p>
                <div class="quest-rewards">
                    <div class="reward xp">
                        <i class="fas fa-star"></i>
                        <span>${quest.xpReward} XP</span>
                    </div>
                    <div class="reward coins">
                        <i class="fas fa-coins"></i>
                        <span>${quest.coinReward} Coins</span>
                    </div>
                </div>
            </div>
            <div class="quest-action">
                ${quest.completed ? 
                    '<i class="fas fa-check-circle completed-icon"></i>' :
                    `<button class="complete-button" onclick="completeQuest(${quest.id})">Complete</button>`
                }
            </div>
        </div>
    `;
    
    return questDiv;
}

function completeQuest(questId) {
    const quest = questsData.find(q => q.id === questId);
    if (!quest || quest.completed) return;
    
    // Mark quest as completed
    quest.completed = true;
    
    // Update user stats
    userData.xp += quest.xpReward;
    userData.coins += quest.coinReward;
    
    // Check for level up
    if (userData.xp >= userData.xpToNext) {
        userData.level++;
        userData.xp = userData.xp - userData.xpToNext;
        userData.xpToNext = Math.floor(userData.xpToNext * 1.2); // Increase XP requirement
    }
    
    // Update displays
    updateUserDisplay();
    renderQuests();
    
    // Show success modal
    showSuccessModal(quest);
}

function showSuccessModal(quest) {
    document.getElementById('success-message').textContent = `Great job completing "${quest.title}"!`;
    document.getElementById('xp-reward').textContent = `+${quest.xpReward} XP`;
    document.getElementById('coin-reward').textContent = `+${quest.coinReward} Coins`;
    document.getElementById('success-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('success-modal').classList.add('hidden');
}

function renderLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    container.innerHTML = '';
    
    const top10 = leaderboardData.slice(0, 10);
    
    top10.forEach(player => {
        const playerElement = createLeaderboardElement(player);
        container.appendChild(playerElement);
    });
    
    // Show current user rank if outside top 10
    if (userData.rank > 10) {
        const currentUserRank = document.getElementById('current-user-rank');
        const currentUser = leaderboardData.find(p => p.id === userData.id);
        if (currentUser) {
            currentUserRank.innerHTML = createLeaderboardElement(currentUser, true).outerHTML;
            currentUserRank.classList.remove('hidden');
        }
    }
}

function createLeaderboardElement(player, isCurrentUser = false) {
    const playerDiv = document.createElement('div');
    playerDiv.className = `leaderboard-item ${isCurrentUser || player.id === userData.id ? 'current-user' : ''}`;
    
    const rankIcon = getRankIcon(player.rank);
    
    playerDiv.innerHTML = `
        <div class="rank-icon ${getRankClass(player.rank)}">${rankIcon}</div>
        <div class="player-info">
            <p class="player-name ${isCurrentUser || player.id === userData.id ? 'current-user' : ''}">${player.name}${isCurrentUser || player.id === userData.id ? ' (You)' : ''}</p>
            <p class="player-level">Level ${player.level}</p>
        </div>
        <div class="player-xp">
            <p class="xp-amount">${player.xp.toLocaleString()}</p>
            <p class="xp-label">XP</p>
        </div>
    `;
    
    return playerDiv;
}

function getRankIcon(rank) {
    switch(rank) {
        case 1: return '<i class="fas fa-trophy"></i>';
        case 2: return '<i class="fas fa-medal"></i>';
        case 3: return '<i class="fas fa-award"></i>';
        default: return `#${rank}`;
    }
}

function getRankClass(rank) {
    switch(rank) {
        case 1: return 'rank-1';
        case 2: return 'rank-2';
        case 3: return 'rank-3';
        default: return 'rank-other';
    }
}

function setupEventListeners() {
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // In a real app, this would filter the leaderboard data
            // For now, we'll just re-render the same data
            renderLeaderboard();
        });
    });
    
    // Modal close on background click
    document.getElementById('success-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

function openProfile() {
    alert('Profile page would open here. This could navigate to a settings page or show a profile modal.');
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toLocaleString();
}

// Auto-save functionality (in a real app, this would sync with a backend)
function saveUserData() {
    localStorage.setItem('lifequest_user', JSON.stringify(userData));
    localStorage.setItem('lifequest_quests', JSON.stringify(questsData));
}

function loadUserData() {
    const savedUser = localStorage.getItem('lifequest_user');
    const savedQuests = localStorage.getItem('lifequest_quests');
    
    if (savedUser) {
        userData = JSON.parse(savedUser);
    }
    
    if (savedQuests) {
        questsData = JSON.parse(savedQuests);
    }
}

// Load saved data on page load
loadUserData();

// Save data periodically
setInterval(saveUserData, 30000); // Save every 30 seconds

// Save data before page unload
window.addEventListener('beforeunload', saveUserData);
