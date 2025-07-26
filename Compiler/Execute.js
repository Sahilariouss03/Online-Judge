const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execute = async (filePath, outputPath, input = '') => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, `${jobId}.exe`);
    
    return new Promise((resolve, reject) => {
        // Compile the code first
        const compileCommand = `g++ "${filePath}" -o "${outPath}"`;
        
        exec(compileCommand, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                return reject(compileError.message);
            }
            if (compileStderr) {
                return reject(compileStderr);
            }
            
            // Now run the executable with input
            let runCommand;
            if (input) {
                // Create a temporary input file to avoid escaping issues
                const inputPath = path.join(outputPath, `${jobId}_input.txt`);
                fs.writeFileSync(inputPath, input, 'utf8');
                runCommand = `cd "${outputPath}" && ${jobId}.exe < "${inputPath}"`;
            } else {
                runCommand = `cd "${outputPath}" && ${jobId}.exe`;
            }
            
            exec(runCommand, (runError, runStdout, runStderr) => {
                // Clean up input file if it exists
                if (input) {
                    const inputPath = path.join(outputPath, `${jobId}_input.txt`);
                    if (fs.existsSync(inputPath)) {
                        fs.unlinkSync(inputPath);
                    }
                }
                
                if (runError) return reject(runError.message);
                if (runStderr) return reject(runStderr);
                resolve(runStdout);
            });
        });
    });
};

module.exports = execute;


