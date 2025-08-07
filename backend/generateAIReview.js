const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateReview = async(code) => {
    try {
        // Check if API key is available
        if (!process.env.GOOGLE_API_KEY) {
            throw new Error('Google API key is not configured. Please set GOOGLE_API_KEY in your environment variables.');
        }

        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        const prompt = `You are a code review expert. Please review the following C++ code and provide constructive feedback on:
        1. Code quality and readability
        2. Potential bugs or issues
        3. Performance considerations
        4. Best practices
        5. Suggestions for improvement
        
        Code to review:
        ${code}
        
        Please provide a comprehensive review:`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating AI review:', error);
        
        // Provide helpful error messages
        if (error.message.includes('API key')) {
            throw new Error('AI review service is not configured. Please contact the administrator.');
        } else if (error.message.includes('quota') || error.message.includes('limit')) {
            throw new Error('AI review service is temporarily unavailable due to high usage. Please try again later.');
        } else {
            throw new Error('Failed to generate AI review. Please try again later.');
        }
    }
}

module.exports = { generateReview };