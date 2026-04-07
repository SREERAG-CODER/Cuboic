const fs = require('fs');
const path = require('path');

const DIRS = [
    path.join(__dirname, 'thambi_admin', 'src'),
    path.join(__dirname, 'thambi_customer', 'src'),
];

const REPLACEMENTS = [
    { search: /restaurantid/g, replace: 'restaurantId' },
    { search: /categoryid/g, replace: 'categoryId' },
    { search: /tableid/g, replace: 'tableId' },
    { search: /orderid/g, replace: 'orderId' },
    { search: /robotid/g, replace: 'robotId' },
    { search: /itemid/g, replace: 'itemId' },
    { search: /customer_sessionid/g, replace: 'customerSessionId' },
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            for (const req of REPLACEMENTS) {
                if (req.search.test(content)) {
                    content = content.replace(req.search, req.replace);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

for (const dir of DIRS) {
    if (fs.existsSync(dir)) {
        processDirectory(dir);
    }
}
console.log('Fixed camelCase!');
