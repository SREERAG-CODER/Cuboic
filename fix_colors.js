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
            if (fullPath.match(/\.(tsx|ts|jsx|js|css)$/)) {
                let content = fs.readFileSync(fullPath, 'utf8');
                
                let newContent = content
                    // Hex codes
                    .replace(/#d4861a/gi, '#65a30d')
                    .replace(/#c4751a/gi, '#65a30d')
                    .replace(/#b36e14/gi, '#4d7c0f')
                    .replace(/#a35e10/gi, '#4d7c0f')
                    .replace(/#eb9d28/gi, '#84cc16')
                    .replace(/#f0a02a/gi, '#74b916')
                    .replace(/#f7b340/gi, '#90d820')
                    .replace(/#f5a623/gi, '#65a30d')
                    .replace(/#c4831a/gi, '#4d7c0f')
                    
                    // RGB values
                    .replace(/212, 134, 26/g, '101, 163, 13')
                    .replace(/196, 117, 26/g, '101, 163, 13')
                    .replace(/245, 166, 35/g, '101, 163, 13');
                    
                if (content !== newContent) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log('Updated colors in: ' + fullPath);
                }
            }
        }
    });
}

replaceInDir(path.join(__dirname, 'cuboic_customer', 'src'));
replaceInDir(path.join(__dirname, 'cuboic_admin', 'src'));
replaceInDir(path.join(__dirname, 'cuboic_mobile', 'src'));
console.log('Color replacements complete!');
