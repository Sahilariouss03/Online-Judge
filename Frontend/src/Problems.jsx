import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Problems() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newProblem, setNewProblem] = useState({
    problemId: "",
    name: "",
    statement: "",
    difficulty: "easy",
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
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3000/problems", newProblem, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowAdd(false);
      setNewProblem({
        problemId: "",
        name: "",
        statement: "",
        difficulty: "easy",
      });
      fetchProblems();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add problem");
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem?"))
      return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:3000/problems/${problemId}`, {
        headers: { Authorization: `Bearer ${token}` },
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
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 text-base font-semibold transition-all duration-150"
          >
            Add
          </button>
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
                      /* TODO: implement edit */ alert(
                        "Edit not implemented yet"
                      );
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
                <div className="text-gray-700 whitespace-pre-line">
                  {p.statement}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => navigate(`/solve/${p.problemId}`)}
                    className="bg-green-500 text-white px-6 py-2 rounded-full hover:bg-green-600 text-sm font-semibold transition-all duration-150 shadow-md"
                  >
                    Solve Problem
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
