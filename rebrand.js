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
                    .replace(/Cuboic/g, 'Thambi')
                    .replace(/cuboic(?!_)/g, 'thambi') // avoid changing cuboic_backend folder references if any
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

replaceInDir(path.join(__dirname, 'cuboic_customer'));
replaceInDir(path.join(__dirname, 'cuboic_admin'));
replaceInDir(path.join(__dirname, 'cuboic_mobile'));
replaceInDir(path.join(__dirname, 'cuboic_backend'));
console.log('Rebranding complete!');
