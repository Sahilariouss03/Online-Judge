import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import TestCaseResults from "./TestCaseResults";

function SolveProblem() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiReview, setAiReview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Load saved code from localStorage on component mount
  useEffect(() => {
    const savedCode = localStorage.getItem(`code_${problemId}`);
    const savedInput = localStorage.getItem(`input_${problemId}`);
    if (savedCode) {
      setCode(savedCode);
    }
    if (savedInput) {
      setInput(savedInput);
    }
  }, [problemId]);

  // Save code to localStorage whenever it changes
  useEffect(() => {
    if (code.trim()) {
      localStorage.setItem(`code_${problemId}`, code);
      setIsSaved(true);
      // Hide saved indicator after 2 seconds
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      // Remove empty code from localStorage
      localStorage.removeItem(`code_${problemId}`);
    }
  }, [code, problemId]);

  // Save input to localStorage whenever it changes
  useEffect(() => {
    if (input.trim()) {
      localStorage.setItem(`input_${problemId}`, input);
    } else {
      // Remove empty input from localStorage
      localStorage.removeItem(`input_${problemId}`);
    }
  }, [input, problemId]);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${baseUrl}/problems/${problemId}`);
        setProblem(res.data.problem);
      } catch (err) {
        setError("Failed to fetch problem");
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleRun = async () => {
    if (!code.trim()) {
      setError("Please enter some code");
      return;
    }
    if (!user.email) {
      setError("Login to submit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`http://localhost:3000/problems/${problemId}/run`, {
        code,
        input: input.trim()
      }, { withCredentials: true });
      
      setOutput(res.data.output);
    } catch (err) {
      if (err.response?.data?.message?.includes('token')) {
        setError("Login to submit code");
      } else {
        // Show compiler errors in the output window
        setOutput(`Error: ${err.response?.data?.message || "Failed to run code"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleTestCustom = async () => {
    if (!code.trim()) {
      setError("Please enter some code");
      return;
    }
    if (!input.trim()) {
      setError("Please provide custom input");
      return;
    }
    if (!user.email) {
      setError("Login to submit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`http://localhost:3000/problems/${problemId}/run`, {
        code,
        input: input.trim()
      }, { withCredentials: true });
      setOutput(res.data.output);
    } catch (err) {
      if (err.response?.data?.message?.includes('token')) {
        setError("Login to submit code");
      } else {
        // Show compiler errors in the output window
        setOutput(`Error: ${err.response?.data?.message || "Failed to test with custom input"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async () => {
    if (!code.trim()) {
      setError("Please enter some code for AI review");
      return;
    }
    if (!user.email) {
      setError("Login to submit code");
      return;
    }
    setAiLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:3000/ai-review", {
        code: code
      }, { withCredentials: true });
      setAiReview(res.data.review);
    } catch (err) {
      if (err.response?.data?.message?.includes('token')) {
        setError("Login to submit code");
      } else {
        setError(err.response?.data?.message || "Failed to generate AI review");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!code.trim()) {
      setError("Please enter some code");
      return;
    }
    if (!user.email) {
      setError("Login to submit code");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`http://localhost:3000/problems/${problemId}/submit`, {
        code
      }, { withCredentials: true });
      
      // Store test results and show modal
      if (res.data.results) {
        console.log('Received test results:', res.data.results.length, 'test cases');
        console.log('Summary:', res.data.summary);
        setTestResults({
          results: res.data.results,
          summary: res.data.summary
        });
        setShowResults(true);
      } else {
        setOutput(`Submission Result:\n\n${res.data.message}`);
      }
    } catch (err) {
      if (err.response?.data?.message?.includes('token')) {
        setError("Login to submit code");
      } else {
        // Show compiler errors in the output window
        setOutput(`Error: ${err.response?.data?.message || "Failed to submit solution"}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setCode("");
    setInput("");
    setOutput("");
    setAiReview("");
    setError("");
    // Clear saved code and input from localStorage
    localStorage.removeItem(`code_${problemId}`);
    localStorage.removeItem(`input_${problemId}`);
  };

  if (error) return <div className="text-red-600">{error}</div>;
  if (!problem) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans relative">
      {/* Center Logo and Name */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center z-50 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
        <img src="/src/assets/logo.png" alt="AlgoArena Logo" className="w-8 h-8 mr-2" />
        <span className="text-xl font-bold text-blue-600 tracking-wide">AlgoArena</span>
      </div>

      {/* Login Button - Top Right */}
      {!user.email && (
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all duration-150 shadow-md"
          >
            Login
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-6 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-2">{problem.name}</h1>
              <span className={`px-3 py-1 rounded-full font-medium text-xs ${
                problem.difficulty === "easy"
                  ? "bg-green-100 text-green-700"
                  : problem.difficulty === "medium"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}>
                {problem.difficulty}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="text-gray-700 whitespace-pre-line mb-6">
                {problem.statement}
              </div>
            </div>
            <div className="mt-auto pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                className="w-full bg-green-600 text-white py-3 rounded-full hover:bg-green-700 font-semibold text-lg transition-all duration-150"
              >
                Submit Solution
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg flex flex-col">
                         <div className="p-6 border-b border-gray-200">
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center space-x-3">
                   <h2 className="text-xl font-bold text-gray-800">Code Editor</h2>
                   {isSaved && (
                     <div className="flex items-center text-green-600 text-sm">
                       <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                       </svg>
                       Auto-saved
                     </div>
                   )}
                 </div>
                 <div className="flex space-x-2">
                   <button
                     onClick={handleRun}
                     disabled={loading}
                     className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all duration-150 disabled:opacity-50"
                   >
                     {loading ? "Running..." : "Run Code"}
                   </button>
                   <button
                     onClick={clearAll}
                     className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 font-semibold text-sm transition-all duration-150"
                   >
                     Clear All
                   </button>
                 </div>
               </div>
              <div className="text-sm text-gray-600 mb-2">
                Run Code will use custom input if provided, otherwise first test case input
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter your C++ code here..."
                className="w-full h-64 p-4 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
              />
            </div>

            <div className="flex-1 flex flex-col">
                             <div className="p-6 border-b border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">Output</h3>
                 <div className={`rounded-lg p-4 h-32 overflow-y-auto font-mono text-sm ${
                   output && output.startsWith('Error:') ? 'bg-red-50 text-red-700' : 'bg-gray-100'
                 }`}>
                   {output || "Output will appear here..."}
                 </div>
               </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Input</h3>
                <div className="text-sm text-gray-600 mb-2">
                  Provide custom input for testing your code
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter custom input here..."
                  className="w-full h-24 p-3 border rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
                />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Action Buttons</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={handleTestCustom}
                    disabled={loading}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-semibold text-sm transition-all duration-150 disabled:opacity-50"
                  >
                    Test Custom Input
                  </button>
                  <button
                    onClick={handleAIReview}
                    disabled={aiLoading}
                    className="flex-1 bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 font-semibold text-sm transition-all duration-150 disabled:opacity-50"
                  >
                    {aiLoading ? "Generating..." : "AI Code Review"}
                  </button>
                </div>
                {aiReview && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">AI Review:</h4>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {aiReview}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
                 </div>
       </div>
       
       {/* Test Case Results Modal */}
       {testResults && (
         <TestCaseResults
           results={testResults.results}
           summary={testResults.summary}
           isOpen={showResults}
           onClose={() => setShowResults(false)}
         />
       )}
     </div>
   );
 }
 
 export default SolveProblem;
