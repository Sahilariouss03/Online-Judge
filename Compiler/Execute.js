const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execute = async (filePath, outputPath, input = '') => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    return new Promise((resolve, reject) => {
        const command = `g++ "${filePath}" -o "${outPath}" && cd "${outputPath}" && echo "${input}" | ${jobId}.exe`;
        exec(command, (error, stdout, stderr) => {
            if (error) return reject(error.message);
            if (stderr) return reject(stderr);
            resolve(stdout);
        });
    });
};

module.exports = execute;


