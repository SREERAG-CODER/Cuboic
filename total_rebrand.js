const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const EXCLUDE_DIRS = ['node_modules', '.git', '.gradle', '.expo', 'dist', 'build', '.next', '.idea', '.vscode'];
const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md', '.env', '.prisma', '.xml', '.plist', '.java', '.kt', '.swift', '.cpp', '.h', '.m', '.sh', '.bat', '.ps1'];

function walkAndReplace(dir) {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (EXCLUDE_DIRS.includes(item)) continue;
            walkAndReplace(fullPath);
            
            // Rename directory after processing children
            if (item.toLowerCase().includes('thambi')) {
                const newItemName = item.replace(/Thambi/g, 'Thambi').replace(/thambi/g, 'thambi');
                const newDirPath = path.join(dir, newItemName);
                if (fullPath !== newDirPath) {
                    fs.renameSync(fullPath, newDirPath);
                    console.log(`Renamed directory: ${item} -> ${newItemName}`);
                }
            }
        } else {
            // Replace text content
            const ext = path.extname(item);
            if (FILE_EXTENSIONS.includes(ext) || item.startsWith('.') || item === 'package.json') {
                try {
                    const content = fs.readFileSync(fullPath, 'utf8');
                    let newContent = content;

                    // Rebrand logic
                    // We use regex to handle case sensitivity
                    newContent = newContent.replace(/Thambi/g, 'Thambi');
                    
                    // Special case: Preserve render URL if it matches exactly
                    // The user said "except for some URL" in the first request
                    // If we find the render url, we'll restore it after the mass replace
                    const renderUrlMatch = content.includes('cuboic-884m.onrender.com');
                    
                    newContent = newContent.replace(/thambi/g, 'thambi');

                    if (renderUrlMatch) {
                        newContent = newContent.replace(/thambi-884m\.onrender\.com/g, 'cuboic-884m.onrender.com');
                    }

                    if (content !== newContent) {
                        fs.writeFileSync(fullPath, newContent);
                        console.log(`Updated content: ${fullPath}`);
                    }
                } catch (e) {
                    console.error(`Skipping file ${fullPath}: ${e.message}`);
                }
            }

            // Rename file
            if (item.toLowerCase().includes('thambi')) {
                const newItemName = item.replace(/Thambi/g, 'Thambi').replace(/thambi/g, 'thambi');
                const newFilePath = path.join(dir, newItemName);
                if (fullPath !== newFilePath) {
                    fs.renameSync(fullPath, newFilePath);
                    console.log(`Renamed file: ${item} -> ${newItemName}`);
                }
            }
        }
    }
}

console.log('Starting total rebrand from Thambi to Thambi...');
walkAndReplace(ROOT_DIR);
console.log('Rebrand complete!');
