# Trustimonials

A user-friendly testimonial collection and display platform built with React, Node.js, Express, MongoDB, and Tailwind CSS. Transform customer feedback into powerful social proof that builds trust and drives conversions.

## ✨ Features

- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Testimonial Collection**: Create custom testimonial request links and share them with customers
- **Public Submission Pages**: Beautiful, responsive forms for customers to submit testimonials
- **Moderation Workflow**: Admin approval system for quality control
- **Embeddable Widgets**: Light and dark theme widgets that can be embedded on any website
- **File Upload Support**: Image attachments for testimonials
- **Responsive Design**: Mobile-first, accessible UI following design system principles
- **Real-time Updates**: Live dashboard with statistics and management tools

## 🛠 Tech Stack

- **Frontend**: React 18, React Router, Axios, Tailwind CSS, React Hook Form
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT, bcrypt
- **File Upload**: Multer
- **Dev Tools**: ESLint, Prettier, nodemon, concurrently

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- npm or yarn

### Automated Setup

1. **Clone and setup**:
   ```bash
   git clone <repository-url>
   cd trustimonials
   node setup.js
   ```

2. **Start MongoDB** (if not already running):
   ```bash
   mongod
   ```

3. **Seed the database**:
   ```bash
   cd backend
   npm run seed
   ```

4. **Start development servers**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm run install-all
   ```

2. **Configure environment**:
   - Copy `backend/env.example` to `backend/.env`
   - Copy `frontend/env.example` to `frontend/.env`
   - Update MongoDB URI and other settings as needed

3. **Start services**:
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend  
   cd frontend && npm start
   ```

## 👤 Demo Accounts

- **Admin**: admin@trustimonials.com / Passw0rd!
- **User**: user1@trustimonials.com / Passw0rd!

## 📁 Project Structure

```
trustimonials/
├── backend/                    # Express.js API server
│   ├── models/                # Mongoose data models
│   ├── routes/                # API route handlers
│   ├── middleware/            # Custom middleware
│   ├── scripts/               # Database seeding & testing
│   └── uploads/               # File upload storage
├── frontend/                  # React.js client application
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── contexts/         # React contexts
│   │   ├── utils/            # Utility functions
│   │   └── styles/           # CSS and design tokens
│   └── public/               # Static assets & widget script
├── package.json              # Root package.json for scripts
└── README.md
```

## 🎨 Design System

The project uses a comprehensive design system with:

- **Trust-focused color palette**: Primary blues, success greens, and neutral grays
- **Accessibility-first**: WCAG 2.1 AA compliant with proper contrast ratios
- **Responsive design**: Mobile-first approach with Tailwind CSS
- **Component library**: Reusable, accessible UI components
- **Dark/Light themes**: Support for both theme modes

### Color Tokens

```css
--color-primary: #0B78D1      /* Trust blue */
--color-cta: #00A676          /* Action green */
--color-accent: #FFB86B       /* Highlight orange */
--color-success: #0F9D58      /* Success green */
--color-warning: #F59E0B      /* Warning amber */
--color-danger: #E53E3E       /* Error red */
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Testimonials
- `POST /api/testimonials` - Submit testimonial
- `GET /api/testimonials` - List testimonials (with filters)
- `GET /api/testimonials/:id` - Get testimonial details
- `PUT /api/testimonials/:id` - Update testimonial
- `DELETE /api/testimonials/:id` - Delete testimonial
- `POST /api/testimonials/:id/approve` - Approve testimonial (admin)

### Links
- `POST /api/links` - Create testimonial request link
- `GET /api/links` - Get user's links
- `PUT /api/links/:id` - Update link
- `DELETE /api/links/:id` - Delete link

### Templates
- `GET /api/templates` - List templates
- `POST /api/templates` - Create template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template

### File Uploads
- `POST /api/uploads` - Upload single image
- `POST /api/uploads/multiple` - Upload multiple images

### Public
- `GET /t/:slug` - Public testimonial submission page

## 🧪 Testing

Run the database connectivity test:
```bash
cd backend
npm test
```

## 📦 Deployment

### Backend Deployment

1. Set production environment variables
2. Build and start the server:
   ```bash
   cd backend
   npm start
   ```

### Frontend Deployment

1. Build the React app:
   ```bash
   cd frontend
   npm run build
   ```

2. Serve the `build` folder with your preferred static hosting service

### Environment Variables

**Backend (.env)**:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/trustimonials
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
FRONTEND_URL=https://yourdomain.com
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_FRONTEND_URL=https://yourdomain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the demo accounts for testing

## 🎯 Roadmap

- [ ] Email notifications for testimonial submissions
- [ ] Advanced analytics and reporting
- [ ] Custom CSS themes for widgets
- [ ] Bulk testimonial import/export
- [ ] API rate limiting and monitoring
- [ ] Mobile app for testimonial management
