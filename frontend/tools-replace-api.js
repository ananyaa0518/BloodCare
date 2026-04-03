import fs from 'fs';
import path from 'path';

const searchRegex = /http:\/\/localhost:5001/g;
const replacement = '`${import.meta.env.VITE_API_URL}`';
// Since some are inside fetch('http.../api'), it might be better to replace the string.
// Let's do a smart replace.

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir('/Users/ananyaa/Desktop/BloodCare/frontend/src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Replace direct string: 'http://localhost:5001/api/...' -> `${import.meta.env.VITE_API_URL}/api/...`
    // We need to handle quotes carefully.
    // Pattern 1: 'http://localhost:5001/api/auth/login'
    // -> `${import.meta.env.VITE_API_URL}/api/auth/login`
    content = content.replace(/'http:\/\/localhost:5001(\/.*?)'/g, '`${import.meta.env.VITE_API_URL}$1`');

    // Pattern 2: `http://localhost:5001/api/inventory/${id}`
    // -> `${import.meta.env.VITE_API_URL}/api/inventory/${id}`
    content = content.replace(/`http:\/\/localhost:5001(\/.*?)`/g, '`${import.meta.env.VITE_API_URL}$1`');

    // Pattern 3: socket connection io('http://localhost:5001');
    content = content.replace(/'http:\/\/localhost:5001'/g, 'import.meta.env.VITE_API_URL');
    content = content.replace(/`http:\/\/localhost:5001`/g, 'import.meta.env.VITE_API_URL');

    // Some components might have issues if they have multiple ` or '. Let's just blindly write back.
    fs.writeFileSync(file, content, 'utf8');
});

// Write .env
fs.writeFileSync('/Users/ananyaa/Desktop/BloodCare/frontend/.env', 'VITE_API_URL=http://localhost:5001\n', 'utf8');

console.log('Replacement complete');
