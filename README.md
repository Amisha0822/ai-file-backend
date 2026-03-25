# Google Drive Clone - Full-Stack Cloud Storage Application

A production-ready Google Drive–like application with authentication, file management, and cloud storage.

<img width="1470" height="956" alt="Screenshot 2025-12-28 at 12 18 13 AM" src="https://github.com/user-attachments/assets/a244c3d3-afa5-4548-a268-41fb928bedc6" />

## 🎯 Features

### Core Functionality

- ✅ **Google OAuth Authentication** - Secure sign-in with Google accounts
- ✅ **File Upload** - Upload files with progress tracking
- ✅ **File Management** - Rename, delete, and search files
- ✅ **File Sharing** - Share files with other users (view/download only)
- ✅ **Cloud Storage** - AWS S3 integration with local fallback
- ✅ **Search** - Case-insensitive file search
- ✅ **Modern UI** - Dark theme matching Figma design

### Technical Features

- 🔐 JWT-based authentication
- 📦 TypeScript (frontend + backend)
- 🗄️ MongoDB with Mongoose
- ☁️ AWS S3 support with automatic fallback
- 🎨 Tailwind CSS with modern design
- 🐳 Docker-ready
- 🚀 Production deployment guides

## 🧱 Tech Stack

### Frontend

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Authentication:** NextAuth.js with Google Provider
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Backend

- **Runtime:** Node.js 20+
- **Framework:** Express
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose
- **Storage:** AWS S3 (SDK v3) + Local Storage
- **Authentication:** JWT verification
- **Validation:** Express Validator
- **Logging:** Winston

## 📁 Project Structure

```
google-drive/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── models/         # Mongoose models
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── services/       # Business logic
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── uploads/            # Local file storage
│   └── Dockerfile
├── frontend/
│   ├── app/                # Next.js pages
│   ├── components/         # React components
│   ├── lib/                # Utilities & config
│   └── types/              # TypeScript types
└── README.md
```

## 🚀 Local Setup

### Prerequisites

- Node.js 20+ and npm
- MongoDB (local or Atlas)
- Google Cloud Project (for OAuth)
- AWS Account (optional, for S3)

### 1. Clone Repository

```bash
git clone <repository-url>
cd google-drive
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/google-drive-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AWS_ACCESS_KEY_ID=your-aws-access-key         # Optional
AWS_SECRET_ACCESS_KEY=your-aws-secret-key     # Optional
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
STORAGE_TYPE=auto  # auto, local, or s3
MAX_FILE_SIZE=104857600  # 100MB
FRONTEND_URL=http://localhost:3000
```

```bash
# Start development server
npm run dev

# Server will run on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create env file
cp env.example .env.local
```

Edit `frontend/.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-change-this-in-production
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
# Start development server
npm run dev

# App will run on http://localhost:3000
```

## 🔐 Google OAuth Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API

### 2. Configure OAuth Consent Screen

1. Navigate to "OAuth consent screen"
2. Choose "External" user type
3. Fill in app information:
   - App name: "Google Drive Clone"
   - User support email: your email
   - Developer contact: your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users (if in testing mode)

### 3. Create OAuth Credentials

1. Navigate to "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Application type: "Web application"
4. Name: "Google Drive Clone"
5. Authorized JavaScript origins:
   - `http://localhost:3000` (local)
   - `https://yourdomain.com` (production)
6. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (local)
   - `https://yourdomain.com/api/auth/callback/google` (production)
7. Copy Client ID and Client Secret to `.env.local`

## ☁️ AWS S3 Setup (Optional)

### 1. Create S3 Bucket

1. Go to [AWS S3 Console](https://s3.console.aws.amazon.com/)
2. Create bucket with unique name
3. Region: Choose closest to users
4. Block Public Access: Keep enabled (files served via presigned URLs)

### 2. Create IAM User

1. Go to IAM Console
2. Create new user: "google-drive-clone"
3. Attach policy: Create custom policy with permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

4. Create access key
5. Copy Access Key ID and Secret to `backend/.env`

## 📡 API Documentation

### Authentication

All API endpoints (except `/api/users/sync`) require Bearer token in `Authorization` header.

```bash
Authorization: Bearer <jwt_token>
```

### Endpoints

#### Users

```
POST   /api/users/sync          # Sync user from OAuth
GET    /api/users/profile       # Get current user profile
```

#### Files

```
POST   /api/files/upload        # Upload file
GET    /api/files               # Get all user files
GET    /api/files/shared        # Get shared files
GET    /api/files/:id           # Get single file
GET    /api/files/:id/download  # Get download URL
PATCH  /api/files/:id/rename    # Rename file
DELETE /api/files/:id           # Delete file
GET    /api/files/search?q=     # Search files
```

#### Sharing

```
POST   /api/share/:id/share     # Share file with user (by email)
POST   /api/share/:id/unshare   # Unshare file
GET    /api/share/:id/sharing   # Get file sharing info
```

### Example: Upload File

```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@/path/to/file.pdf"
```

### Example: Rename File

```bash
curl -X PATCH http://localhost:5000/api/files/<file-id>/rename \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"filename": "new-name.pdf"}'
```

## 🐳 Docker Deployment

### Backend

```bash
cd backend

# Build image
docker build -t google-drive-backend .

# Run container
docker run -p 5000:5000 \
  -e MONGODB_URI=your-mongodb-uri \
  -e JWT_SECRET=your-secret \
  -e GOOGLE_CLIENT_ID=your-client-id \
  -e GOOGLE_CLIENT_SECRET=your-client-secret \
  google-drive-backend
```

## 🚀 Production Deployment

### Frontend (Vercel)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

**Environment Variables:**

- `NEXTAUTH_URL`: https://yourdomain.com
- `NEXTAUTH_SECRET`: (generate with `openssl rand -base64 32`)
- `GOOGLE_CLIENT_ID`: Your Google Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google Client Secret
- `NEXT_PUBLIC_API_URL`: Your backend API URL

### Backend (Render/Railway)

#### Option 1: Render

1. Create account on [Render](https://render.com)
2. New Web Service from GitHub
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`
5. Configure environment variables
6. Deploy

#### Option 2: Railway

1. Create account on [Railway](https://railway.app)
2. New Project from GitHub
3. Configure environment variables
4. Deploy

**Environment Variables:**

- `PORT`: 5000
- `NODE_ENV`: production
- `MONGODB_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: (same as NEXTAUTH_SECRET)
- `AWS_ACCESS_KEY_ID`: AWS Access Key
- `AWS_SECRET_ACCESS_KEY`: AWS Secret Key
- `AWS_REGION`: us-east-1
- `AWS_S3_BUCKET`: Your bucket name
- `FRONTEND_URL`: Your frontend URL

### MongoDB Atlas

1. Create cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create database user
3. Whitelist IP: 0.0.0.0/0 (allow from anywhere)
4. Get connection string
5. Update `MONGODB_URI` in backend config

## 🧪 Testing

### Manual Testing Checklist

- [ ] Sign in with Google
- [ ] Upload single file
- [ ] Upload multiple files
- [ ] Rename file
- [ ] Delete file
- [ ] Search files
- [ ] Share file with another user
- [ ] View shared files
- [ ] Download file
- [ ] Sign out

### Testing with Different Storage

**Local Storage:**

```env
STORAGE_TYPE=local
# Leave AWS credentials empty
```

**S3 Storage:**

```env
STORAGE_TYPE=s3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=xxx
```

**Auto (Default):**

```env
STORAGE_TYPE=auto
# Uses S3 if credentials exist, otherwise local
```

## 🔒 Security Considerations

- ✅ JWT tokens stored in httpOnly cookies
- ✅ CORS configured for specific origin
- ✅ File uploads validated (size)
- ✅ Owner-only delete/rename permissions
- ✅ Shared users have read-only access
- ✅ Environment variables for sensitive data
- ✅ S3 presigned URLs with expiration
- ✅ MongoDB injection prevention via Mongoose

## 📝 Environment Variables Summary

| Variable                | Required | Description                              |
| ----------------------- | -------- | ---------------------------------------- |
| `MONGODB_URI`           | Yes      | MongoDB connection string                |
| `JWT_SECRET`            | Yes      | Secret for JWT signing                   |
| `NEXTAUTH_SECRET`       | Yes      | Secret for NextAuth (same as JWT_SECRET) |
| `GOOGLE_CLIENT_ID`      | Yes      | Google OAuth Client ID                   |
| `GOOGLE_CLIENT_SECRET`  | Yes      | Google OAuth Client Secret               |
| `AWS_ACCESS_KEY_ID`     | No       | AWS Access Key (for S3)                  |
| `AWS_SECRET_ACCESS_KEY` | No       | AWS Secret Key (for S3)                  |
| `AWS_REGION`            | No       | AWS Region (default: us-east-1)          |
| `AWS_S3_BUCKET`         | No       | S3 Bucket name                           |
| `FRONTEND_URL`          | Yes      | Frontend URL for CORS                    |
| `NEXT_PUBLIC_API_URL`   | Yes      | Backend API URL                          |

## 🐛 Troubleshooting

### "Failed to sync user with backend"

- Check backend is running
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check MongoDB connection

### "S3 is not configured"

- Verify AWS credentials in `.env`
- Check IAM permissions
- Ensure bucket exists

### "Invalid or expired token"

- Clear browser cookies
- Check `JWT_SECRET` matches in backend and `NEXTAUTH_SECRET`
- Re-authenticate

### Files not uploading

- Check file size limit (default 100MB)
- Verify storage configuration
- Check disk space (local) or S3 permissions

## 📄 License

MIT

## 👥 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📧 Support

For issues and questions, please open a GitHub issue.

---

**Built with ❤️ using Next.js, Express, MongoDB, and AWS S3**
