# ToolSuite Pro - Professional Online Tools Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%5E18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%5E5.5.3-blue)](https://www.typescriptlang.org/)

A comprehensive, professional online tools suite offering 50+ powerful utilities for file conversion, PDF processing, image editing, audio/video manipulation, and more. Built with React, TypeScript, and modern web technologies for optimal performance and user experience.

## 🚀 Features

- **50+ Professional Tools** across 9 categories
- **No Registration Required** - Start using immediately
- **50 Free Uses Per Tool** with automatic tracking
- **Real-time Processing** with progress indicators
- **Secure File Handling** with 24-hour auto-cleanup
- **Modern Responsive Design** optimized for all devices
- **99.9% Uptime** with robust error handling
- **Lightning Fast** - Processing under 30 seconds
- **Cross-browser Compatible** with modern web standards

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Available Tools](#available-tools)
- [Development](#development)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## 💻 System Requirements

### Prerequisites

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Latest version
- **Modern Web Browser**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Operating System Support

- **Windows**: 10 or later
- **macOS**: 10.15 (Catalina) or later
- **Linux**: Ubuntu 18.04+, CentOS 7+, or equivalent

### Hardware Requirements

- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 2GB free space
- **CPU**: Dual-core processor or better
- **Network**: Stable internet connection for dependencies

## 🛠 Installation

### 1. Clone the Repository

```bash
# Using HTTPS
git clone https://github.com/your-username/toolsuite-pro.git

# Using SSH
git clone git@github.com:your-username/toolsuite-pro.git

# Navigate to project directory
cd toolsuite-pro
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies (if using the full stack)
cd server
npm install
cd ..
```

### 3. Environment Setup

Create environment files for different environments:

```bash
# Copy environment template
cp .env.example .env

# For server (if applicable)
cp server/.env.example server/.env
```

### 4. Configure Environment Variables

Edit the `.env` file with your configuration:

```env
# Frontend Configuration
VITE_APP_NAME=ToolSuite Pro
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:5000/api/v1
VITE_MAX_FILE_SIZE=104857600
VITE_TOOLS_PER_PAGE=20

# Analytics (Optional)
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_HOTJAR_ID=your_hotjar_id

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE_MODE=false
```

For server configuration (if using backend):

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database (Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Security
JWT_SECRET=your_super_secret_jwt_key
BCRYPT_SALT_ROUNDS=12

# File Storage
MAX_FILE_SIZE_FREE=52428800
MAX_FILE_SIZE_PRO=104857600
MAX_FILE_SIZE_PREMIUM=-1

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🚀 Quick Start

### Development Mode

```bash
# Start the development server
npm run dev

# The application will be available at:
# http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Serve production build
npm run serve
```

### With Backend (Full Stack)

```bash
# Terminal 1: Start backend server
cd server
npm run dev

# Terminal 2: Start frontend
npm run dev
```

## 📁 Project Structure

```
toolsuite-pro/
├── public/                 # Static assets
│   ├── icons/             # App icons and favicons
│   └── images/            # Static images
├── src/                   # Source code
│   ├── components/        # React components
│   │   ├── Dashboard/     # Analytics dashboard
│   │   ├── FileUpload/    # File upload components
│   │   ├── Layout/        # Layout components
│   │   ├── Processing/    # Processing queue
│   │   └── Tools/         # Tool-specific components
│   ├── data/              # Static data and configurations
│   │   ├── allTools.ts    # Tool definitions
│   │   ├── pricing.ts     # Pricing plans
│   │   └── tools.ts       # Legacy tool data
│   ├── pages/             # Page components
│   │   ├── DashboardPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── PricingPage.tsx
│   │   └── ToolsPage.tsx
│   ├── store/             # State management (Zustand)
│   │   ├── authStore.ts   # Authentication state
│   │   ├── fileStore.ts   # File management
│   │   ├── processingStore.ts # Processing jobs
│   │   └── toolStore.ts   # Tool usage tracking
│   ├── types/             # TypeScript type definitions
│   │   ├── index.ts       # Main types
│   │   └── tools.ts       # Tool-specific types
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global styles
├── server/                # Backend server (optional)
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── utils/         # Utility functions
│   └── package.json
├── docs/                  # Documentation
├── tests/                 # Test files
├── .env.example           # Environment template
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## ⚙️ Configuration

### Tool Configuration

Add new tools by editing `src/data/allTools.ts`:

```typescript
export const allTools: Tool[] = [
  {
    id: 'your-tool-id',
    name: 'Your Tool Name',
    description: 'Tool description',
    icon: YourIcon, // From lucide-react
    category: 'Your Category',
    tags: ['tag1', 'tag2'],
    supportedFormats: ['.pdf', '.docx'],
    outputFormats: ['.pdf'],
    maxFileSize: '100MB',
    maxFiles: 1,
    processingTime: '< 30s',
    features: [
      'Feature 1',
      'Feature 2'
    ],
    options: [
      {
        key: 'quality',
        label: 'Output Quality',
        type: 'select',
        choices: ['High', 'Medium', 'Low'],
        default: 'High'
      }
    ]
  }
];
```

### Styling Configuration

Customize the design in `tailwind.config.js`:

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
```

### Performance Configuration

Optimize Vite configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

## 🛠 Available Tools

### File Conversion (12 tools)
- PDF ↔ Word, Excel, PowerPoint
- Image ↔ PDF conversions
- HTML to PDF
- Document format conversions

### PDF Tools (8 tools)
- Merge, Split, Compress
- Protect, Unlock, Watermark
- Rotate, Crop pages

### Image Tools (6 tools)
- Resize, Compress, Crop
- Format conversion
- Background removal

### Audio & Video Tools (7 tools)
- Format conversion
- Compression and trimming
- Audio merging

### Data Tools (5 tools)
- CSV ↔ JSON conversion
- Excel processing
- Data validation

### Utility Tools (8 tools)
- QR code generation
- Password generator
- Hash calculator
- URL shortener

### Document Tools (3 tools)
- Text extraction
- Word counting
- Document comparison

### Archive Tools (2 tools)
- ZIP creation/extraction
- File compression

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # TypeScript type checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Utilities
npm run clean        # Clean build artifacts
npm run analyze      # Analyze bundle size
```

### Adding New Tools

1. **Define the tool** in `src/data/allTools.ts`
2. **Create processing logic** in `src/components/Tools/ToolInterface.tsx`
3. **Add tool icon** from lucide-react
4. **Update categories** if needed
5. **Test thoroughly** with various file types

### Code Style Guidelines

- Use **TypeScript** for all new code
- Follow **React Hooks** patterns
- Use **Tailwind CSS** for styling
- Implement **error boundaries** for components
- Add **loading states** for async operations
- Include **accessibility** attributes

### State Management

The application uses Zustand for state management:

```typescript
// Example store usage
import { useToolStore } from '../store/toolStore';

const MyComponent = () => {
  const { usageStats, incrementUsage } = useToolStore();
  
  const handleToolUse = (toolId: string) => {
    incrementUsage(toolId);
  };
  
  return (
    <div>
      Usage: {usageStats[toolId]?.count || 0}
    </div>
  );
};
```

## 🚀 Deployment

### Netlify Deployment

1. **Build the project**:
```bash
npm run build
```

2. **Deploy to Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

3. **Configure environment variables** in Netlify dashboard

### Vercel Deployment

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel --prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "preview"]
```

```bash
# Build and run
docker build -t toolsuite-pro .
docker run -p 3000:3000 toolsuite-pro
```

### Environment-Specific Configurations

#### Production
```env
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
VITE_ENABLE_ANALYTICS=true
```

#### Staging
```env
NODE_ENV=staging
VITE_API_URL=https://staging-api.yourdomain.com
VITE_ENABLE_ANALYTICS=false
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Installation Problems

**Issue**: `npm install` fails with permission errors
```bash
# Solution: Use npm with proper permissions
sudo npm install -g npm@latest
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

**Issue**: Node version compatibility
```bash
# Solution: Use Node Version Manager
nvm install 18
nvm use 18
```

#### 2. Build Issues

**Issue**: TypeScript compilation errors
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

**Issue**: Vite build fails
```bash
# Solution: Clear Vite cache
rm -rf node_modules/.vite
npm run build
```

#### 3. Runtime Issues

**Issue**: Tools not processing files
- Check file size limits in configuration
- Verify supported file formats
- Check browser console for errors
- Ensure stable internet connection

**Issue**: Slow performance
- Clear browser cache
- Check network connection
- Reduce file sizes
- Close unnecessary browser tabs

#### 4. Development Issues

**Issue**: Hot reload not working
```bash
# Solution: Restart development server
npm run dev
```

**Issue**: Styles not updating
```bash
# Solution: Clear Tailwind cache
rm -rf node_modules/.cache
npm run dev
```

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_DEBUG=true
VITE_LOG_LEVEL=debug
```

### Performance Monitoring

Monitor application performance:

```typescript
// Add to main.tsx
if (import.meta.env.PROD) {
  // Performance monitoring code
  console.log('Performance metrics:', performance.getEntriesByType('navigation'));
}
```

### Browser Compatibility

Ensure compatibility across browsers:

```javascript
// Check for required features
if (!window.FileReader) {
  alert('Your browser does not support file reading. Please upgrade.');
}
```

## 📚 Additional Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/guide)
- [Zustand Documentation](https://github.com/pmndrs/zustand)

### Tools & Libraries
- [Lucide React Icons](https://lucide.dev)
- [Framer Motion](https://www.framer.com/motion)
- [React Dropzone](https://react-dropzone.js.org)
- [React Hot Toast](https://react-hot-toast.com)

### Community
- [GitHub Issues](https://github.com/your-username/toolsuite-pro/issues)
- [Discussions](https://github.com/your-username/toolsuite-pro/discussions)
- [Discord Community](https://discord.gg/your-invite)

### API References
- [File API](https://developer.mozilla.org/en-US/docs/Web/API/File)
- [Blob API](https://developer.mozilla.org/en-US/docs/Web/API/Blob)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes
4. **Test** thoroughly
5. **Submit** a pull request

### Code of Conduct

Please read our [Code of Conduct](CODE_OF_CONDUCT.md) before contributing.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons
- All contributors and users of this project

---

**Made with ❤️ by the ToolSuite Pro Team**

For support, email us at support@toolsuitepro.com or create an issue on GitHub.