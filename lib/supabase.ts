import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
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
