const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const execute = async (filePath, outputPath, input = '') => {
    const jobId = path.basename(filePath).split('.')[0];
    const outPath = path.join(outputPath, jobId); // no .exe
    
    return new Promise((resolve, reject) => {
        // Compile the code first
        const compileCommand = `g++ "${filePath}" -o "${outPath}"`;

        exec(compileCommand, { timeout: 10000 }, (compileError, compileStdout, compileStderr) => {
            if (compileError) {
                console.error('Compilation error:', compileError.message);
                return reject(compileError.message);
            }
            if (compileStderr) {
                console.error('Compilation stderr:', compileStderr);
                return reject(compileStderr);
            }

            // Now run the compiled binary with input
            let runCommand;
            const inputPath = path.join(outputPath, `${jobId}_input.txt`);

            if (input) {
                fs.writeFileSync(inputPath, input, 'utf8');
                runCommand = `cd "${outputPath}" && chmod +x "${jobId}" && ./${jobId} < "${inputPath}"`;
            } else {
                runCommand = `cd "${outputPath}" && chmod +x "${jobId}" && ./${jobId}`;
            }

            exec(runCommand, { timeout: 5000 }, (runError, runStdout, runStderr) => {
                // Clean up input file if it exists
                if (input && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }

                if (runError) {
                    console.error('Runtime error:', runError.message);
                    return reject(runError.message);
                }
                if (runStderr) {
                    console.error('Runtime stderr:', runStderr);
                    return reject(runStderr);
                }
                resolve(runStdout);
            });
        });
    });
};

module.exports = execute;