import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Problems() {
  const [problems, setProblems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get('http://localhost:3000/problems');
        setProblems(res.data.problems || []);
      } catch (err) {
        setError('Failed to fetch problems');
      }
    };
    fetchProblems();
  }, []);

  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="p-8 min-h-screen bg-gradient-to-r from-blue-100 to-purple-100">
      <h2 className="text-2xl font-bold mb-6">Problems</h2>
      <ul className="space-y-4">
        {problems.map((p) => (
          <li key={p.problemId} className="bg-white rounded shadow p-4 flex flex-col">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setSelected(selected === p.problemId ? null : p.problemId)}>
              <span className="font-semibold">ID: {p.problemId}</span>
              <span className="ml-4 font-bold">{p.name}</span>
              <span className="ml-4 px-3 py-1 rounded bg-blue-200 text-blue-800 font-medium">{p.difficulty}</span>
            </div>
            {selected === p.problemId && (
              <div className="mt-4">
                <div className="font-bold text-lg mb-2">{p.name}</div>
                <div>{p.statement}</div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Problems; 