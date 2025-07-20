# 🌐 Mirror.xyz Clone - Decentralized Publishing Platform

A complete decentralized publishing platform built with Irys blockchain storage, featuring rich text editing, social features, monetization, NFT integration, and analytics.

## 🚀 Features

### Core Features
- **Rich Text Editor**: TipTap-based editor with markdown support, image uploads, and real-time collaboration
- **Irys Integration**: Permanent blockchain storage with devnet and mainnet support
- **Wallet Connection**: MetaMask integration for Web3 authentication
- **Article Publishing**: Create, edit, and publish articles with metadata
- **Content Discovery**: Search, filter, and discover content by authors, tags, and categories

### Social Features
- **Comments System**: Threaded comments with reactions (like/dislike)
- **User Engagement**: Track views, likes, comments, and shares
- **Author Profiles**: Complete author profiles with stats and social links
- **Following System**: Follow authors and get notifications

### Monetization Features
- **Tipping System**: Send tips to authors in ETH, MATIC, or USDC
- **Paid Content**: Create premium articles with paywalls
- **Subscriptions**: Monthly/yearly subscriptions to authors
- **Revenue Analytics**: Track earnings, views, and engagement metrics

### NFT Integration
- **Article NFTs**: Mint articles as NFTs with royalties
- **NFT Marketplace**: Buy, sell, and trade article NFTs
- **Collections**: Create and manage NFT collections
- **Royalties**: Automatic royalty distribution to creators

### Analytics & Insights
- **Article Analytics**: Track views, engagement, and performance
- **Author Analytics**: Monitor author performance and earnings
- **Platform Analytics**: Platform-wide statistics and trends
- **Search Analytics**: Track search queries and popular content

### Advanced Features
- **PWA Support**: Progressive Web App with offline capabilities
- **Dark Theme**: Beautiful dark theme UI with Tailwind CSS
- **Responsive Design**: Mobile-first responsive design
- **SEO Optimized**: Meta tags, structured data, and social sharing

## 🛠️ Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MongoDB**: NoSQL database for flexible data storage
- **Irys SDK**: Blockchain storage integration
- **Pydantic**: Data validation and serialization
- **Motor**: Async MongoDB driver

### Frontend
- **React 19**: Latest React with hooks and context
- **TipTap**: Rich text editor with extensions
- **Tailwind CSS**: Utility-first CSS framework
- **Ethers.js**: Ethereum wallet integration
- **Irys SDK**: Frontend blockchain integration

### Blockchain
- **Irys**: Permanent decentralized storage
- **Ethereum**: Smart contracts and payments
- **Polygon**: Layer 2 scaling solution
- **MetaMask**: Wallet connection

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Python 3.8+ and pip
- MongoDB (local or cloud)
- MetaMask browser extension

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd irys-medium-main
```

2. **Install Python dependencies**
```bash
cd backend
pip install -r requirements.txt
```

3. **Set up environment variables**
```bash
cp env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (cloud)
```

5. **Run the backend**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Node.js dependencies**
```bash
cd frontend
npm install
# or
yarn install
```

2. **Set up environment variables**
```bash
# Create .env file
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_IRYS_NETWORK=devnet
```

3. **Start the development server**
```bash
npm start
# or
yarn start
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=mirror_clone

# Irys Configuration
IRYS_NETWORK=devnet
IRYS_NODE=https://devnet.irys.xyz
IRYS_GATEWAY=https://gateway.irys.xyz

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=24h

# Server Configuration
PORT=8000
HOST=0.0.0.0
DEBUG=true

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

#### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_IRYS_NETWORK=devnet
REACT_APP_IRYS_NODE=https://devnet.irys.xyz
REACT_APP_GATEWAY_URL=https://gateway.irys.xyz
```

## 🚀 Usage

### Getting Started

1. **Connect Wallet**: Click "Connect Wallet" to connect MetaMask
2. **Fund Irys Node**: Add funds to your Irys node for storage
3. **Create Profile**: Set up your author profile
4. **Write Articles**: Use the rich text editor to create content
5. **Publish**: Articles are permanently stored on Irys blockchain

### Writing Articles

1. Navigate to `/write`
2. Enter article title and content
3. Add tags and select category
4. Preview your article
5. Click "Publish" to store on Irys

### Monetization

1. **Tipping**: Use the tip button on any article
2. **Paid Content**: Set up paywalls for premium articles
3. **Subscriptions**: Create subscription tiers for your content
4. **NFTs**: Mint your articles as NFTs

### Social Features

1. **Comments**: Leave comments on articles
2. **Reactions**: Like/dislike comments and articles
3. **Sharing**: Share articles on social media
4. **Following**: Follow your favorite authors

## 📊 API Documentation

### Core Endpoints

#### Articles
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create new article
- `GET /api/articles/{id}` - Get article by ID
- `GET /api/articles/author/{wallet}` - Get articles by author
- `POST /api/articles/search` - Search articles

#### Authors
- `POST /api/authors` - Create author profile
- `GET /api/authors/{wallet}` - Get author profile
- `PUT /api/authors/{wallet}` - Update author profile

#### Comments
- `GET /api/comments/article/{id}` - Get article comments
- `POST /api/comments` - Create comment
- `POST /api/comments/{id}/reactions` - Add reaction

#### Monetization
- `POST /api/monetization/tips` - Send tip
- `POST /api/monetization/paid-content` - Create paid content
- `POST /api/monetization/subscriptions` - Create subscription

#### NFTs
- `POST /api/nft` - Create NFT
- `GET /api/nft/marketplace/listed` - Get listed NFTs
- `POST /api/nft/sales` - Create NFT sale

#### Analytics
- `POST /api/analytics/pageviews` - Track page view
- `GET /api/analytics/stats/article/{id}` - Get article stats
- `GET /api/analytics/stats/platform` - Get platform stats

## 🎨 UI Components

### Core Components
- `WalletConnect`: MetaMask wallet integration
- `RichTextEditor`: TipTap-based rich text editor
- `Navigation`: Main navigation bar
- `ArticleCard`: Article preview cards

### Social Components
- `CommentSection`: Article comments with threading
- `TipButton`: Tipping interface
- `ShareButtons`: Social media sharing

### Monetization Components
- `PaidContentModal`: Premium content interface
- `SubscriptionCard`: Subscription management
- `RevenueDashboard`: Earnings analytics

### NFT Components
- `NFTMintModal`: NFT creation interface
- `NFTMarketplace`: NFT trading interface
- `NFTCollection`: Collection management

### Analytics Components
- `AnalyticsDashboard`: Platform and author analytics
- `RevenueDashboard`: Revenue tracking and insights

## 🔒 Security

### Authentication
- Wallet-based authentication with MetaMask
- JWT tokens for session management
- CORS protection for API endpoints

### Data Validation
- Pydantic models for backend validation
- Input sanitization and validation
- Rate limiting for API endpoints

### Blockchain Security
- Secure private key management
- Transaction signing with MetaMask
- Irys node funding verification

## 🚀 Deployment

### Backend Deployment (Hostinger VPS)

1. **Server Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and Python
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

2. **Application Deployment**
```bash
# Clone repository
git clone <repository-url>
cd irys-medium-main

# Setup backend
cd backend
pip install -r requirements.txt
cp env.example .env
# Edit .env with production values

# Setup frontend
cd ../frontend
npm install
npm run build

# Start with PM2
pm2 start ../backend/server.py --name mirror-api
pm2 save
pm2 startup
```

3. **Nginx Configuration**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/mirror-clone/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

4. **SSL Certificate**
```bash
sudo certbot --nginx -d yourdomain.com
```

### Frontend Deployment (Vercel/Netlify)

1. **Vercel Deployment**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

2. **Netlify Deployment**
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=build
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Irys](https://irys.xyz) for permanent blockchain storage
- [TipTap](https://tiptap.dev) for the rich text editor
- [Tailwind CSS](https://tailwindcss.com) for styling
- [FastAPI](https://fastapi.tiangolo.com) for the backend framework

## 📞 Support

- **Documentation**: [Project Wiki](link-to-wiki)
- **Issues**: [GitHub Issues](link-to-issues)
- **Discord**: [Community Server](link-to-discord)
- **Email**: support@yourdomain.com

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with core features
- Irys integration for permanent storage
- Rich text editor with markdown support
- Social features (comments, reactions)
- Monetization system (tips, paid content)
- NFT integration and marketplace
- Analytics and insights dashboard
- PWA support and responsive design

---

**Built with ❤️ for the decentralized web**
