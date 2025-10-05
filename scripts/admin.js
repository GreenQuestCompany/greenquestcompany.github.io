let currentAdmin = null
let allUsers = []
let allQuests = []
let allCategories = []
let currentEditingUser = null;
const SUPABASE_URL = "https://werkguvtcmwjfwypsljo.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcmtndXZ0Y213amZ3eXBzbGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzU3MDMsImV4cCI6MjA2NDQ1MTcwM30.uXO8xBdn65AqTiwuyUPpRpKQxQXV0AJy3NKqOr45Zm4"

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

document.addEventListener("DOMContentLoaded", () => {
    initializeAdminPanel()
})

async function initializeAdminPanel() {
    const { data: { session } } = await supabaseClient.auth.getSession()

    if (session) {
        const isUserAdmin = await checkAdminStatus(session.user.id)
        if (isUserAdmin) {
            currentAdmin = session.user
            await loadAdminData()
            showAdminPanel()
        } else {
            showAuth()
        }
    } else {
        showAuth()
    }

    hideLoading()
    setupEventListeners()
}

async function checkAdminStatus(userId) {
    try {
        const { data: user, error } = await supabaseClient
            .from("users")
            .select("is_admin")
            .eq("id", userId)
            .single()

        if (error) {
            console.error("Error checking admin status:", error)
            return false
        }

        return user?.is_admin === true
    } catch (error) {
        console.error("Error checking admin status:", error)
        return false
    }
}

function hideLoading() {
    setTimeout(() => {
        document.getElementById("loading-screen").classList.add("hidden")
    }, 1500)
}

function showAuth() {
    document.getElementById("auth-screen").classList.remove("hidden")
    document.getElementById("admin-panel").classList.add("hidden")
}

function showAdminPanel() {
    document.getElementById("auth-screen").classList.add("hidden")
    document.getElementById("admin-panel").classList.remove("hidden")
    document.getElementById("admin-name").textContent = currentAdmin.email
}

function setupEventListeners() {
    
    document.getElementById("admin-login-form").addEventListener("submit", handleAdminLogin)

    
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => switchTab(item.dataset.tab))
    })

    
    document.getElementById("user-search").addEventListener("input", filterUsers)
    document.getElementById("quest-category-filter").addEventListener("change", filterQuests)

    
    document.getElementById("add-user-form").addEventListener("submit", handleAddUser)
    document.getElementById("add-quest-form").addEventListener("submit", handleAddQuest)
    document.getElementById("edit-user-form").addEventListener("submit", handleEditUser)
    document.getElementById("add-category-form").addEventListener("submit", handleAddCategory)
}

async function handleAdminLogin(event) {
    event.preventDefault()
    
    const email = document.getElementById("admin-email").value
    const password = document.getElementById("admin-password").value

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password,
        })

        if (error) throw error

        
        const isUserAdmin = await checkAdminStatus(data.user.id)
        if (!isUserAdmin) {
            await supabaseClient.auth.signOut()
            throw new Error("Access denied: Admin privileges required")
        }

        currentAdmin = data.user
        await loadAdminData()
        showAdminPanel()
        hideAuthError()
    } catch (error) {
        showAuthError(error.message)
    }
}

async function logout() {
    try {
        await supabaseClient.auth.signOut()
        currentAdmin = null
        showAuth()
    } catch (error) {
        console.error("Error logging out:", error)
    }
}

function showAuthError(message) {
    const errorDiv = document.getElementById("auth-error")
    errorDiv.textContent = message
    errorDiv.classList.remove("hidden")
}

function hideAuthError() {
    document.getElementById("auth-error").classList.add("hidden")
}

function switchTab(tabName) {
    
    document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"))
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"))
    document.getElementById(`${tabName}-tab`).classList.add("active")

    
    switch(tabName) {
        case 'dashboard':
            loadDashboardData()
            break
        case 'users':
            loadUsersData()
            break
        case 'quests':
            loadQuestsData()
            break
        case 'categories':
            
            if (allCategories && allCategories.length > 0) {
                renderCategoriesGrid(allCategories)
            } else {
                loadCategoriesData(true)
            }
            break
        case 'analytics':
            loadAnalyticsData()
            break
    }
}

async function loadAdminData() {
    await Promise.all([
        loadDashboardData(),
        loadUsersData(),
        loadQuestsData(),
        loadCategoriesData()
    ])
}

async function loadDashboardData() {
    try {
        
        const [usersResult, questsResult, completionsResult] = await Promise.all([
            supabaseClient.from("users").select("*", { count: 'exact' }),
            supabaseClient.from("quests").select("*", { count: 'exact' }),
            supabaseClient.from("user_quests").select("*", { count: 'exact' }).eq('completed', true)
        ])

        
        document.getElementById("total-users").textContent = usersResult.count || 0
        document.getElementById("total-quests").textContent = questsResult.count || 0
        document.getElementById("total-completions").textContent = completionsResult.count || 0

        
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const { data: activeUsers } = await supabaseClient
            .from("users")
            .select("*")
            .gte('last_login', yesterday.toISOString())
        
        document.getElementById("active-users").textContent = activeUsers?.length || 0

        
        const { data: recentUsers } = await supabaseClient
            .from("users")
            .select("*")
            .order('created_at', { ascending: false })
            .limit(5)

        renderRecentUsers(recentUsers || [])

        
        const { data: recentCompletions } = await supabaseClient
            .from("user_quests")
            .select(`
                *,
                users(username),
                quests(title)
            `)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(5)

        renderRecentCompletions(recentCompletions || [])

    } catch (error) {
        console.error("Error loading dashboard data:", error)
        showNotification("Error loading dashboard data", "error")
    }
}

async function loadUsersData() {
    try {
        const { data: users, error } = await supabaseClient
            .from("users")
            .select("*")
            .order('created_at', { ascending: false })

        if (error) throw error

        allUsers = users || []
        renderUsersTable(allUsers)
    } catch (error) {
        console.error("Error loading users:", error)
        showNotification("Error loading users", "error")
    }
}

async function loadQuestsData() {
    try {
        const { data: quests, error } = await supabaseClient
            .from("quests")
            .select(`
                *,
                categories (
                    id,
                    name,
                    color,
                    icon
                )
            `)
            .order('created_at', { ascending: false })

        if (error) throw error

        allQuests = quests || []
        renderQuestsGrid(allQuests)
        updateQuestCategoryFilter()
    } catch (error) {
        console.error("Error loading quests:", error)
        showNotification("Error loading quests", "error")
    }
}

async function loadCategoriesData(renderGrid = false) {
    try {
        const { data: categories, error } = await supabaseClient
            .from("categories")
            .select("*")

        if (error) throw error

        allCategories = categories || []
        
        
        if (renderGrid || (document.getElementById("categories-tab") && document.getElementById("categories-tab").classList.contains("active"))) {
            renderCategoriesGrid(allCategories)
        }
        
        
        updateCategorySelects()
    } catch (error) {
        console.error("Error loading categories:", error)
        showNotification("Error loading categories", "error")
    }
}

async function loadAnalyticsData() {
    try {
        
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const { data: dailyActive } = await supabaseClient
            .from("users")
            .select("*")
            .gte('last_login', yesterday.toISOString())
        
        document.getElementById("daily-active").textContent = dailyActive?.length || 0
    } catch (error) {
        console.error("Error loading analytics:", error)
    }
}

function renderRecentUsers(users) {
    const container = document.getElementById("recent-users")
    container.innerHTML = ""

    users.forEach(user => {
        const item = document.createElement("div")
        item.className = "activity-item"
        item.innerHTML = `
            <div class="activity-avatar">
                ${user.username.charAt(0).toUpperCase()}
            </div>
            <div class="activity-info">
                <p class="activity-name">${user.username}</p>
                <p class="activity-time">${formatTimeAgo(user.created_at)}</p>
            </div>
        `
        container.appendChild(item)
    })
}

function renderRecentCompletions(completions) {
    const container = document.getElementById("recent-completions")
    container.innerHTML = ""

    completions.forEach(completion => {
        const item = document.createElement("div")
        item.className = "activity-item"
        item.innerHTML = `
            <div class="activity-avatar">
                <i class="fas fa-check"></i>
            </div>
            <div class="activity-info">
                <p class="activity-name">${completion.users.username} completed "${completion.quests.title}"</p>
                <p class="activity-time">${formatTimeAgo(completion.completed_at)}</p>
            </div>
        `
        container.appendChild(item)
    })
}

function renderUsersTable(users) {
    const tbody = document.getElementById("users-table-body")
    tbody.innerHTML = ""

    users.forEach(user => {
        const row = document.createElement("tr")
        const adminBadge = user.is_admin ? '<span class="badge badge-admin" title="Admin User"><i class="fas fa-shield-alt"></i></span>' : ''
        
        row.innerHTML = `
            <td>
                <div class="user-cell">
                    <div class="user-avatar">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                    <div class="user-info">
                        <p class="user-name">${user.username} ${adminBadge}</p>
                        <p class="user-id">#${user.id.substring(0, 8)}</p>
                    </div>
                </div>
            </td>
            <td>${user.email}</td>
            <td><span class="level-badge">Level ${user.level}</span></td>
            <td>${user.xp.toLocaleString()}</td>
            <td>${user.coins.toLocaleString()}</td>
            <td>${user.last_login ? formatDate(user.last_login) : 'Never'}</td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="openEditUserModal('${user.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteUser('${user.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `
        tbody.appendChild(row)
    })
}

function renderQuestsGrid(quests) {
    const grid = document.getElementById("admin-quests-grid")
    grid.innerHTML = ""

    quests.forEach(quest => {
        const category = quest.categories || { name: 'Uncategorized', color: '#6b7280', icon: 'fas fa-question' }
        const card = document.createElement("div")
        card.className = "admin-quest-card"
        card.innerHTML = `
            <div class="quest-card-header">
                <div>
                    <h4 class="quest-card-title">${quest.title}</h4>
                    <span class="quest-card-category" style="background-color: ${category.color}20; color: ${category.color}; border: 1px solid ${category.color}40;">
                        <i class="${category.icon}"></i>
                        ${category.name}
                    </span>
                </div>
            </div>
            <p class="quest-card-description">${quest.description}</p>
            <div class="quest-card-rewards">
                <div class="reward xp">
                    <i class="fas fa-star"></i>
                    ${quest.xp_reward} XP
                </div>
                <div class="reward coins">
                    <i class="fas fa-coins"></i>
                    ${quest.coin_reward} Coins
                </div>
            </div>
            <div class="quest-card-actions">
                <button class="btn btn-sm btn-secondary" onclick="editQuest('${quest.id}')">
                    <i class="fas fa-edit"></i>
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="confirmDeleteQuest('${quest.id}')">
                    <i class="fas fa-trash"></i>
                    Delete
                </button>
            </div>
        `
        grid.appendChild(card)
    })
}

function filterUsers() {
    const searchTerm = document.getElementById("user-search").value.toLowerCase()
    const filteredUsers = allUsers.filter(user => 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm)
    )
    renderUsersTable(filteredUsers)
}

function filterQuests() {
    const categoryId = document.getElementById("quest-category-filter").value
    const filteredQuests = categoryId 
        ? allQuests.filter(quest => quest.category_id === categoryId)
        : allQuests
    renderQuestsGrid(filteredQuests)
}

function renderCategoriesGrid(categories) {
    const grid = document.getElementById("categories-grid")
    if (!grid) {
        console.warn("Categories grid element not found")
        return
    }
    grid.innerHTML = ""

    if (categories.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>No Categories Found</h3>
                <p>Create your first category to get started</p>
                <button class="btn btn-primary" onclick="document.getElementById('add-category-modal').classList.remove('hidden')">
                    <i class="fas fa-plus"></i> Add Category
                </button>
            </div>
        `
        return
    }

    categories.forEach(category => {
        
        const questCount = allQuests ? allQuests.filter(q => q.category_id === category.id).length : 0
        
        const card = document.createElement("div")
        card.className = "category-card"
        card.innerHTML = `
            <div class="category-header">
                <div class="category-icon" style="background-color: ${category.color};">
                    <i class="${category.icon}"></i>
                </div>
                <div class="category-details">
                    <h3>${category.name}</h3>
                    <p>Category • ${category.color}</p>
                </div>
            </div>
            <div class="category-stats">
                <div class="category-stat">
                    <span class="stat-number">${questCount}</span>
                    <span class="stat-label">Quests</span>
                </div>
            </div>
            <div class="category-actions">
                <button class="btn btn-secondary" onclick="editCategory(${category.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger" onclick="confirmDeleteCategory(${category.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `
        grid.appendChild(card)
    })
}

function updateQuestCategoryFilter() {
    const filter = document.getElementById("quest-category-filter")
    filter.innerHTML = '<option value="">All Categories</option>'
    
    allCategories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        filter.appendChild(option)
    })
}

function updateCategorySelects() {
    
    const questCategorySelect = document.getElementById('new-quest-category')
    if (questCategorySelect) {
        const currentValue = questCategorySelect.value
        questCategorySelect.innerHTML = '<option value="">Select Category</option>'
        
        allCategories.forEach(category => {
            const option = document.createElement("option")
            option.value = category.id
            option.textContent = category.name
            questCategorySelect.appendChild(option)
        })
        
        if (currentValue) {
            questCategorySelect.value = currentValue
        }
    }

    
    const questFilterSelect = document.getElementById('quest-category-filter')
    if (questFilterSelect) {
        const currentValue = questFilterSelect.value
        questFilterSelect.innerHTML = '<option value="">All Categories</option>'
        
        allCategories.forEach(category => {
            const option = document.createElement("option")
            option.value = category.id
            option.textContent = category.name
            questFilterSelect.appendChild(option)
        })
        
        if (currentValue) {
            questFilterSelect.value = currentValue
        }
    }
}


function openAddUserModal() {
    document.getElementById("add-user-modal").classList.remove("hidden")
}

function openAddQuestModal() {
    document.getElementById("add-quest-modal").classList.remove("hidden")
}

function openAddCategoryModal() {
    document.getElementById("add-category-modal").classList.remove("hidden")
}

async function openEditUserModal(userId) {
    const user = allUsers.find(u => u.id === userId)
    if (!user) return

    currentEditingUser = user

    
    document.getElementById("edit-user-id").value = user.id
    document.getElementById("edit-username").value = user.username
    document.getElementById("edit-email").value = user.email
    document.getElementById("edit-level").value = user.level
    document.getElementById("edit-xp").value = user.xp
    document.getElementById("edit-coins").value = user.coins
    document.getElementById("edit-is-admin").checked = user.is_admin || false

    document.getElementById("edit-user-modal").classList.remove("hidden")
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add("hidden")
    
    document.querySelectorAll(`#${modalId} form`).forEach(form => form.reset())
}

async function handleAddUser(event) {
    event.preventDefault()

    const username = document.getElementById("new-username").value
    const email = document.getElementById("new-email").value
    const password = document.getElementById("new-password").value
    const xp = parseInt(document.getElementById("new-user-xp").value) || 0
    const coins = parseInt(document.getElementById("new-user-coins").value) || 100
    const isAdmin = document.getElementById("new-is-admin").checked

    try {
        
        const { data: authData, error: authError } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
        })

        if (authError) throw authError

        
        const { error: profileError } = await supabaseClient.from("users").insert([{
            id: authData.user.id,
            email: email,
            username: username,
            xp: xp,
            coins: coins,
            level: 1,
            xp_to_next: 1000,
            is_admin: isAdmin,
            created_at: new Date().toISOString()
        }])

        if (profileError) throw profileError

        showNotification("User created successfully", "success")
        closeModal("add-user-modal")
        loadUsersData()
        loadDashboardData()
    } catch (error) {
        console.error("Error creating user:", error)
        showNotification(`Error creating user: ${error.message}`, "error")
    }
}

async function handleAddQuest(event) {
    event.preventDefault()

    const title = document.getElementById("new-quest-title").value
    const description = document.getElementById("new-quest-description").value
    const categoryId = document.getElementById("new-quest-category").value
    const difficulty = document.getElementById("new-quest-difficulty").value
    const xpReward = parseInt(document.getElementById("new-quest-xp").value)
    const coinReward = parseInt(document.getElementById("new-quest-coins").value)
    const isDaily = document.getElementById("new-quest-daily").checked

    try {
        const { error } = await supabaseClient.from("quests").insert([{
            title: title,
            description: description,
            category_id: categoryId,
            difficulty: difficulty,
            xp_reward: xpReward,
            coin_reward: coinReward,
            is_daily: isDaily,
            created_at: new Date().toISOString()
        }])

        if (error) throw error

        showNotification("Quest created successfully", "success")
        closeModal("add-quest-modal")
        loadQuestsData()
        loadDashboardData()
    } catch (error) {
        console.error("Error creating quest:", error)
        showNotification(`Error creating quest: ${error.message}`, "error")
    }
}

async function handleEditUser(event) {
    event.preventDefault()

    const userId = document.getElementById("edit-user-id").value
    const username = document.getElementById("edit-username").value
    const email = document.getElementById("edit-email").value
    const level = parseInt(document.getElementById("edit-level").value)
    const xp = parseInt(document.getElementById("edit-xp").value)
    const coins = parseInt(document.getElementById("edit-coins").value)
    const isAdmin = document.getElementById("edit-is-admin").checked

    try {
        const { error } = await supabaseClient
            .from("users")
            .update({
                username: username,
                email: email,
                level: level,
                xp: xp,
                coins: coins,
                is_admin: isAdmin
            })
            .eq("id", userId)

        if (error) throw error

        showNotification("User updated successfully", "success")
        closeModal("edit-user-modal")
        loadUsersData()
        loadDashboardData()
    } catch (error) {
        console.error("Error updating user:", error)
        showNotification(`Error updating user: ${error.message}`, "error")
    }
}

async function deleteUser() {
    if (!currentEditingUser) return

    try {
        
        const { error: profileError } = await supabaseClient
            .from("users")
            .delete()
            .eq("id", currentEditingUser.id)

        if (profileError) throw profileError

        
        

        showNotification("User deleted successfully", "success")
        closeModal("edit-user-modal")
        loadUsersData()
        loadDashboardData()
    } catch (error) {
        console.error("Error deleting user:", error)
        showNotification(`Error deleting user: ${error.message}`, "error")
    }
}

function confirmDeleteUser(userId) {
    const user = allUsers.find(u => u.id === userId)
    if (!user) return

    confirmAction(
        `Delete user "${user.username}"? This action cannot be undone.`,
        async () => {
            try {
                const { error } = await supabaseClient
                    .from("users")
                    .delete()
                    .eq("id", userId)

                if (error) throw error

                showNotification("User deleted successfully", "success")
                loadUsersData()
                loadDashboardData()
            } catch (error) {
                console.error("Error deleting user:", error)
                showNotification(`Error deleting user: ${error.message}`, "error")
            }
        }
    )
}

function confirmDeleteQuest(questId) {
    const quest = allQuests.find(q => q.id === questId)
    if (!quest) return

    confirmAction(
        `Delete quest "${quest.title}"? This action cannot be undone.`,
        async () => {
            try {
                const { error } = await supabaseClient
                    .from("quests")
                    .delete()
                    .eq("id", questId)

                if (error) throw error

                showNotification("Quest deleted successfully", "success")
                loadQuestsData()
                loadDashboardData()
            } catch (error) {
                console.error("Error deleting quest:", error)
                showNotification(`Error deleting quest: ${error.message}`, "error")
            }
        }
    )
}

function confirmAction(message, callback) {
    document.getElementById("confirm-message").textContent = message
    document.getElementById("confirm-modal").classList.remove("hidden")
    
    const confirmButton = document.getElementById("confirm-button")
    confirmButton.onclick = () => {
        callback()
        closeModal("confirm-modal")
    }
}

function editQuest(questId) {
    
    showNotification("Quest editing feature coming soon", "info")
}

function showNotification(message, type = "info") {
    const notification = document.getElementById("notification")
    const icon = document.getElementById("notification-icon")
    const messageEl = document.getElementById("notification-message")

    
    switch(type) {
        case "success":
            icon.className = "fas fa-check-circle"
            notification.className = "notification success"
            break
        case "error":
            icon.className = "fas fa-exclamation-circle"
            notification.className = "notification error"
            break
        default:
            icon.className = "fas fa-info-circle"
            notification.className = "notification"
    }

    messageEl.textContent = message
    notification.classList.remove("hidden")
    notification.classList.add("show")

    
    setTimeout(() => {
        notification.classList.remove("show")
        setTimeout(() => {
            notification.classList.add("hidden")
        }, 300)
    }, 5000)
}


function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

function formatTimeAgo(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return 'Just now'
}


async function handleAddCategory() {
    const form = document.getElementById('add-category-form')
    const formData = new FormData(form)
    
    try {
        const { data, error } = await supabaseClient
            .from('categories')
            .insert([{
                name: formData.get('name'),
                color: formData.get('color'),
                icon: formData.get('icon')
            }])
            .select()

        if (error) throw error

        showNotification('Category added successfully', 'success')
        document.getElementById('add-category-modal').classList.add('hidden')
        form.reset()
        loadCategoriesData()
    } catch (error) {
        console.error('Error adding category:', error)
        showNotification(`Error adding category: ${error.message}`, 'error')
    }
}

async function handleUpdateCategory() {
    const form = document.getElementById('edit-category-form')
    const formData = new FormData(form)
    const categoryId = formData.get('id')
    
    try {
        const { error } = await supabaseClient
            .from('categories')
            .update({
                name: formData.get('name'),
                color: formData.get('color'),
                icon: formData.get('icon')
            })
            .eq('id', categoryId)

        if (error) throw error

        showNotification('Category updated successfully', 'success')
        document.getElementById('edit-category-modal').classList.add('hidden')
        loadCategoriesData()
    } catch (error) {
        console.error('Error updating category:', error)
        showNotification(`Error updating category: ${error.message}`, 'error')
    }
}

function confirmDeleteCategory(categoryId) {
    const category = allCategories.find(c => c.id === categoryId)
    if (!category) return

    confirmAction(
        `Delete category "${category.name}"? This will affect all quests using this category.`,
        async () => {
            try {
                const { error } = await supabaseClient
                    .from('categories')
                    .delete()
                    .eq('id', categoryId)

                if (error) throw error

                showNotification('Category deleted successfully', 'success')
                loadCategoriesData()
                loadQuestsData() 
            } catch (error) {
                console.error('Error deleting category:', error)
                showNotification(`Error deleting category: ${error.message}`, 'error')
            }
        }
    )
}

function editCategory(categoryId) {
    const category = allCategories.find(c => c.id === categoryId)
    if (!category) return

    const form = document.getElementById('edit-category-form')
    form.elements.id.value = category.id
    form.elements.name.value = category.name
    form.elements.color.value = category.color
    form.elements.icon.value = category.icon
    
    document.getElementById('edit-category-modal').classList.remove('hidden')
}


document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.add('hidden')
    }
})