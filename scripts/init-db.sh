#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Initialisation de la base de données Junior MIAGE ===${NC}\n"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL n'est pas installé${NC}"
    echo "Installez PostgreSQL avec:"
    echo "  Ubuntu/Debian: sudo apt install postgresql postgresql-contrib"
    echo "  macOS: brew install postgresql"
    echo "  Windows: Téléchargez depuis https://www.postgresql.org/download/"
    exit 1
fi

# Check if PostgreSQL service is running
if ! pg_isready -q; then
    echo -e "${YELLOW}⚠️  PostgreSQL n'est pas démarré${NC}"
    echo "Démarrez PostgreSQL avec:"
    echo "  Ubuntu/Debian: sudo systemctl start postgresql"
    echo "  macOS: brew services start postgresql"
    echo "  Windows: Démarrez le service PostgreSQL"
    
    # Try to start PostgreSQL on Ubuntu/Debian
    if command -v systemctl &> /dev/null; then
        echo -e "${BLUE}Tentative de démarrage automatique...${NC}"
        sudo systemctl start postgresql
        sleep 2
        if ! pg_isready -q; then
            echo -e "${RED}❌ Impossible de démarrer PostgreSQL automatiquement${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ PostgreSQL démarré${NC}"
    else
        exit 1
    fi
fi

# Database configuration
DB_NAME="junior_miage_db"
DB_USER="junior_miage"
DB_PASSWORD="junior_miage_2024!"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Base de données: $DB_NAME"
echo "  Utilisateur: $DB_USER"
echo "  Mot de passe: $DB_PASSWORD"
echo ""

# Create database and user
echo -e "${GREEN}1. Création de la base de données et de l'utilisateur...${NC}"

sudo -u postgres psql << EOF
-- Drop existing database and user if they exist
DROP DATABASE IF EXISTS $DB_NAME;
DROP USER IF EXISTS $DB_USER;

-- Create user first
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';

-- Create database
CREATE DATABASE $DB_NAME OWNER $DB_USER;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;

-- Connect to the database and grant schema privileges
\c $DB_NAME

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;

\q
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de données et utilisateur créés${NC}"
else
    echo -e "${RED}❌ Erreur lors de la création de la base de données${NC}"
    exit 1
fi

# Run setup SQL
echo -e "${GREEN}2. Exécution du script de configuration...${NC}"

PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f database/setup.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tables et données créées${NC}"
else
    echo -e "${RED}❌ Erreur lors de l'exécution du script SQL${NC}"
    exit 1
fi

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

# Create .env.local file
echo -e "${GREEN}3. Création du fichier .env.local...${NC}"

cat > .env.local << EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Secret
JWT_SECRET=$JWT_SECRET

# Environment
NODE_ENV=development

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
EOF

echo -e "${GREEN}✅ Fichier .env.local créé${NC}"

# Test connection
echo -e "${GREEN}4. Test de la connexion...${NC}"

PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME << EOF
SELECT 
  'Tables créées:' as info,
  COUNT(*) as team_members 
FROM team_members
UNION ALL
SELECT 
  'Partenaires:' as info,
  COUNT(*) as count 
FROM partners
UNION ALL
SELECT 
  'Articles blog:' as info,
  COUNT(*) as count 
FROM blog_posts
UNION ALL
SELECT 
  'Offres emploi:' as info,
  COUNT(*) as count 
FROM job_offers
UNION ALL
SELECT 
  'Administrateurs:' as info,
  COUNT(*) as count 
FROM users WHERE role='admin';
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Connexion réussie${NC}"
else
    echo -e "${RED}❌ Erreur de connexion${NC}"
    exit 1
fi

echo -e "\n${GREEN}=== Configuration terminée avec succès ! ===${NC}"
echo -e "${YELLOW}Informations de connexion admin par défaut:${NC}"
echo "  Email: admin@junior-miage-concept.fr"
echo "  Mot de passe: admin123"
echo ""
echo -e "${YELLOW}Pour créer un nouvel administrateur:${NC}"
echo "  npm install bcryptjs pg readline"
echo "  node scripts/create-admin.js create"
echo ""
echo -e "${YELLOW}Pour démarrer l'application:${NC}"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}URLs importantes:${NC}"
echo "  Application: http://localhost:3000"
echo "  Admin: http://localhost:3000/admin/login"
