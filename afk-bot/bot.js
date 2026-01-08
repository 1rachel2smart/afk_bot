const mineflayer = require('mineflayer')
const autoeat = require('mineflayer-auto-eat').plugin
const armorManager = require('mineflayer-armor-manager')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const Vec3 = require('vec3').Vec3
// The user will create the AFK spot and teleport the bot there; no automatic return-to-room behavior.

let reconnectDelayMs = 5000
const RECONNECT_MIN = 5000
const RECONNECT_MAX = 60000

function attemptAuth (bot) {
  // Optional env vars: MC_SET_PASSWORD, MC_PASSWORD
  const setpw = process.env.MC_SET_PASSWORD
  const pw = process.env.MC_PASSWORD
  if (setpw) {
    try { bot.chat(`/setpassword ${setpw}`) } catch (e) {}
  }
  if (pw) {
    setTimeout(() => {
      try { bot.chat(`/login ${pw}`) } catch (e) {}
    }, 1500)
  }
}

function createBot () {
  const bot = mineflayer.createBot({
    host: process.env.MC_HOST || 'YOUR_SERVER_IP',
    port: parseInt(process.env.MC_PORT || '25565'),
    username: process.env.MC_USER || 'AFK_Bot'
  })

  bot.loadPlugin(autoeat)
  bot.loadPlugin(armorManager)
  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('Bot spawned.')

    // reset reconnect delay on successful spawn
    reconnectDelayMs = RECONNECT_MIN

    // attempt login / setpassword if configured
    attemptAuth(bot)

    // Auto-eat configuration
    bot.autoEat.options = {
      priority: 'foodPoints',
      startAt: 14,
      bannedFood: []
    }

    // Setup pathfinder movements
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    // Periodic small jump to appear active
    // Natural idle head movement
    setInterval(() => {
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.5
      bot.look(yaw, pitch, true)
    }, 4000)

    // Jump loop
    setInterval(() => {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 200)
    }, 5000)

    // Heartbeat message every minute (optional)
    setInterval(() => {
      try { bot.chat("Still alive and jumping.") } catch (e) {}
    }, 60000)

    // Auto-equip armor when items are collected
    bot.on('playerCollect', (collector, item) => {
      if (collector !== bot.entity) return
      setTimeout(() => bot.armorManager.equipAll(), 500)
    })

    // No automatic return-to-AFK-room; the user will place/teleport the bot where desired.

    // Try to avoid nearby mobs when hurt
    bot.on('entityHurt', () => {
      const nearest = bot.nearestEntity(e => e.type === 'mob')
      if (!nearest) return
      const dx = bot.entity.position.x - nearest.position.x
      const dz = bot.entity.position.z - nearest.position.z
      const away = bot.entity.position.offset(dx, 0, dz)
      bot.pathfinder.setGoal(new goals.GoalNear(away.x, away.y, away.z, 2))
    })
  })

  // Auto-reconnect logic with backoff
  bot.on('end', () => {
    console.log(`Bot disconnected. Reconnecting in ${reconnectDelayMs / 1000}s...`)
    setTimeout(() => {
      reconnectDelayMs = Math.min(RECONNECT_MAX, reconnectDelayMs * 2)
      createBot()
    }, reconnectDelayMs)
  })

  bot.on('kicked', reason => {
    console.log('Kicked:', reason)
  })

  bot.on('error', err => {
    console.log('Error:', err)
  })
}

// Initial start
createBot()
