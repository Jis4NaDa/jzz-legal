const fs = require('fs');
const path = require('path');

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('support@goldsave.app')) {
                content = content.replace(/support@goldsave\.app/g, 'support@jzzhelp.myhoness.com');
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log('Updated:', fullPath);
            }
        }
    }
}

walkDir('d:/work/antigravity_work_space/projects/goldsave/legal-pages');
