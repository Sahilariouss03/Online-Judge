import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function SolveProblem() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [running, setRunning] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [aiReview, setAiReview] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/problems/${problemId}`
        );
        setProblem(res.data.problem);
      } catch (err) {
        setError("Failed to fetch problem details");
      }
    };
    fetchProblem();
  }, [problemId]);

  const handleRun = async () => {
    setRunning(true);
    setError("");
    setOutput("");
    setSubmissionResult(null);
    setShowResults(false);
    setShowPopup(false);

    try {
      const res = await axios.post(
        `http://localhost:3000/problems/${problemId}/run`,
        { code, input: customInput },
        { withCredentials: true }
      );
      
      let outputMessage = res.data.output || "Code executed successfully!";
      if (res.data.inputSource === 'first_test_case') {
        outputMessage = `Using first test case input: ${res.data.input || '(empty)'}\n\nOutput:\n${outputMessage}`;
      } else if (res.data.inputSource === 'custom') {
        outputMessage = `Using custom input: ${res.data.input || '(empty)'}\n\nOutput:\n${outputMessage}`;
      } else {
        outputMessage = `No input provided\n\nOutput:\n${outputMessage}`;
      }
      
      setOutput(outputMessage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to run code");
    } finally {
      setRunning(false);
    }
  };

  const handleTestCustom = async () => {
    setRunning(true);
    setError("");
    setOutput("");
    setSubmissionResult(null);
    setShowResults(false);
    setShowPopup(false);

    try {
      const res = await axios.post(
        `http://localhost:3000/problems/${problemId}/test-custom`,
        { code, input: customInput },
        { withCredentials: true }
      );
      setOutput(`Custom Input: ${res.data.input || '(empty)'}\n\nOutput:\n${res.data.output || "Code executed successfully!"}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to test with custom input");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    setOutput("");
    setSubmissionResult(null);
    setShowResults(false);
    setShowPopup(false);

    try {
      const res = await axios.post(
        `http://localhost:3000/problems/${problemId}/submit`,
        { code, input: customInput },
        { withCredentials: true }
      );
      
      if (res.data.customInput) {
        setOutput(`Custom Input: ${res.data.input || '(empty)'}\n\nOutput:\n${res.data.output || "Code executed successfully!"}`);
      } else {
        setSubmissionResult(res.data);
        setShowResults(true);
        setShowPopup(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit solution");
    } finally {
      setLoading(false);
    }
  };

  const handleAIReview = async () => {
    if (!code.trim()) {
      setError("Please write some code before requesting AI review");
      return;
    }

    setAiLoading(true);
    setError("");
    setAiReview("");

    try {
      const res = await axios.post(
        "http://localhost:3000/ai-review",
        { code },
        { withCredentials: true }
      );
      setAiReview(res.data.review);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get AI review");
    } finally {
      setAiLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'text-green-600 bg-green-100';
      case 'wrong_answer':
        return 'text-red-600 bg-red-100';
      case 'partial':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'accepted':
        return 'PASSED';
      case 'wrong_answer':
        return 'FAILED';
      case 'partial':
        return 'PARTIAL';
      default:
        return 'UNKNOWN';
    }
  };

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!problem) return <div className="p-4">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="max-w-7xl mx-auto h-screen flex flex-col">
        <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">AlgoArena</h1>
              <button
                onClick={() => navigate("/problems")}
                className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 font-semibold transition-all duration-150"
              >
                ← Back to Problems
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-4">
          <div className="w-1/2 bg-white rounded-2xl shadow-lg p-6 overflow-y-auto">
            <div className="mb-6 pb-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-2xl font-bold text-gray-800">
                  {problem.name}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full font-medium text-sm ${
                    problem.difficulty === "easy"
                      ? "bg-green-100 text-green-700"
                      : problem.difficulty === "medium"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {problem.difficulty.toUpperCase()}
                </span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Problem Statement
            </h2>
            <div className="text-gray-700 whitespace-pre-line leading-relaxed">
              {problem.statement}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-150 ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {loading ? "Submitting..." : "Submit Solution"}
              </button>
            </div>
          </div>

          <div className="w-1/2 bg-white rounded-2xl shadow-lg flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-800">
                  Code Editor
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleRun}
                    disabled={running}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all duration-150 ${
                      running
                        ? "bg-yellow-400 cursor-not-allowed"
                        : "bg-yellow-500 hover:bg-yellow-600 text-white"
                    }`}
                  >
                    {running ? "Running..." : "Run Code"}
                  </button>
                  <button
                    onClick={() => {
                      setCode("");
                      setCustomInput("");
                      setOutput("");
                      setError("");
                      setAiReview("");
                      setSubmissionResult(null);
                      setShowResults(false);
                      setShowPopup(false);
                    }}
                    className="px-4 py-2 rounded-lg font-semibold transition-all duration-150 bg-gray-500 hover:bg-gray-600 text-white"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-600">
                Write your C++ code below. Use standard input/output.
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Happy Coding!
              </div>
            </div>

            <div className="flex-1 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="write your code here..."
                className="w-full h-full p-4 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                style={{ minHeight: '300px' }}
              />
            </div>

            {(output || error) && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Output:
                </h3>
                <div
                  className={`p-3 rounded-lg font-mono text-sm whitespace-pre-wrap ${
                    error
                      ? "bg-red-50 text-red-700"
                      : "bg-green-50 text-green-700"
                  }`}
                >
                  {error || output}
                </div>
              </div>
            )}

            {aiReview && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                  <span className="mr-2">🤖</span>
                  AI Code Review:
                </h3>
                <div className="p-3 rounded-lg font-mono text-sm whitespace-pre-wrap bg-purple-50 text-purple-800 border border-purple-200">
                  {aiReview}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Custom Input:
              </h3>
              <div className="text-xs text-gray-600 mb-2">
                Enter custom input for your program.
              </div>
              <textarea
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="test custom inputs for your program..."
                className="w-full h-full p-3 border rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
                style={{ minHeight: '100px' }}
              />
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleTestCustom}
                  disabled={running}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-150 ${
                    running
                      ? "bg-blue-400 cursor-not-allowed text-white"
                      : "bg-green-600 hover:bg-green-700 text-white"
                  }`}
                >
                  {running ? "Testing..." : "Test Custom Input"}
                </button>
                <button
                  onClick={handleAIReview}
                  disabled={aiLoading}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all duration-150 ${
                    aiLoading
                      ? "bg-purple-400 cursor-not-allowed text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }`}
                >
                  {aiLoading ? "Analyzing..." : "AI Code Review"}
                </button>
              </div>
            </div>

            {showResults && submissionResult && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Submission Results</h3>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    submissionResult.status === 'accepted' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {submissionResult.status === 'accepted' ? 'ACCEPTED' : 'WRONG ANSWER'}
                  </div>
                </div>
                
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {submissionResult.message}
                    </span>
                    <span className="text-sm font-medium">
                      {submissionResult.summary.passed}/{submissionResult.summary.total} tests passed ({submissionResult.summary.percentage}%)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {submissionResult.results.map((result, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${
                      result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          Test Case {result.testCaseIndex}: {result.description}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          result.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {result.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="font-medium text-gray-600">Input:</span>
                          <div className="mt-1 p-2 bg-white rounded font-mono">
                            {result.input || '(empty)'}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Expected Output:</span>
                          <div className="mt-1 p-2 bg-white rounded font-mono">
                            {result.expectedOutput}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Your Output:</span>
                          <div className="mt-1 p-2 bg-white rounded font-mono">
                            {result.userOutput}
                          </div>
                        </div>
                      </div>
                      
                      {result.error && (
                        <div className="mt-2 p-2 bg-red-100 text-red-700 rounded text-xs">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPopup && submissionResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Submission Results</h2>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`px-4 py-2 rounded-full font-bold text-lg ${getStatusColor(submissionResult.status)}`}>
                    {getStatusText(submissionResult.status)}
                  </span>
                  <span className="text-gray-600">
                    {submissionResult.summary.passed}/{submissionResult.summary.total} tests passed
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-800">
                    {submissionResult.summary.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Case Details</h3>
              <div className="space-y-4">
                {submissionResult.results.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg border-2 ${
                    result.passed 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-800">
                          Test Case {result.testCaseIndex}
                        </span>
                        <span className="text-sm text-gray-600">
                          {result.description}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-bold text-sm ${
                        result.passed 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {result.passed ? 'PASSED' : 'FAILED'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Input:</span>
                        <div className="p-3 bg-white rounded border font-mono text-sm">
                          {result.input || '(empty)'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Expected Output:</span>
                        <div className="p-3 bg-white rounded border font-mono text-sm">
                          {result.expectedOutput}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 block mb-2">Your Output:</span>
                        <div className={`p-3 rounded border font-mono text-sm ${
                          result.passed ? 'bg-green-50' : 'bg-red-50'
                        }`}>
                          {result.userOutput}
                        </div>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="mt-3 p-3 bg-red-100 text-red-700 rounded text-sm">
                        <span className="font-medium">Error:</span> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <button
                  onClick={() => setShowPopup(false)}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <div className="text-sm text-gray-600">
                  {submissionResult.message}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SolveProblem;
