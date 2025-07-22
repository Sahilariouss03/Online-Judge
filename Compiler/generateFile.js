const fs = require('fs');
const path = require('path');
const {v4:uuid}  = require('uuid');

const dirCodes = path.join(__dirname, 'codes'); // ' returns /online-judge/backend/Compiler/codes'

if(!fs.existsSync(dirCodes)){
    fs.mkdirSync(dirCodes, { recursive:true });
}

const generateFile = (content, format)=>{
    const fileName = `${uuid()}.${format}`; 
    const filePath = path.join(dirCodes,fileName);
    fs.writeFileSync(filePath,content);
    return filePath;
}

module.exports = generateFile;

