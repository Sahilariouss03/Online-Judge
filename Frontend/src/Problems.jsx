import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Problems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [newProblem, setNewProblem] = useState({
    problemId: "",
    name: "",
    statement: "",
    difficulty: "easy",
    testCases: [],
  });
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  const fetchProblems = async () => {
    try {
      const res = await axios.get("http://localhost:3000/problems");
      setProblems(res.data.problems || []);
    } catch (err) {
      setError("Failed to fetch problems");
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleAddProblem = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/problems", newProblem, {
        withCredentials: true,
      });
      setShowAdd(false);
      setNewProblem({
        problemId: "",
        name: "",
        statement: "",
        difficulty: "easy",
        testCases: [],
      });
      fetchProblems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add problem");
    }
  };

  const addTestCase = () => {
    setNewProblem({
      ...newProblem,
      testCases: [
        ...newProblem.testCases,
        { input: "", expectedOutput: "", description: "Test case" },
      ],
    });
  };

  const updateTestCase = (index, field, value) => {
    const updatedTestCases = [...newProblem.testCases];
    updatedTestCases[index] = { ...updatedTestCases[index], [field]: value };
    setNewProblem({ ...newProblem, testCases: updatedTestCases });
  };

  const removeTestCase = (index) => {
    const updatedTestCases = newProblem.testCases.filter((_, i) => i !== index);
    setNewProblem({ ...newProblem, testCases: updatedTestCases });
  };

  const handleStartEdit = (problem) => {
    setEditingProblem({
      ...problem,
      testCases: problem.testCases || [],
    });
    setShowEdit(true);
    setSelected(null);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:3000/problems/${editingProblem.problemId}`,
        editingProblem,
        { withCredentials: true }
      );
      setShowEdit(false);
      setEditingProblem(null);
      fetchProblems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update problem");
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      await axios.delete(`http://localhost:3000/problems/${problemId}`, {
        withCredentials: true,
      });
      fetchProblems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete problem");
    }
  };

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-purple-700 drop-shadow">
        Problems
      </h2>
      {isAdmin && (
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="bg-green-500 text-white px-4 py-2 rounded-full shadow text-base font-semibold hover:bg-green-600 transition-all duration-150"
          >
            {showAdd ? "Cancel" : "Add Question"}
          </button>
        </div>
      )}
      {showAdd && isAdmin && (
        <form
          onSubmit={handleAddProblem}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col space-y-3 max-w-lg mx-auto border border-purple-100"
        >
          <input
            type="text"
            placeholder="Problem ID"
            value={newProblem.problemId}
            onChange={(e) =>
              setNewProblem({ ...newProblem, problemId: e.target.value })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          />
          <input
            type="text"
            placeholder="Name"
            value={newProblem.name}
            onChange={(e) =>
              setNewProblem({ ...newProblem, name: e.target.value })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          />
          <textarea
            placeholder="Statement"
            value={newProblem.statement}
            onChange={(e) =>
              setNewProblem({ ...newProblem, statement: e.target.value })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          />
          <select
            value={newProblem.difficulty}
            onChange={(e) =>
              setNewProblem({ ...newProblem, difficulty: e.target.value })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          {/* Test Cases Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Test Cases</h3>
              <button
                type="button"
                onClick={addTestCase}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Add Test Case
              </button>
            </div>
            {newProblem.testCases.map((testCase, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 mb-3 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Test Case {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeTestCase(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  value={testCase.description}
                  onChange={(e) =>
                    updateTestCase(index, "description", e.target.value)
                  }
                  className="w-full mb-2 p-2 border rounded text-sm"
                />
                <textarea
                  placeholder="Input"
                  value={testCase.input}
                  onChange={(e) =>
                    updateTestCase(index, "input", e.target.value)
                  }
                  className="w-full mb-2 p-2 border rounded text-sm"
                  rows="2"
                />
                <textarea
                  placeholder="Expected Output"
                  value={testCase.expectedOutput}
                  onChange={(e) =>
                    updateTestCase(index, "expectedOutput", e.target.value)
                  }
                  className="w-full p-2 border rounded text-sm"
                  rows="2"
                />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-base font-semibold transition-all duration-150"
          >
            Add
          </button>
        </form>
      )}

      {/* Edit Problem Form */}
      {showEdit && isAdmin && editingProblem && (
        <form
          onSubmit={handleEdit}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col space-y-3 max-w-lg mx-auto border border-purple-100"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">Edit Problem</h3>
            <button
              type="button"
              onClick={() => {
                setShowEdit(false);
                setEditingProblem(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <input
            type="text"
            placeholder="Name"
            value={editingProblem.name}
            onChange={(e) =>
              setEditingProblem({ ...editingProblem, name: e.target.value })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          />
          <textarea
            placeholder="Statement"
            value={editingProblem.statement}
            onChange={(e) =>
              setEditingProblem({
                ...editingProblem,
                statement: e.target.value,
              })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
            required
          />
          <select
            value={editingProblem.difficulty}
            onChange={(e) =>
              setEditingProblem({
                ...editingProblem,
                difficulty: e.target.value,
              })
            }
            className="p-3 border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-purple-300"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          {/* Test Cases Section */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">Test Cases</h3>
              <button
                type="button"
                onClick={() => {
                  const updatedTestCases = [
                    ...(editingProblem.testCases || []),
                    { input: "", expectedOutput: "", description: "Test case" },
                  ];
                  setEditingProblem({
                    ...editingProblem,
                    testCases: updatedTestCases,
                  });
                }}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Add Test Case
              </button>
            </div>
            {editingProblem.testCases.map((testCase, index) => (
              <div
                key={index}
                className="border rounded-lg p-3 mb-3 bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-600">
                    Test Case {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedTestCases = editingProblem.testCases.filter(
                        (_, i) => i !== index
                      );
                      setEditingProblem({
                        ...editingProblem,
                        testCases: updatedTestCases,
                      });
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Description"
                  value={testCase.description}
                  onChange={(e) => {
                    const updatedTestCases = [...editingProblem.testCases];
                    updatedTestCases[index] = {
                      ...testCase,
                      description: e.target.value,
                    };
                    setEditingProblem({
                      ...editingProblem,
                      testCases: updatedTestCases,
                    });
                  }}
                  className="w-full mb-2 p-2 border rounded text-sm"
                />
                <textarea
                  placeholder="Input"
                  value={testCase.input}
                  onChange={(e) => {
                    const updatedTestCases = [...editingProblem.testCases];
                    updatedTestCases[index] = {
                      ...testCase,
                      input: e.target.value,
                    };
                    setEditingProblem({
                      ...editingProblem,
                      testCases: updatedTestCases,
                    });
                  }}
                  className="w-full mb-2 p-2 border rounded text-sm"
                  rows="2"
                />
                <textarea
                  placeholder="Expected Output"
                  value={testCase.expectedOutput}
                  onChange={(e) => {
                    const updatedTestCases = [...editingProblem.testCases];
                    updatedTestCases[index] = {
                      ...testCase,
                      expectedOutput: e.target.value,
                    };
                    setEditingProblem({
                      ...editingProblem,
                      testCases: updatedTestCases,
                    });
                  }}
                  className="w-full p-2 border rounded text-sm"
                  rows="2"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setShowEdit(false);
                setEditingProblem(null);
              }}
              className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 font-semibold transition-all duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-500 text-white px-4 py-2 rounded-full hover:bg-yellow-600 font-semibold transition-all duration-150"
            >
              Save Changes
            </button>
          </div>
        </form>
      )}
      <ul className="space-y-6">
        {problems.map((p) => (
          <li
            key={p.problemId}
            className="bg-white rounded-2xl shadow-md p-6 flex flex-col transition-transform duration-150 hover:scale-[1.02] border border-purple-100"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() =>
                setSelected(selected === p.problemId ? null : p.problemId)
              }
            >
              <span className="font-semibold text-purple-700">
                ID: {p.problemId}
              </span>
              <span className="ml-4 font-bold text-lg text-gray-800">
                {p.name}
              </span>
              <span
                className={`ml-4 px-3 py-1 rounded-full font-medium text-xs ${
                  p.difficulty === "easy"
                    ? "bg-green-100 text-green-700"
                    : p.difficulty === "medium"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {p.difficulty}
              </span>
              {isAdmin && (
                <span className="ml-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(p);
                    }}
                    className="bg-yellow-400 text-white px-3 py-1 rounded-full hover:bg-yellow-500 text-xs font-semibold transition-all duration-150"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(p.problemId);
                    }}
                    className="bg-red-600 text-white px-3 py-1 rounded-full hover:bg-red-700 text-xs font-semibold transition-all duration-150"
                  >
                    Delete
                  </button>
                </span>
              )}
            </div>
            {selected === p.problemId && (
              <div className="mt-4 border-t pt-4 border-purple-100">
                <div className="font-bold text-lg mb-2 text-gray-800">
                  {p.name}
                </div>
                <div className="text-gray-700 whitespace-pre-line mb-4">
                  {p.statement}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    {p.testCases && p.testCases.length > 0
                      ? `${p.testCases.length} test case(s)`
                      : "No test cases"}
                  </div>
                  <button
                    onClick={() => navigate(`/solve/${p.problemId}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-sm font-semibold transition-all duration-150"
                  >
                    Solve
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Problems;
