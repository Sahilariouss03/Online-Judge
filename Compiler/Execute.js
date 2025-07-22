const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execute = async (filePath, outputPath) => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    return new Promise((resolve, reject) => {
        exec(`g++ "${filePath}" -o "${outPath}" && cd "${outputPath}" && ${jobId}.exe`, (error, stdout, stderr) => {
            if (error) return reject(error.message);
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
};

module.exports = execute;


