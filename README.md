<<<<<<< HEAD
# StoryForge 📖

A modern, full-stack **story creation and sharing platform** built with Next.js, React, and AI-powered features. Create, edit, read, and discover stories with intelligent writing assistance and AI-generated imagery.

## 🌟 Features

### Core Functionality
- **Story Creation & Editing** - Write and publish your own stories with a rich story editor
- **Chapter Management** - Organize stories into chapters with easy navigation
- **Story Discovery** - Browse, search, and explore stories by genre and popularity
- **User Profiles** - Create profiles, showcase your published stories, and follow other authors

### Social Features
- **Likes & Bookmarks** - Like your favorite stories and save them for later
- **Comments** - Engage with readers through story and chapter comments
- **Follow System** - Follow authors to stay updated with their new releases
- **User Dashboard** - Personalized dashboard for managing your content and activity

### AI-Powered Features
- **Story Assistant** - AI-powered writing suggestions to help improve your stories
- **Image Generation** - Generate AI-created images for your story covers
- **Text Summarization** - Auto-generate summaries for your stories
- **Multiple AI Models** - Support for HuggingFace, Gemini, and OpenAI integration

### Technical Features
- **Authentication** - JWT-based authentication with secure password hashing
- **Dark/Light Theme** - Toggle between dark and light themes for comfortable reading
- **Responsive Design** - Fully responsive UI optimized for mobile and desktop
- **PDF Export** - Download stories as PDF documents
- **Admin Panel** - Admin dashboard for content moderation

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14.2
- **UI Library**: React 18.2
- **Styling**: Tailwind CSS 3.4
- **Animations**: Framer Motion 11.0
- **PDF Generation**: jsPDF & html2canvas

### Backend
- **Runtime**: Node.js with Next.js API Routes
- **Database**: MongoDB 8.0
- **Authentication**: JWT + bcryptjs
- **Image Processing**: Image optimization with Next.js Image component

### AI Integration
- **HuggingFace** - Image generation and AI inference
- **Google Gemini** - Advanced text generation and analysis
- **OpenAI** - Optional GPT integration for premium features

## 📋 Prerequisites

- Node.js 16.x or higher
- npm or yarn
- MongoDB (local or cloud)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/storyforge.git
cd storyforge
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/storyforge

# Authentication
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# AI Services
HUGGINGFACE_API_KEY=your-hf-key-here
OPENAI_API_KEY=your-openai-key-here
GEMINI_API_KEY=your-gemini-key-here

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=StoryForge
ADMIN_EMAIL=admin@storyforge.com
```

### 4. Start MongoDB (Local)
```bash
# Make sure MongoDB is running locally on port 27017
mongod
```

### 5. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── admin/             # Admin panel
│   ├── create/            # Story creation
│   ├── dashboard/         # User dashboard
│   ├── explore/           # Story discovery
│   └── story/             # Story pages
├── components/            # Reusable components
│   ├── ai/               # AI feature components
│   ├── layout/           # Layout components
│   ├── story/            # Story-related components
│   ├── social/           # Social features
│   └── ui/               # UI components
├── context/              # React Context (Auth, Theme)
├── lib/                  # Utilities and helpers
│   ├── ai.js            # AI integrations
│   ├── auth.js          # Authentication logic
│   ├── mongodb.js       # Database connection
│   └── utils.js         # Helper functions
└── models/              # Mongoose models
```

## 🔐 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Stateless authentication with JWT
- **Environment Variables**: Sensitive data stored in `.env.local` (excluded from Git)
- **SQL Injection Prevention**: MongoDB parameterized queries
- **XSS Protection**: React's built-in XSS protection
- **CORS**: Configured API routes with proper CORS headers

## 🎯 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Stories
- `GET /api/stories` - Get all stories with pagination/filtering
- `POST /api/stories` - Create new story
- `GET /api/stories/[id]` - Get story details
- `PUT /api/stories/[id]` - Update story
- `DELETE /api/stories/[id]` - Delete story

### Interactions
- `POST /api/stories/[id]/like` - Like a story
- `POST /api/stories/[id]/bookmark` - Bookmark a story
- `POST /api/stories/[id]/comment` - Add comment

### AI Features
- `POST /api/ai/generate-image` - Generate story cover image
- `POST /api/ai/story-assist` - Get writing suggestions
- `POST /api/ai/summarize` - Auto-generate story summary

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Bug Report & Feature Requests

Found a bug or have a feature request? Please open an issue on GitHub.

## 📞 Contact

For questions or support, feel free to reach out or open an issue on the repository.

---

**Happy Writing! ✍️**

Made with ❤️ by StoryForge Contributors
=======
# StoryForge
>>>>>>> 751f293aee0b51d9887e6a8c4bb582ad7674ffb1
