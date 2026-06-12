const fs = require('fs');
const path = require('path');

const pageMapping = {
  '(public)': {
    '': 'LandingPage',
    'products': 'ProductsPage',
    'products/[id]': 'ProductDetailPage',
    'cart': 'CartPage',
    'checkout': 'CheckoutPage',
    'login': 'LoginPage',
    'signup': 'SignupPage',
    'dashboard': 'Dashboard',
    'wishlist': 'WishlistPage',
    'visual-search': 'VisualSearchPage',
  },
  'admin/login': {
    '': 'AdminLoginPage'
  },
  '(admin)/admin': {
    'dashboard': 'AdminDashboard',
    'orders': 'Orders',
    'products': 'Products',
    'add-product': 'AddProduct',
    'products/edit/[id]': 'UpdateProduct',
    'wishlist': 'WishlistAdmin'
  }
};

const appDir = path.join(__dirname, 'src/app');

function getImportPath(pageName) {
  if (['AdminDashboard', 'Products', 'AddProduct', 'UpdateProduct', 'Orders', 'WishlistAdmin'].includes(pageName)) {
    return 'src/admin/pages/' + pageName;
  }
  return 'src/pages/' + pageName;
}

for (const group in pageMapping) {
  for (const route in pageMapping[group]) {
    const pageName = pageMapping[group][route];
    
    // Create directory path
    let routePath = route ? path.join(appDir, group, route) : path.join(appDir, group);
    if (!fs.existsSync(routePath)) {
        fs.mkdirSync(routePath, { recursive: true });
    }
    
    const pageFilePath = path.join(routePath, 'page.jsx');
    
    // Calculate relative path from pageFilePath back to the page component
    const relativeToSrc = path.relative(routePath, path.join(__dirname, getImportPath(pageName)));
    // replace backslashes with forward slashes for imports
    const importPath = relativeToSrc.replace(/\\/g, '/');

    const content = `"use client";
import ${pageName} from '${importPath}';

export default function Page() {
  return <${pageName} />;
}
`;
    fs.writeFileSync(pageFilePath, content);
    console.log(`Created ${pageFilePath}`);
  }
}
