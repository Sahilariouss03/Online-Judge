const express = require('express');
const app = express();
const generateFile = require('./generateFile');
const execute = require('./Execute');
const path = require('path');
const fs = require('fs');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const outputPath = path.join(__dirname, 'outputs');
if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
}
app.get('/',(req,res)=>{
    res.send("Hello World from Compiler");
});

app.post('/run',async(req,res) =>{
    const { code, input="", language="cpp" } = req.body;
    if(code === undefined){
        return res.status(404).json({error:"Code is required"});
    }
    try{
        const filePath = generateFile(code, language);
        const result = await execute(filePath, outputPath, input);
        res.status(200).json({output: result});
        // Clean up the generated file after execution
        fs.unlinkSync(filePath);
        fs.unlinkSync(path.join(outputPath, `${path.basename(filePath, path.extname(filePath))}.exe`));
    } catch (error) {
        console.error('Error during execution:', error);
        // Provide more helpful error messages
        let errorMessage = error.toString();
        if (errorMessage.includes("'::main' must return 'int'")) {
            errorMessage = "Error: main() function must return 'int', not 'void'. Use 'int main()' instead of 'void main()'.";
        } else if (errorMessage.includes("expected ';'")) {
            errorMessage = "Error: Missing semicolon (;) at the end of a statement.";
        } else if (errorMessage.includes("'cout' was not declared")) {
            errorMessage = "Error: Missing '#include <iostream>' or 'using namespace std;'";
        }
        res.status(500).json({ error: errorMessage });
    }
})

app.listen(5000, () => console.log('Compiler server running on port 5000'));
