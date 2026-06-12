const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Ensure "use client" if there are hooks or DOM usage, but only for .jsx files
      if (fullPath.endsWith('.jsx') && !content.includes('"use client"')) {
        content = '"use client";\n' + content;
        changed = true;
      }

      if (content.includes('react-router-dom')) {
        // Replace Link imports
        content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"];/g, (match, imports) => {
          let nextImports = [];
          let navigationImports = [];
          if (imports.includes('Link')) {
            nextImports.push("import Link from 'next/link';");
          }
          if (imports.includes('useNavigate')) {
            navigationImports.push('useRouter');
          }
          if (imports.includes('useLocation')) {
            navigationImports.push('usePathname');
          }
          
          let res = [];
          if (nextImports.length > 0) res.push(...nextImports);
          if (navigationImports.length > 0) res.push(`import { ${navigationImports.join(', ')} } from 'next/navigation';`);
          return res.join('\n');
        });

        // Replace `to=` with `href=`
        content = content.replace(/<Link\s+([^>]*?)to=/g, '<Link $1href=');
        
        // Replace useNavigate() with useRouter()
        content = content.replace(/useNavigate\(\)/g, 'useRouter()');

        // Replace useLocation() with usePathname()
        content = content.replace(/useLocation\(\)/g, 'usePathname()');

        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(path.join(__dirname, 'src/pages'));
processDir(path.join(__dirname, 'src/components'));
processDir(path.join(__dirname, 'src/admin/pages'));
processDir(path.join(__dirname, 'src/services'));

