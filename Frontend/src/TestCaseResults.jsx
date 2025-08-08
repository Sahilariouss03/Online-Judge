import React from 'react';

function TestCaseResults({ results, isOpen, onClose, summary }) {
  console.log('TestCaseResults render:', { resultsLength: results?.length, summary, isOpen });
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Test Case Results</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          
          {/* Summary */}
          <div className="mt-4 p-4 rounded-lg bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`text-2xl font-bold ${
                  summary.percentage === 100 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {summary.percentage}%
                </div>
                <div>
                  <div className="text-sm text-gray-600">Test Cases Passed</div>
                  <div className="font-semibold">
                    {summary.passed} / {summary.total}
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-semibold text-sm ${
                summary.percentage === 100 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {summary.percentage === 100 ? 'ACCEPTED' : 'WRONG ANSWER'}
              </div>
            </div>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="text-sm text-gray-600 mb-4">
            Showing {results.length} test case{results.length !== 1 ? 's' : ''}
          </div>
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`border rounded-lg p-4 ${
                  result.passed 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">
                    Test Case {result.testCaseIndex}
                  </h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    result.passed 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {result.passed ? 'PASSED' : 'FAILED'}
                  </div>
                </div>

                {result.description && (
                  <div className="text-sm text-gray-600 mb-3">
                    {result.description}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Input:</div>
                    <div className="bg-white p-3 rounded border font-mono text-xs overflow-x-auto">
                      {result.input || '(empty)'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-semibold text-gray-700 mb-1">Expected Output:</div>
                    <div className="bg-white p-3 rounded border font-mono text-xs overflow-x-auto">
                      {result.expectedOutput || '(empty)'}
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="font-semibold text-gray-700 mb-1">Your Output:</div>
                  <div className={`p-3 rounded border font-mono text-xs overflow-x-auto ${
                    result.passed ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {result.userOutput || '(empty)'}
                  </div>
                </div>

                {result.error && (
                  <div className="mt-3">
                    <div className="font-semibold text-red-700 mb-1">Error:</div>
                    <div className="bg-red-100 p-3 rounded border font-mono text-xs text-red-700">
                      {result.error}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-all duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TestCaseResults;
