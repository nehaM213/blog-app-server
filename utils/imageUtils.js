const fs = require('fs');
const path = require('path');

function checkImage(image) {
    if (typeof image !== 'string') return null;
    const matches = image.match(/^data:image\/(\w+);base64,/);
    if (!matches) return null;
    return matches[1].toLowerCase();
}

function saveImage(profileImage, fileName) {
    const base64Data = profileImage.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const imagePath = path.join(__dirname, '../public/uploads/', fileName);
    fs.writeFileSync(imagePath, buffer);
    return imagePath;
}

function deletImage(filePath) {
    try {
        if (!filePath) return;
        const absolutePath = path.resolve(filePath);
        console.log('Deleting file at:', absolutePath);
        fs.unlinkSync(absolutePath);
    } catch (err) {
        console.warn(`Failed to delete file: ${err.message}`);
    }
}

module.exports = { checkImage, saveImage, deletImage };
