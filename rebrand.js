const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!['node_modules', '.git', '.expo', 'dist', 'build'].includes(file)) {
                replaceInDir(fullPath);
            }
        } else {
            if (fullPath.match(/\.(tsx|ts|jsx|js|css|html|json)$/)) {
                let content = fs.readFileSync(fullPath, 'utf8');

                // Keep onrender.com backend URL working if they haven't migrated it
                const preserveRenderUrl = content.includes('cuboic-884m.onrender.com');

                let newContent = content
                    .replace(/Thambi/g, 'Thambi')
                    .replace(/thambi(?!_)/g, 'thambi') // avoid changing thambi_backend folder references if any
                    .replace(/logo1\.png/g, 'pic1.png')
                    .replace(/logo\.png/g, 'pic1.png');

                if (preserveRenderUrl) {
                    newContent = newContent.replace(/thambi\.onrender\.com/g, 'cuboic-884m.onrender.com');
                }

                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Updated: ' + fullPath);
                }
            }
        }
    });
}

replaceInDir(path.join(__dirname, 'thambi_customer'));
replaceInDir(path.join(__dirname, 'thambi_admin'));
replaceInDir(path.join(__dirname, 'thambi_mobile'));
replaceInDir(path.join(__dirname, 'thambi_backend'));
console.log('Rebranding complete!');
