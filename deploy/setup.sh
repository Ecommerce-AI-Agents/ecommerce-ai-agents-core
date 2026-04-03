#!/bin/bash
echo "🚀 Setting up Ecommerce AI Agents..."

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Create test data
echo "👥 Creating test users..."
npm run create-users

echo "📦 Creating test products..."
npm run create-products

# Set up nginx if requested
if [ "$1" = "--nginx" ]; then
    echo "🌐 Configuring nginx..."
    sudo apt-get install -y nginx
    sudo cp deploy/nginx.conf /etc/nginx/sites-available/ecommerce
    sudo ln -sf /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "✅ nginx configured"
fi

echo "🎉 Setup complete!"
echo ""
echo "To start the server:"
echo "  npm start"
echo ""
echo "Access the application:"
echo "  Local: http://localhost:3000"
echo "  With nginx: http://your-server-ip/"
