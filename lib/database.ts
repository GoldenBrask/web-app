import { Pool } from "pg"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || "junior_miage",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "junior_miage_db",
  password: process.env.DB_PASSWORD,
  port: Number.parseInt(process.env.DB_PORT || "5432"),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

// Types
export interface TeamMember {
  id: number
  name: string
  role: string
  description: string
  image: string
  linkedin?: string
  email?: string
  skills: string[]
  experience: string
  education: string
  projects: string[]
  created_at?: string
  updated_at?: string
}

export interface Partner {
  id: number
  name: string
  logo: string
  website: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  published_at: string
  status: "draft" | "published"
  tags: string[]
  image?: string
  created_at?: string
  updated_at?: string
}

export interface JobOffer {
  id: number
  title: string
  department: string
  type: "stage" | "alternance" | "mission" | "bénévolat"
  duration: string
  location: string
  compensation: string
  description: string
  requirements: string[]
  responsibilities: string[]
  skills: string[]
  level: "L3" | "M1" | "M2" | "Tous niveaux"
  is_urgent: boolean
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Application {
  id: number
  job_offer_id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  level: string
  motivation: string
  cv_url?: string
  status: "pending" | "reviewed" | "accepted" | "rejected"
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  email: string
  password_hash: string
  role: "admin" | "user"
  created_at?: string
}

// Authentication Service
export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: Omit<User, "password_hash"> } | null> {
    try {
      const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
      const user = result.rows[0]

      if (!user || !(await bcrypt.compare(password, user.password_hash))) {
        return null
      }

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET!, {
        expiresIn: "24h",
      })

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
        },
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  async verifyToken(token: string): Promise<any> {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!)
    } catch (error) {
      return null
    }
  },

  async createAdmin(email: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12)
      const result = await pool.query(
        "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
        [email, hashedPassword, "admin"],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create admin error:", error)
      throw error
    }
  },
}

// Team Members Service
export const teamService = {
  async getAll(): Promise<TeamMember[]> {
    try {
      const result = await pool.query("SELECT * FROM team_members ORDER BY created_at DESC")
      return result.rows
    } catch (error) {
      console.error("Get team members error:", error)
      throw error
    }
  },

  async create(member: Omit<TeamMember, "id" | "created_at" | "updated_at">): Promise<TeamMember> {
    try {
      const result = await pool.query(
        `INSERT INTO team_members (name, role, description, image, linkedin, email, skills, experience, education, projects)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          member.name,
          member.role,
          member.description,
          member.image,
          member.linkedin,
          member.email,
          JSON.stringify(member.skills),
          member.experience,
          member.education,
          JSON.stringify(member.projects),
        ],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create team member error:", error)
      throw error
    }
  },

  async update(id: number, member: Partial<TeamMember>): Promise<TeamMember> {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      Object.entries(member).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && value !== undefined) {
          if (key === "skills" || key === "projects") {
            fields.push(`${key} = $${paramCount}`)
            values.push(JSON.stringify(value))
          } else {
            fields.push(`${key} = $${paramCount}`)
            values.push(value)
          }
          paramCount++
        }
      })

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await pool.query(
        `UPDATE team_members SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      )
      return result.rows[0]
    } catch (error) {
      console.error("Update team member error:", error)
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await pool.query("DELETE FROM team_members WHERE id = $1", [id])
    } catch (error) {
      console.error("Delete team member error:", error)
      throw error
    }
  },
}

// Partners Service
export const partnerService = {
  async getAll(): Promise<Partner[]> {
    try {
      const result = await pool.query("SELECT * FROM partners ORDER BY created_at DESC")
      return result.rows
    } catch (error) {
      console.error("Get partners error:", error)
      throw error
    }
  },

  async create(partner: Omit<Partner, "id" | "created_at" | "updated_at">): Promise<Partner> {
    try {
      const result = await pool.query(
        "INSERT INTO partners (name, logo, website, description) VALUES ($1, $2, $3, $4) RETURNING *",
        [partner.name, partner.logo, partner.website, partner.description],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create partner error:", error)
      throw error
    }
  },

  async update(id: number, partner: Partial<Partner>): Promise<Partner> {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      Object.entries(partner).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && value !== undefined) {
          fields.push(`${key} = $${paramCount}`)
          values.push(value)
          paramCount++
        }
      })

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await pool.query(
        `UPDATE partners SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      )
      return result.rows[0]
    } catch (error) {
      console.error("Update partner error:", error)
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await pool.query("DELETE FROM partners WHERE id = $1", [id])
    } catch (error) {
      console.error("Delete partner error:", error)
      throw error
    }
  },
}

// Blog Service
export const blogService = {
  async getAll(): Promise<BlogPost[]> {
    try {
      const result = await pool.query("SELECT * FROM blog_posts ORDER BY created_at DESC")
      return result.rows
    } catch (error) {
      console.error("Get blog posts error:", error)
      throw error
    }
  },

  async getPublished(): Promise<BlogPost[]> {
    try {
      const result = await pool.query("SELECT * FROM blog_posts WHERE status = $1 ORDER BY published_at DESC", [
        "published",
      ])
      return result.rows
    } catch (error) {
      console.error("Get published blog posts error:", error)
      throw error
    }
  },

  async create(post: Omit<BlogPost, "id" | "created_at" | "updated_at">): Promise<BlogPost> {
    try {
      const result = await pool.query(
        `INSERT INTO blog_posts (title, slug, excerpt, content, author, published_at, status, tags, image)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          post.title,
          post.slug,
          post.excerpt,
          post.content,
          post.author,
          post.published_at,
          post.status,
          JSON.stringify(post.tags),
          post.image,
        ],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create blog post error:", error)
      throw error
    }
  },

  async update(id: number, post: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      Object.entries(post).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && value !== undefined) {
          if (key === "tags") {
            fields.push(`${key} = $${paramCount}`)
            values.push(JSON.stringify(value))
          } else {
            fields.push(`${key} = $${paramCount}`)
            values.push(value)
          }
          paramCount++
        }
      })

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await pool.query(
        `UPDATE blog_posts SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      )
      return result.rows[0]
    } catch (error) {
      console.error("Update blog post error:", error)
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await pool.query("DELETE FROM blog_posts WHERE id = $1", [id])
    } catch (error) {
      console.error("Delete blog post error:", error)
      throw error
    }
  },
}

// Job Offers Service
export const jobService = {
  async getAll(): Promise<JobOffer[]> {
    try {
      const result = await pool.query("SELECT * FROM job_offers ORDER BY created_at DESC")
      return result.rows
    } catch (error) {
      console.error("Get job offers error:", error)
      throw error
    }
  },

  async getActive(): Promise<JobOffer[]> {
    try {
      const result = await pool.query("SELECT * FROM job_offers WHERE is_active = true ORDER BY created_at DESC")
      return result.rows
    } catch (error) {
      console.error("Get active job offers error:", error)
      throw error
    }
  },

  async create(job: Omit<JobOffer, "id" | "created_at" | "updated_at">): Promise<JobOffer> {
    try {
      const result = await pool.query(
        `INSERT INTO job_offers (title, department, type, duration, location, compensation, description, requirements, responsibilities, skills, level, is_urgent, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          job.title,
          job.department,
          job.type,
          job.duration,
          job.location,
          job.compensation,
          job.description,
          JSON.stringify(job.requirements),
          JSON.stringify(job.responsibilities),
          JSON.stringify(job.skills),
          job.level,
          job.is_urgent,
          job.is_active,
        ],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create job offer error:", error)
      throw error
    }
  },

  async update(id: number, job: Partial<JobOffer>): Promise<JobOffer> {
    try {
      const fields = []
      const values = []
      let paramCount = 1

      Object.entries(job).forEach(([key, value]) => {
        if (key !== "id" && key !== "created_at" && value !== undefined) {
          if (key === "requirements" || key === "responsibilities" || key === "skills") {
            fields.push(`${key} = $${paramCount}`)
            values.push(JSON.stringify(value))
          } else {
            fields.push(`${key} = $${paramCount}`)
            values.push(value)
          }
          paramCount++
        }
      })

      fields.push(`updated_at = NOW()`)
      values.push(id)

      const result = await pool.query(
        `UPDATE job_offers SET ${fields.join(", ")} WHERE id = $${paramCount} RETURNING *`,
        values,
      )
      return result.rows[0]
    } catch (error) {
      console.error("Update job offer error:", error)
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      await pool.query("DELETE FROM job_offers WHERE id = $1", [id])
    } catch (error) {
      console.error("Delete job offer error:", error)
      throw error
    }
  },
}

// Applications Service
export const applicationService = {
  async getAll(): Promise<Application[]> {
    try {
      const result = await pool.query(`
        SELECT a.*, j.title as job_title, j.department 
        FROM applications a 
        JOIN job_offers j ON a.job_offer_id = j.id 
        ORDER BY a.created_at DESC
      `)
      return result.rows
    } catch (error) {
      console.error("Get applications error:", error)
      throw error
    }
  },

  async create(application: Omit<Application, "id" | "created_at" | "updated_at">): Promise<Application> {
    try {
      const result = await pool.query(
        `INSERT INTO applications (job_offer_id, first_name, last_name, email, phone, level, motivation, cv_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [
          application.job_offer_id,
          application.first_name,
          application.last_name,
          application.email,
          application.phone,
          application.level,
          application.motivation,
          application.cv_url,
          application.status || "pending",
        ],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Create application error:", error)
      throw error
    }
  },

  async updateStatus(id: number, status: Application["status"]): Promise<Application> {
    try {
      const result = await pool.query(
        "UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
        [status, id],
      )
      return result.rows[0]
    } catch (error) {
      console.error("Update application status error:", error)
      throw error
    }
  },
}

export { pool }
