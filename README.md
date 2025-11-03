# SmartLens AI - Handwritten Notes Analysis System

An intelligent full-stack application that transforms handwritten notes into structured insights using AI-powered analysis. Upload images or PDFs of handwritten notes, extract text via OCR, and get comprehensive AI analysis including summaries, key points, keywords, and sentiment analysis.

## 🚀 Live Demo

- **Frontend:** https://smartlens-ai.onrender.com
- **Backend API:** https://smartlens-backend-24pq.onrender.com

## 📸 Screenshots

### 1. Authentication Flow

**Login Page**
![Login Page](screenshots/login.png)
*Secure JWT-based authentication with email and password*

**Signup Page**
![Signup Page](screenshots/signup.png)
*User registration with form validation and password confirmation*

### 2. Dashboard

**Notes Dashboard**
![Dashboard](screenshots/dashboard.png)
*Card-based view of all uploaded notes with search, filter, and pagination*

### 3. Upload & Analysis

**File Upload**
![Upload Page](screenshots/upload.png)
*Drag-and-drop interface for uploading handwritten notes (JPG/PNG/PDF)*

**AI Analysis Results**
![Analysis Results](screenshots/analysis-1.png)
![Analysis Results](screenshots/analysis-2.png)
![Analysis Results](screenshots/analysis-3.png)
*Comprehensive AI-generated insights: summary, key points, keywords, and sentiment*

### 4. Note Details

**Individual Note View**
![Note Detail](screenshots/note-detail.png)
*Detailed view with extracted text, AI analysis, and PDF export functionality*

### 5. Dark Mode

**Dark Theme**
![Dark Mode](screenshots/darkmode-dashboard.png)
![Dark Mode](screenshots/darkmode-card.png)
*Seamless dark mode toggle for comfortable viewing in any lighting condition*

---

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI framework
- **React Router** - Navigation
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **PostgreSQL** - Database (via Supabase)
- **Tesseract.js** - OCR for images
- **PDF.js** - PDF text extraction
- **Google Gemini AI** - LLM analysis
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Render.com** - Cloud deployment
- **Nginx** - Frontend web server

---

## 📋 Features

### Core Functionality
- ✅ User authentication (signup, login, logout)
- ✅ Upload handwritten notes (JPG, PNG, PDF)
- ✅ OCR text extraction (minimum 200 characters)
- ✅ AI-powered analysis using Google Gemini
- ✅ View all notes in dashboard
- ✅ Search and filter notes
- ✅ Individual note details
- ✅ Delete notes
- ✅ Responsive design (mobile & desktop)
- ✅ Dark/Light theme toggle
- ✅ PDF export functionality
- ✅ User profile management

### AI Analysis Features
- 📝 **Summary** - Concise overview of note content
- 🔑 **Key Points** - Important takeaways
- 🏷️ **Keywords** - Extracted topics and tags
- 💭 **Sentiment Analysis** - Emotional tone detection

### Security Features
- 🔐 JWT-based authentication
- 🔒 Password hashing with bcrypt
- 🛡️ Rate limiting on API endpoints
- ✅ Input validation and sanitization
- 🚫 CORS protection

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 20+
- Docker Desktop (for Docker setup)
- Git

### Option 1: Docker Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohithMohan0708/SmartLens-AI.git
   cd SmartLens-AI
   ```

2. **Create environment file**
   ```bash
   # Copy server/.env.example to server/.env and fill in values
   cp server/.env.example server/.env
   ```

3. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost
   - Backend: http://localhost:5000

5. **Stop the application**
   ```bash
   docker-compose down
   ```

### Option 2: Manual Setup

**Backend Setup:**
```bash
cd server
npm install
npm run server
```

**Frontend Setup (in new terminal):**
```bash
cd client
npm install
npm run dev
```

Access at: http://localhost:5173

---

## 🎥 Demo Video

Watch a 2-minute walkthrough of SmartLens AI's key features:

**[📺 View Demo Video](https://your-video-link-here)**

**Video Highlights:**
- User authentication flow
- Uploading handwritten notes
- AI analysis in action
- Dashboard navigation and filtering
- Dark mode toggle
- PDF export feature

---

## 📡 API Documentation

### Base URL
- **Local:** `http://localhost:5000/api`
- **Production:** `https://smartlens-backend-24pq.onrender.com/api`

### API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/signup` | Register a new user | ❌ |
| POST | `/auth/login` | Login and get JWT token | ❌ |
| POST | `/auth/logout` | Logout user | ✅ |
| POST | `/notes/upload` | Upload and analyze note | ✅ |
| GET | `/notes/` | Get all user notes | ✅ |
| GET | `/notes/note/:noteId` | Get specific note | ✅ |
| DELETE | `/notes/note/:noteId` | Delete a note | ✅ |
| GET | `/settings/profile` | Get user profile | ✅ |
| PUT | `/settings/profile` | Update user profile | ✅ |
| PUT | `/settings/password` | Change password | ✅ |
| DELETE | `/settings/account` | Delete user account | ✅ |

### Authentication Endpoints

#### POST `/auth/signup`
Register a new user.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully!"
}
```

#### POST `/auth/login`
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login success!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "name": "John Doe"
}
```

#### POST `/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logout successful!"
}
```

### Notes Endpoints

#### POST `/notes/upload`
Upload and analyze a handwritten note.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (FormData):**
- `file`: Image or PDF file (max 10MB)
- `title`: Optional note title

**Response:**
```json
{
  "success": true,
  "message": "File uploaded, text extracted, and analyzed successfully!",
  "note": {
    "id": 1,
    "user_id": 1,
    "title": "Meeting Notes",
    "original_image_url": "https://...",
    "extracted_text": "...",
    "analysis_result": {
      "summary": "...",
      "keyPoints": ["...", "..."],
      "keywords": ["...", "..."],
      "sentiment": "positive"
    },
    "created_at": "2025-11-02T10:30:00Z"
  },
  "extractedTextLength": 450,
  "analysisCompleted": true
}
```

#### GET `/notes/`
Fetch all notes for authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "notes": [...]
}
```

#### GET `/notes/note/:noteId`
Fetch a specific note by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "note": {...}
}
```

#### DELETE `/notes/note/:noteId`
Delete a specific note.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Note deleted successfully."
}
```

---

## 🗄️ Database Schema

The application uses **two separate PostgreSQL databases**:
- **Production Database** - Main application data (via Supabase transaction pooler)
- **Test Database** - Isolated testing environment (separate Supabase project)

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notes Table
```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    original_image_url TEXT,
    extracted_text TEXT NOT NULL,
    analysis_result JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Database Features:**
- Foreign key constraints for referential integrity
- Cascade delete (deleting user removes all their notes)
- JSONB for flexible AI analysis storage
- Indexed columns for query performance

---

## 🧪 Testing

The application uses **separate test database** to avoid affecting production data.

### Backend Tests
```bash
cd server
npm test
```

**Test Coverage:**
- Unit tests for authentication (signup, login, logout)
- Unit tests for notes CRUD operations
- Unit tests for database queries
- Unit tests for settings (profile, password, account deletion)
- Integration tests for complete user flows

**Test Database:**
- Separate Supabase project for testing
- Configured via `TEST_DATABASE_URL` environment variable
- Automatically used when `NODE_ENV=test`

### Frontend Tests
```bash
cd client
npm test
```

**Test Coverage:**
- Component tests for FileUpload (drag-drop, validation)
- Component tests for AnalysisDisplay (AI results display)
- Component tests for NoteCard (note display)
- Component tests for NoteDetail (detailed view)
- Page tests for Login, Signup, Dashboard, Upload

**Test Results:**
- ✅ All backend tests passing
- ✅ All frontend tests passing
- ✅ Database integrity validated

---

## 📦 Project Structure

```
SmartLens-AI/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── context/         # React context (Auth)
│   │   ├── services/        # API services
│   │   └── tests/           # Frontend tests
│   ├── Dockerfile           # Frontend container
│   └── nginx.conf           # Nginx configuration
├── server/                   # Backend Node.js application
│   ├── controllers/         # Route controllers
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── services/           # Business logic
│   ├── db/                 # Database queries
│   ├── tests/              # Backend tests
│   └── Dockerfile          # Backend container
├── docker-compose.yml       # Multi-container orchestration
└── README.md               # This file
```

---

## 🚢 Deployment

### Docker Deployment (Production)

The application is deployed on **Render.com** using Docker containers:

1. **Backend** - Deployed as a Docker web service
2. **Frontend** - Deployed as a Docker web service with Nginx
3. **Database** - Supabase PostgreSQL (managed service)

### Environment Variables

**Backend (.env):**
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
SUPABASE_ANON_KEY=your_anon_key

# Database URLs (using transaction pooler for IPv4 compatibility)
DATABASE_URL=postgresql://postgres.PROJECT:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres
TEST_DATABASE_URL=postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres

# Authentication
JWT_SECRET_KEY=your_jwt_secret

# AI Service
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
NODE_ENV=production
PORT=5000
```

**Note:** 
- Production database uses **transaction pooler** (port 6543) for better IPv4 compatibility
- Test database uses direct connection (port 5432) - only needed for running tests locally

**Frontend:**
```env
VITE_API_URL=https://your-backend-url/api
```

---

## 🎯 Key Challenges & Solutions

### Challenge 1: Cross-Domain Authentication
**Problem:** Cookies not working across different domains (frontend and backend on separate URLs).

**Solution:** Implemented dual authentication strategy:
- JWT tokens stored in localStorage
- Tokens sent via Authorization header
- Backward compatible with cookie-based auth

### Challenge 2: IPv6 Connection Issues
**Problem:** Docker containers couldn't connect to Supabase database using IPv6.

**Solution:** 
- Switched to Supabase transaction pooler (IPv4-only)
- Configured Docker to prefer IPv4 DNS resolution
- Added explicit DNS servers (8.8.8.8)

### Challenge 3: OCR Accuracy
**Problem:** Tesseract OCR had low accuracy for some handwritten notes.

**Solution:**
- Implemented fallback to Google Gemini Vision API for images
- Used PDF.js for PDF text extraction
- Added minimum 200-character validation

### Challenge 4: Rate Limiting in Production
**Problem:** Shared IPs in cloud deployment triggered rate limits incorrectly.

**Solution:**
- Adjusted rate limits for production environment
- Implemented proper proxy trust configuration
- Added graceful error handling

---

## � T roubleshooting

### Common Issues

**Issue: "Network Error" when uploading files**
- **Solution:** Check if backend is running and CORS is configured correctly
- Verify `VITE_API_URL` in frontend `.env` file

**Issue: Database connection failed**
- **Solution:** Verify `DATABASE_URL` in server `.env`
- Ensure Supabase project is active
- Check if using transaction pooler (port 6543) for production

**Issue: OCR extraction returns empty text**
- **Solution:** Ensure image has clear, readable text
- Minimum 200 characters required
- Try using higher resolution images

**Issue: JWT token expired**
- **Solution:** Login again to get a new token
- Tokens expire after 24 hours

**Issue: Docker containers won't start**
- **Solution:** Run `docker-compose down -v` to remove volumes
- Check if ports 80 and 5000 are available
- Verify `.env` file exists in server directory

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

---

## 📊 Performance Metrics

- **Average Upload Time:** 3-5 seconds
- **OCR Processing:** 2-4 seconds per page
- **AI Analysis:** 3-6 seconds
- **Dashboard Load:** < 1 second
- **API Response Time:** < 500ms (average)

---


## 👨‍💻 Development Process

1. **Planning** - Analyzed SRS requirements and designed architecture
2. **Backend Development** - Built RESTful API with Express.js
3. **Database Design** - Created PostgreSQL schema with Supabase
4. **Frontend Development** - Built responsive React UI
5. **AI Integration** - Integrated Google Gemini for text analysis
6. **Testing** - Wrote comprehensive unit and integration tests
7. **Dockerization** - Created Docker containers for deployment
8. **Deployment** - Deployed to Render.com cloud platform
9. **Documentation** - Created comprehensive README and API docs

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For powerful text analysis capabilities
- **Tesseract.js** - For OCR functionality
- **Supabase** - For database hosting
- **Render.com** - For cloud deployment
- **React & Node.js Communities** - For excellent documentation and support

---

**Built with ❤️ using React, Node.js, and AI**
