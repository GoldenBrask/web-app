-- Create database and user
-- Run these commands as postgres superuser first:
-- CREATE DATABASE junior_miage_db;
-- CREATE USER junior_miage WITH PASSWORD 'junior_miage_2024!';
-- GRANT ALL PRIVILEGES ON DATABASE junior_miage_db TO junior_miage;

-- Connect to the database and run the following:

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  description TEXT,
  image VARCHAR(500),
  linkedin VARCHAR(500),
  email VARCHAR(255),
  skills JSONB DEFAULT '[]',
  experience TEXT,
  education TEXT,
  projects JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Partners Table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo VARCHAR(500),
  website VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  tags JSONB DEFAULT '[]',
  image VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job Offers Table
CREATE TABLE IF NOT EXISTS job_offers (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  department VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('stage', 'alternance', 'mission', 'bénévolat')),
  duration VARCHAR(100),
  location VARCHAR(255),
  compensation VARCHAR(255),
  description TEXT NOT NULL,
  requirements JSONB DEFAULT '[]',
  responsibilities JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  level VARCHAR(20) CHECK (level IN ('L3', 'M1', 'M2', 'Tous niveaux')),
  is_urgent BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  job_offer_id INTEGER REFERENCES job_offers(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  level VARCHAR(100),
  motivation TEXT NOT NULL,
  cv_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'accepted', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brochures Table
CREATE TABLE IF NOT EXISTS brochures (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  file_size INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Events Table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  page VARCHAR(500),
  element VARCHAR(255),
  value JSONB,
  session_id VARCHAR(255),
  user_agent TEXT,
  referrer VARCHAR(500),
  location JSONB,
  device JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics Sessions Table
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id VARCHAR(255) PRIMARY KEY,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  events INTEGER DEFAULT 0,
  referrer VARCHAR(500),
  landing_page VARCHAR(500),
  exit_page VARCHAR(500),
  duration INTEGER,
  bounced BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contact Messages Table
CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Newsletter Subscriptions Table
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_team_members_created_at ON team_members(created_at);
CREATE INDEX IF NOT EXISTS idx_partners_created_at ON partners(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_job_offers_active ON job_offers(is_active);
CREATE INDEX IF NOT EXISTS idx_job_offers_type ON job_offers(type);
CREATE INDEX IF NOT EXISTS idx_applications_job_offer_id ON applications(job_offer_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_start_time ON analytics_sessions(start_time);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);

-- Insert default admin user (password: admin123)
-- Hash generated with bcrypt, salt rounds: 12
INSERT INTO users (email, password_hash, role) VALUES 
('admin@junior-miage-concept.fr', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg/9qm', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample team members
INSERT INTO team_members (name, role, description, image, linkedin, email, skills, experience, education, projects) VALUES
('Alexandre Martin', 'Président & Lead Developer', 'Master 2 MIAGE, spécialisé en développement full-stack et gestion de projet', '/placeholder.svg?height=120&width=120&text=AM', 'https://linkedin.com/in/alexandre-martin', 'alexandre.martin@junior-miage-concept.fr', '["React", "Node.js", "TypeScript", "AWS", "Docker", "Scrum Master"]', '3 ans d''expérience en développement web, ancien stagiaire chez Capgemini', 'Master 2 MIAGE - Université Paris-Dauphine', '["Plateforme e-commerce pour PME", "Application mobile de gestion RH", "Migration cloud AWS pour startup fintech"]'),
('Sarah Dubois', 'Vice-Présidente & Business Analyst', 'Master 2 MIAGE, experte en analyse fonctionnelle et conseil stratégique', '/placeholder.svg?height=120&width=120&text=SD', 'https://linkedin.com/in/sarah-dubois', 'sarah.dubois@junior-miage-concept.fr', '["Business Analysis", "UML", "Agile", "Power BI", "SQL", "Project Management"]', '2 ans en conseil, stage chez Deloitte en transformation digitale', 'Master 2 MIAGE - Université Paris-Dauphine', '["Audit SI pour groupe bancaire", "Refonte processus métier industrie automobile", "Mise en place tableau de bord décisionnel"]'),
('Thomas Leroy', 'Responsable Marketing Digital', 'Master 1 MIAGE, spécialisé en marketing digital et communication', '/placeholder.svg?height=120&width=120&text=TL', 'https://linkedin.com/in/thomas-leroy', 'thomas.leroy@junior-miage-concept.fr', '["SEO/SEA", "Google Analytics", "Social Media", "Content Marketing", "Adobe Creative Suite"]', '2 ans en agence de communication digitale', 'Master 1 MIAGE - Université Paris-Dauphine', '["Campagne SEA pour e-commerce", "Stratégie social media B2B", "Refonte site web corporate"]')
ON CONFLICT DO NOTHING;

-- Insert sample partners
INSERT INTO partners (name, logo, website, description) VALUES
('Capgemini', '/placeholder.svg?height=80&width=160&text=Capgemini', 'https://www.capgemini.com', 'Leader mondial du conseil et des services numériques'),
('Deloitte', '/placeholder.svg?height=80&width=160&text=Deloitte', 'https://www.deloitte.fr', 'Cabinet de conseil en stratégie et transformation'),
('Accenture', '/placeholder.svg?height=80&width=160&text=Accenture', 'https://www.accenture.com', 'Services professionnels et technologies'),
('Sopra Steria', '/placeholder.svg?height=80&width=160&text=Sopra+Steria', 'https://www.soprasteria.com', 'Leader européen de la transformation numérique'),
('Atos', '/placeholder.svg?height=80&width=160&text=Atos', 'https://atos.net', 'Leader mondial de la transformation digitale')
ON CONFLICT DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, author, published_at, status, tags, image) VALUES
('L''avenir de la transformation digitale en 2024', 'avenir-transformation-digitale-2024', 'Découvrez les tendances qui façonneront la transformation digitale des entreprises cette année.', 'La transformation digitale continue d''évoluer rapidement. En 2024, nous observons plusieurs tendances majeures qui redéfinissent la façon dont les entreprises abordent leur digitalisation.

## Intelligence Artificielle et Automatisation

L''IA générative transforme les processus métier. Les entreprises intègrent des solutions d''automatisation intelligente pour optimiser leurs opérations et améliorer l''expérience client.

## Cloud et Edge Computing

Le cloud hybride devient la norme, permettant aux entreprises de bénéficier de la flexibilité du cloud public tout en conservant le contrôle de leurs données sensibles.

## Cybersécurité Renforcée

Avec l''augmentation des cybermenaces, la sécurité devient une priorité absolue dans toute stratégie de transformation digitale.

## Conclusion

La transformation digitale n''est plus une option mais une nécessité pour rester compétitif dans l''économie moderne.', 'Alexandre Martin', NOW() - INTERVAL '2 days', 'published', '["Digital", "Transformation", "Tendances", "IA"]', '/placeholder.svg?height=200&width=400&text=Blog+Post+1'),

('Les métiers du MIAGE : entre technique et management', 'metiers-miage-technique-management', 'Exploration des opportunités de carrière offertes par la formation MIAGE.', 'La formation MIAGE (Méthodes Informatiques Appliquées à la Gestion des Entreprises) ouvre de nombreuses portes dans le monde professionnel.

## Consultant en Systèmes d''Information

Le consultant SI accompagne les entreprises dans leur transformation digitale, analysant les besoins et proposant des solutions adaptées.

## Chef de Projet Digital

Véritable chef d''orchestre, le chef de projet digital coordonne les équipes techniques et fonctionnelles pour mener à bien les projets de transformation.

## Business Analyst

Interface entre les métiers et l''IT, le business analyst traduit les besoins fonctionnels en spécifications techniques.

## Architecte SI

L''architecte conçoit et fait évoluer l''architecture des systèmes d''information pour répondre aux enjeux business.

## Perspectives d''Évolution

Ces métiers offrent de belles perspectives d''évolution vers des postes de direction ou de spécialisation technique avancée.', 'Sarah Dubois', NOW() - INTERVAL '5 days', 'published', '["MIAGE", "Carrière", "Métiers", "Formation"]', '/placeholder.svg?height=200&width=400&text=Blog+Post+2'),

('Comment réussir son stage en Junior-Entreprise', 'reussir-stage-junior-entreprise', 'Conseils pratiques pour tirer le meilleur parti de votre expérience en Junior-Entreprise.', 'Intégrer une Junior-Entreprise est une excellente opportunité de développer ses compétences professionnelles tout en étudiant.

## Préparer son Intégration

Avant de commencer, renseignez-vous sur l''entreprise, ses valeurs et ses projets en cours. Cette préparation vous permettra de mieux vous intégrer.

## Développer ses Compétences

Profitez de chaque mission pour apprendre de nouvelles technologies et méthodologies. N''hésitez pas à demander des formations complémentaires.

## Networking et Relations

Construisez un réseau professionnel solide en participant aux événements et en maintenant le contact avec vos collègues et clients.

## Gestion de Projet

Apprenez les bases de la gestion de projet : planification, suivi, communication avec le client et gestion des risques.

## Bilan et Perspectives

À la fin de votre expérience, faites le bilan de vos acquis et définissez vos objectifs de carrière futurs.', 'Thomas Leroy', NOW() - INTERVAL '1 week', 'published', '["Stage", "Junior-Entreprise", "Conseils", "Développement"]', '/placeholder.svg?height=200&width=400&text=Blog+Post+3')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample job offers
INSERT INTO job_offers (title, department, type, duration, location, compensation, description, requirements, responsibilities, skills, level, is_urgent, is_active) VALUES
('Développeur Full-Stack React/Node.js', 'Développement', 'mission', '3-6 mois', 'Paris / Télétravail', '400-600€/mois', 'Rejoignez notre équipe de développement pour créer des applications web modernes et innovantes. Vous travaillerez sur des projets variés pour des clients prestigieux.', '["Étudiant en Master MIAGE ou formation équivalente", "Expérience avec React et Node.js", "Connaissance des bases de données", "Maîtrise de Git"]', '["Développer des interfaces utilisateur avec React", "Créer des APIs REST avec Node.js", "Participer aux réunions client", "Rédiger la documentation technique"]', '["React", "Node.js", "TypeScript", "MongoDB", "Git", "Docker"]', 'M1', true, true),

('Business Analyst Junior', 'Conseil', 'stage', '4-6 mois', 'Paris', '600-800€/mois', 'Accompagnez nos consultants seniors dans l''analyse des besoins clients et la définition de solutions SI adaptées.', '["Étudiant en Master MIAGE", "Capacités d''analyse et de synthèse", "Excellente communication", "Maîtrise d''UML"]', '["Analyser les processus métier", "Rédiger les spécifications fonctionnelles", "Animer des ateliers utilisateurs", "Participer aux phases de recette"]', '["UML", "Business Analysis", "SQL", "Power BI", "Agile/Scrum"]', 'M2', false, true),

('Chef de Projet Digital Junior', 'Management', 'alternance', '12 mois', 'Paris', '1200-1500€/mois', 'Pilotez des projets de transformation digitale sous la supervision d''un chef de projet senior.', '["Étudiant en alternance Master MIAGE", "Première expérience en gestion de projet", "Leadership et organisation", "Anglais courant"]', '["Planifier et suivre les projets", "Coordonner les équipes", "Gérer la relation client", "Reporting et communication"]', '["MS Project", "Agile", "PRINCE2", "Jira", "Confluence"]', 'M2', false, true)
ON CONFLICT DO NOTHING;

-- Display setup completion message
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as users_count FROM users;
SELECT COUNT(*) as team_members_count FROM team_members;
SELECT COUNT(*) as partners_count FROM partners;
SELECT COUNT(*) as blog_posts_count FROM blog_posts;
SELECT COUNT(*) as job_offers_count FROM job_offers;
