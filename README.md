# 🛍️ Ecommerce AI Agents

> Lightweight e-commerce platform with native AI integration

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Live Demo](https://img.shields.io/badge/demo-live-green)](http://119.45.238.161/)

## 🚀 Features

### ✅ Core E-commerce Features
- **User Authentication**: Login, registration, role-based permissions
- **Product Management**: CRUD operations, inventory tracking
- **Shopping Experience**: Responsive product pages, cart functionality
- **Order Processing**: Complete order workflow

### 🤖 AI Integration
- **AI Chat Support**: Native AI conversation capabilities
- **Smart Recommendations**: Personalized product suggestions
- **Automated Customer Service**: FAQ and support automation
- **Sales Analytics**: AI-powered insights and predictions

### 🏗️ Technical Features
- **Modern Stack**: Node.js + Express + RESTful API
- **Production Ready**: Nginx configuration, deployment scripts
- **Scalable Architecture**: Modular design, easy to extend
- **Security**: Authentication middleware, input validation

## 📦 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation
```bash
# Clone the repository
git clone https://github.com/Ecommerce-AI-Agents/ecommerce-ai-agents-core.git
cd ecommerce-ai-agents-core

# Install dependencies
npm install

# Create test data
npm run create-users
npm run create-products

# Start the server
npm start
```

### Default Test Accounts
```
👑 Admin: admin@test.com / Admin123!
👤 Customer: user@test.com / User123!
```

### Default Test Products
```
📦 Smart Watch Ultra Pro: ¥1499
🎧 Wireless Noise-Canceling Headphones: ¥899
🛋️ Modern Minimalist Sofa: ¥2999
```

## 🌐 Live Demo

Visit our live production environment:
- **Main Site**: http://119.45.238.161/
- **Admin Panel**: http://119.45.238.161/admin
- **Products**: http://119.45.238.161/products
- **Health Check**: http://119.45.238.161/health

## 🏗️ Project Structure

```
ecommerce-ai-agents-core/
├── src/
│   ├── server/          # Server-side code
│   ├── public/          # Frontend HTML/CSS/JS
│   ├── api/             # API endpoints
│   └── middleware/      # Express middleware
├── scripts/             # Utility scripts
├── docs/               # Documentation
├── deploy/             # Deployment configurations
├── package.json        # Dependencies and scripts
└── README.md           # This file
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
PORT=3000
NODE_ENV=production
API_KEY=your_api_key_here
AI_SERVICE_URL=https://api.openai.com/v1
```

### Nginx Configuration
See `deploy/nginx.conf` for production deployment.

## 🚀 Deployment

### Manual Deployment
```bash
# 1. Clone and install
git clone https://github.com/Ecommerce-AI-Agents/ecommerce-ai-agents-core.git
cd ecommerce-ai-agents-core
npm install --production

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start the server
npm start

# 4. Set up nginx (optional for production)
sudo cp deploy/nginx.conf /etc/nginx/sites-available/ecommerce
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo systemctl reload nginx
```

### Docker Deployment
```bash
docker build -t ecommerce-ai-agents .
docker run -p 3000:3000 -d ecommerce-ai-agents
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Node.js and Express
- Inspired by modern e-commerce platforms
- Powered by AI technology

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/Ecommerce-AI-Agents/ecommerce-ai-agents-core/issues)
- **Documentation**: [Project Wiki](https://github.com/Ecommerce-AI-Agents/ecommerce-ai-agents-core/wiki)
- **Live Demo**: http://119.45.238.161/

## 🏆 Status

**Production Ready** - Used in live environment with real users.

**Version**: 2.0.0  
**Last Updated**: 2026-04-03  
**Live Demo**: ✅ Running at http://119.45.238.161/
```

## 🎯 Roadmap

- [x] Core e-commerce functionality
- [x] User authentication and authorization
- [x] Production deployment
- [ ] AI chat integration (in progress)
- [ ] Payment gateway integration
- [ ] Multi-store support
- [ ] Advanced analytics dashboard
- [ ] Mobile app

---

**⭐ If you find this project useful, please give it a star on GitHub!**
