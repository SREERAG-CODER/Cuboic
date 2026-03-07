const fs = require('fs');
const path = require('path');

const dir = process.argv[2] || '.';

const replacements = [
    [/_id/g, 'id'],
    [/restaurant_id/g, 'restaurantId'],
    [/category_id/g, 'categoryId'],
    [/table_id/g, 'tableId'],
    [/user_id/g, 'userId'],
    [/item_id/g, 'itemId'],
    [/robot_id/g, 'robotId'],
    [/order_id/g, 'orderId'],
    [/customer_session_id/g, 'customerSessionId'],
    [/password_hash/g, 'passwordHash'],
    [/logo_url/g, 'logoUrl'],
    [/unit_price/g, 'unitPrice'],
    [/total_amount/g, 'totalAmount'],
];

function walk(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const [regex, replacement] of replacements) {
                if (regex.test(content)) {
                    // special handling for _id to id so we don't break names like user_id
                    // actually since restaurant_id runs before _id if we order it? No, _id runs first.
                    // Let's refine the order to avoid partial matches
                    modified = true;
                }
            }

            // Safe replacement logic: replace complete words using \b
            let newContent = content
                .replace(/\brestaurant_id\b/g, 'restaurantId')
                .replace(/\bcategory_id\b/g, 'categoryId')
                .replace(/\btable_id\b/g, 'tableId')
                .replace(/\buser_id\b/g, 'userId')
                .replace(/\bitem_id\b/g, 'itemId')
                .replace(/\brobot_id\b/g, 'robotId')
                .replace(/\border_id\b/g, 'orderId')
                .replace(/\bcustomer_session_id\b/g, 'customerSessionId')
                .replace(/\bpassword_hash\b/g, 'passwordHash')
                .replace(/\blogo_url\b/g, 'logoUrl')
                .replace(/\bunit_price\b/g, 'unitPrice')
                .replace(/\btotal_amount\b/g, 'totalAmount');

            // Handle remaining standalone _id
            // But only if it's not part of an object destruction or variable starting with id
            newContent = newContent.replace(/(?<!\w)_id(?!\w)/g, 'id');

            if (content !== newContent) {
                console.log(`Updated ${fullPath}`);
                fs.writeFileSync(fullPath, newContent, 'utf8');
            }
        }
    }
}

walk(dir);
console.log('Backend keys updated!');
