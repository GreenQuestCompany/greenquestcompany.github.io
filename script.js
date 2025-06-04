// Supabase Configuration
const SUPABASE_URL = "https://werkguvtcmwjfwypsljo.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndlcmtndXZ0Y213amZ3eXBzbGpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzU3MDMsImV4cCI6MjA2NDQ1MTcwM30.uXO8xBdn65AqTiwuyUPpRpKQxQXV0AJy3NKqOr45Zm4"

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Global state
let currentUser = null
let userQuests = []
let allQuests = []

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

async function initializeApp() {
  // Check if user is already logged in
  const {
    data: { session },
  } = await supabaseClient.auth.getSession()

  if (session) {
    currentUser = session.user
    await loadUserData()
    showApp()
  } else {
    showAuth()
  }

  hideLoading()
  setupEventListeners()
}

function hideLoading() {
  setTimeout(() => {
    document.getElementById("loading-screen").classList.add("hidden")
  }, 2000)
}

function showAuth() {
  document.getElementById("auth-screen").classList.remove("hidden")
  document.getElementById("app").classList.add("hidden")
}

function showApp() {
  document.getElementById("auth-screen").classList.add("hidden")
  document.getElementById("app").classList.remove("hidden")
}

// Authentication Functions
function showLogin() {
  document.querySelector(".auth-tab.active").classList.remove("active")
  document.querySelector('[onclick="showLogin()"]').classList.add("active")
  document.getElementById("login-form").classList.remove("hidden")
  document.getElementById("signup-form").classList.add("hidden")
}

function showSignup() {
  document.querySelector(".auth-tab.active").classList.remove("active")
  document.querySelector('[onclick="showSignup()"]').classList.add("active")
  document.getElementById("login-form").classList.add("hidden")
  document.getElementById("signup-form").classList.remove("hidden")
}

async function handleLogin(email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) throw error

    currentUser = data.user
    await loadUserData()
    showApp()
    hideAuthError()
  } catch (error) {
    showAuthError(error.message)
  }
}

async function handleSignup(username, email, password) {
  try {
    const { data, error } = await supabaseClient.auth.signUp({
      email: email,
      password: password,
    })

    if (error) throw error

    // Create user profile
    const { error: profileError } = await supabaseClient.from("users").insert([
      {
        id: data.user.id,
        email: email,
        username: username,
        level: 1,
        xp: 0,
        xp_to_next: 1000,
        coins: 0,
      },
    ])

    if (profileError) throw profileError

    currentUser = data.user
    await loadUserData()
    showApp()
    hideAuthError()
  } catch (error) {
    showAuthError(error.message)
  }
}

async function logout() {
  await supabaseClient.auth.signOut()
  currentUser = null
  showAuth()
}

function showAuthError(message) {
  const errorDiv = document.getElementById("auth-error")
  errorDiv.textContent = message
  errorDiv.classList.remove("hidden")
}

function hideAuthError() {
  document.getElementById("auth-error").classList.add("hidden")
}

// Data Loading Functions
async function loadUserData() {
  try {
    // Load user profile
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", currentUser.id)
      .single()

    if (userError) throw userError

    // Update last login
    await supabaseClient.from("users").update({ last_login: new Date().toISOString() }).eq("id", currentUser.id)

    // Load quests and user progress
    await Promise.all([loadQuests(), loadLeaderboard(), loadFriends()])

    updateUserDisplay(userData)
  } catch (error) {
    console.error("Error loading user data:", error)
  }
}

async function loadQuests() {
  try {
    // Load all quests
    const { data: questsData, error: questsError } = await supabaseClient.from("quests").select("*")

    if (questsError) throw questsError
    allQuests = questsData

    // Load user quest progress
    const { data: userQuestsData, error: userQuestsError } = await supabaseClient
      .from("user_quests")
      .select("*")
      .eq("user_id", currentUser.id)

    if (userQuestsError) throw userQuestsError
    userQuests = userQuestsData

    renderQuests()
  } catch (error) {
    console.error("Error loading quests:", error)
  }
}

async function loadLeaderboard() {
  try {
    const { data, error } = await supabaseClient.from("leaderboard").select("*").order("xp", { ascending: false }).limit(15)

    if (error) throw error

    renderLeaderboard(data)
  } catch (error) {
    console.error("Error loading leaderboard:", error)
  }
}

async function loadFriends() {
  try {
    const { data, error } = await supabaseClient
      .from("friendships")
      .select(`
                *,
                friend:users!friendships_friend_id_fkey(username, level)
            `)
      .eq("user_id", currentUser.id)
      .eq("status", "accepted")

    if (error) throw error

    renderFriends(data)
  } catch (error) {
    console.error("Error loading friends:", error)
  }
}

// UI Update Functions
function updateUserDisplay(userData) {
  const progress = (userData.xp / userData.xp_to_next) * 100
  document.getElementById("xp-progress").style.width = progress + "%"

  document.getElementById("user-level").textContent = userData.level
  document.getElementById("current-xp").textContent = userData.xp.toLocaleString()
  document.getElementById("max-xp").textContent = userData.xp_to_next.toLocaleString()
  document.getElementById("user-coins").textContent = userData.coins.toLocaleString()
  document.getElementById("username").textContent = userData.username
  document.getElementById("profile-level").textContent = userData.level
}

function renderQuests() {
  const container = document.getElementById("quests-container")
  container.innerHTML = ""

  allQuests.forEach((quest) => {
    const userQuest = userQuests.find((uq) => uq.quest_id === quest.id)
    const questElement = createQuestElement(quest, userQuest)
    container.appendChild(questElement)
  })
}

function createQuestElement(quest, userQuest) {
  const questDiv = document.createElement("div")
  const isCompleted = userQuest && userQuest.completed
  questDiv.className = `quest-item ${isCompleted ? "completed" : ""}`

  questDiv.innerHTML = `
        <div class="quest-header">
            <div class="quest-info">
                <div class="quest-title-row">
                    <h3 class="quest-title ${isCompleted ? "completed" : ""}">${quest.title}</h3>
                    <span class="quest-category category-${quest.category}">${quest.category}</span>
                </div>
                <p class="quest-description ${isCompleted ? "completed" : ""}">${quest.description}</p>
                <div class="quest-rewards">
                    <div class="reward xp">
                        <i class="fas fa-star"></i>
                        <span>${quest.xp_reward} XP</span>
                    </div>
                    <div class="reward coins">
                        <i class="fas fa-coins"></i>
                        <span>${quest.coin_reward} Coins</span>
                    </div>
                </div>
            </div>
            <div class="quest-action">
                ${
                  isCompleted
                    ? '<i class="fas fa-check-circle completed-icon"></i>'
                    : `<button class="complete-button" onclick="completeQuest('${quest.id}')">Complete</button>`
                }
            </div>
        </div>
    `

  return questDiv
}

async function completeQuest(questId) {
  try {
    const quest = allQuests.find((q) => q.id === questId)
    if (!quest) return

    // Check if quest is already completed
    const existingUserQuest = userQuests.find((uq) => uq.quest_id === questId)
    if (existingUserQuest && existingUserQuest.completed) return

    // Mark quest as completed
    const { error: questError } = await supabaseClient.from("user_quests").upsert({
      user_id: currentUser.id,
      quest_id: questId,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    if (questError) throw questError

    // Update user XP and coins
    const { data: userData, error: userError } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", currentUser.id)
      .single()

    if (userError) throw userError

    const newXP = userData.xp + quest.xp_reward
    const newCoins = userData.coins + quest.coin_reward
    let newLevel = userData.level
    let newXPToNext = userData.xp_to_next

    // Check for level up
    if (newXP >= userData.xp_to_next) {
      newLevel++
      newXPToNext = Math.floor(userData.xp_to_next * 1.2)
    }

    const { error: updateError } = await supabaseClient
      .from("users")
      .update({
        xp: newXP,
        coins: newCoins,
        level: newLevel,
        xp_to_next: newXPToNext,
      })
      .eq("id", currentUser.id)

    if (updateError) throw updateError

    // Update local state
    userQuests = userQuests.filter((uq) => uq.quest_id !== questId)
    userQuests.push({
      user_id: currentUser.id,
      quest_id: questId,
      completed: true,
      completed_at: new Date().toISOString(),
    })

    // Refresh displays
    await loadUserData()
    showSuccessModal(quest)
  } catch (error) {
    console.error("Error completing quest:", error)
  }
}

function renderLeaderboard(leaderboardData) {
  const container = document.getElementById("leaderboard-container")
  container.innerHTML = ""

  const top10 = leaderboardData.slice(0, 10)

  top10.forEach((player) => {
    const playerElement = createLeaderboardElement(player)
    container.appendChild(playerElement)
  })

  // Show current user rank if outside top 10
  const currentUserData = leaderboardData.find((p) => p.id === currentUser.id)
  if (currentUserData && currentUserData.rank > 10) {
    const currentUserRank = document.getElementById("current-user-rank")
    currentUserRank.innerHTML = createLeaderboardElement(currentUserData, true).outerHTML
    currentUserRank.classList.remove("hidden")
  }
}

function createLeaderboardElement(player, isCurrentUser = false) {
  const playerDiv = document.createElement("div")
  playerDiv.className = `leaderboard-item ${isCurrentUser || player.id === currentUser.id ? "current-user" : ""}`

  const rankIcon = getRankIcon(player.rank)

  playerDiv.innerHTML = `
        <div class="rank-icon ${getRankClass(player.rank)}">${rankIcon}</div>
        <div class="player-info">
            <p class="player-name ${isCurrentUser || player.id === currentUser.id ? "current-user" : ""}">${player.username}${isCurrentUser || player.id === currentUser.id ? " (You)" : ""}</p>
            <p class="player-level">Level ${player.level}</p>
        </div>
        <div class="player-xp">
            <p class="xp-amount">${player.xp.toLocaleString()}</p>
            <p class="xp-label">XP</p>
        </div>
    `

  return playerDiv
}

function renderFriends(friendsData) {
  const friendsList = document.getElementById("friends-list")
  const activeFriends = friendsData.length
  const totalFriends = friendsData.length // In a real app, this might be different

  document.getElementById("active-friends").textContent = activeFriends
  document.getElementById("total-friends").textContent = totalFriends

  friendsList.innerHTML = ""

  friendsData.slice(0, 3).forEach((friendship) => {
    const friendDiv = document.createElement("div")
    friendDiv.className = "friend-item"
    friendDiv.innerHTML = `
            <div class="online-indicator"></div>
            <span class="friend-name">${friendship.friend.username}</span>
            <span class="friend-level">L${friendship.friend.level}</span>
        `
    friendsList.appendChild(friendDiv)
  })
}

function getRankIcon(rank) {
  switch (rank) {
    case 1:
      return '<i class="fas fa-trophy"></i>'
    case 2:
      return '<i class="fas fa-medal"></i>'
    case 3:
      return '<i class="fas fa-award"></i>'
    default:
      return `#${rank}`
  }
}

function getRankClass(rank) {
  switch (rank) {
    case 1:
      return "rank-1"
    case 2:
      return "rank-2"
    case 3:
      return "rank-3"
    default:
      return "rank-other"
  }
}

function showSuccessModal(quest) {
  document.getElementById("success-message").textContent = `Great job completing "${quest.title}"!`
  document.getElementById("xp-reward").textContent = `+${quest.xp_reward} XP`
  document.getElementById("coin-reward").textContent = `+${quest.coin_reward} Coins`
  document.getElementById("success-modal").classList.remove("hidden")
}

function closeModal() {
  document.getElementById("success-modal").classList.add("hidden")
}

function setupEventListeners() {
  // Auth forms
  document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const email = document.getElementById("login-email").value
    const password = document.getElementById("login-password").value
    await handleLogin(email, password)
  })

  document.getElementById("signup-form").addEventListener("submit", async (e) => {
    e.preventDefault()
    const username = document.getElementById("signup-username").value
    const email = document.getElementById("signup-email").value
    const password = document.getElementById("signup-password").value
    await handleSignup(username, email, password)
  })

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn")
  filterButtons.forEach((button) => {
    button.addEventListener("click", function () {
      filterButtons.forEach((btn) => btn.classList.remove("active"))
      this.classList.add("active")
      loadLeaderboard() // In a real app, this would filter by time period
    })
  })

  // Modal close on background click
  document.getElementById("success-modal").addEventListener("click", function (e) {
    if (e.target === this) {
      closeModal()
    }
  })

  // Listen for auth state changes
  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      currentUser = null
      showAuth()
    }
  })
}
