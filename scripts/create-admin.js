#!/usr/bin/env node

const bcrypt = require("bcryptjs")
const { Pool } = require("pg")
const readline = require("readline")

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "junior_miage",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "junior_miage_db",
  password: process.env.DB_PASSWORD || "junior_miage_2024!",
  port: Number.parseInt(process.env.DB_PORT || "5432"),
})

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, resolve)
  })
}

function askPassword(question) {
  return new Promise((resolve) => {
    const stdin = process.stdin
    const stdout = process.stdout

    stdout.write(question)
    stdin.setRawMode(true)
    stdin.resume()
    stdin.setEncoding("utf8")

    let password = ""

    stdin.on("data", (char) => {
      char = char + ""

      switch (char) {
        case "\n":
        case "\r":
        case "\u0004":
          stdin.setRawMode(false)
          stdin.pause()
          stdout.write("\n")
          resolve(password)
          break
        case "\u0003":
          process.exit()
          break
        case "\u007f": // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1)
            stdout.write("\b \b")
          }
          break
        default:
          password += char
          stdout.write("*")
          break
      }
    })
  })
}

async function createAdmin() {
  try {
    console.log("\n=== Création d'un nouvel administrateur ===\n")

    const email = await askQuestion("Email: ")
    const password = await askPassword("Mot de passe: ")
    const confirmPassword = await askPassword("Confirmer le mot de passe: ")

    if (password !== confirmPassword) {
      console.log("\n❌ Les mots de passe ne correspondent pas")
      return
    }

    if (password.length < 6) {
      console.log("\n❌ Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    // Check if user already exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email])
    if (existingUser.rows.length > 0) {
      console.log("\n❌ Un utilisateur avec cet email existe déjà")
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create admin user
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role, created_at",
      [email, hashedPassword, "admin"],
    )

    const newAdmin = result.rows[0]
    console.log("\n✅ Administrateur créé avec succès !")
    console.log(`ID: ${newAdmin.id}`)
    console.log(`Email: ${newAdmin.email}`)
    console.log(`Rôle: ${newAdmin.role}`)
    console.log(`Créé le: ${newAdmin.created_at}`)
  } catch (error) {
    console.error("\n❌ Erreur lors de la création:", error.message)
  }
}

async function listAdmins() {
  try {
    console.log("\n=== Liste des administrateurs ===\n")

    const result = await pool.query(
      "SELECT id, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC",
      ["admin"],
    )

    if (result.rows.length === 0) {
      console.log("Aucun administrateur trouvé")
      return
    }

    result.rows.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.email}`)
      console.log(`   ID: ${admin.id}`)
      console.log(`   Créé le: ${admin.created_at}`)
      console.log("")
    })
  } catch (error) {
    console.error("❌ Erreur lors de la récupération:", error.message)
  }
}

async function changePassword() {
  try {
    console.log("\n=== Changer le mot de passe d'un administrateur ===\n")

    const email = await askQuestion("Email de l'administrateur: ")

    // Check if user exists
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1 AND role = $2", [email, "admin"])
    if (existingUser.rows.length === 0) {
      console.log("\n❌ Administrateur non trouvé")
      return
    }

    const newPassword = await askPassword("Nouveau mot de passe: ")
    const confirmPassword = await askPassword("Confirmer le nouveau mot de passe: ")

    if (newPassword !== confirmPassword) {
      console.log("\n❌ Les mots de passe ne correspondent pas")
      return
    }

    if (newPassword.length < 6) {
      console.log("\n❌ Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await pool.query("UPDATE users SET password_hash = $1 WHERE email = $2 AND role = $3", [
      hashedPassword,
      email,
      "admin",
    ])

    console.log("\n✅ Mot de passe mis à jour avec succès !")
  } catch (error) {
    console.error("\n❌ Erreur lors de la mise à jour:", error.message)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case "create":
      await createAdmin()
      break
    case "list":
      await listAdmins()
      break
    case "password":
      await changePassword()
      break
    default:
      console.log("\nUtilisation:")
      console.log("  node scripts/create-admin.js create   - Créer un nouvel administrateur")
      console.log("  node scripts/create-admin.js list     - Lister tous les administrateurs")
      console.log("  node scripts/create-admin.js password - Changer le mot de passe d'un admin")
      break
  }

  rl.close()
  await pool.end()
}

main().catch(console.error)
