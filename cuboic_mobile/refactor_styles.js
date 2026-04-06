const fs = require('fs');
const path = require('path');

const targetKeys = /(card|container|btn|header|tab|input|form)/i;

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove existing shadow/elevation lines
    content = content.replace(/^(\s*)(shadowColor|shadowOffset|shadowOpacity|shadowRadius|elevation)\s*:.*?,?\s*$/gm, '');

    // Now inject ...S.shadow into target keys in the StyleSheet
    // We will look for keys that contain target words.
    // E.g.    btn: { ... }  or  myCardContainer: { ... }
    
    // We look for StyleSheet.create({ block })
    // To be safe, we'll replace lines like:  `   keyName: {` 
    // where keyName includes one of the target words.
    const keyRegex = /^(\s*)([a-zA-Z0-9_]+)\s*:\s*\{/gm;
    content = content.replace(keyRegex, (match, indent, key) => {
        if (targetKeys.test(key) && !key.toLowerCase().includes('text') && !key.toLowerCase().includes('title')) {
            // Put it after the opening brace
            return `${match}\n${indent}    ...S.shadow,`;
        }
        return match;
    });

    // Make sure S is imported from theme
    if (!content.includes('import { S') && !content.includes(', S ') && !content.includes(', S}')) {
        // Find where theme is imported
        if (content.includes("from '../../theme'") || content.includes("from '../theme'")) {
            content = content.replace(/import \{(.*?)\} from '(\.\.\/)*theme';/, (match, p1, p2) => {
                if (!p1.includes('S')) {
                    return `import { S, ${p1.trim()} } from '${p2 || ""}theme';`;
                }
                return match;
            });
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

const screensDir = path.join(__dirname, 'src', 'screens');
processDirectory(screensDir);
console.log('Done refactoring styles');
