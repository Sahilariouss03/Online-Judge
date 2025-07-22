import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Login from './Login.jsx'
import Register from './Register.jsx'
import Problems from './Problems.jsx'

function Home() {
  return (
    <div className="fixed top-0 left-0 w-full h-full m-0 p-0 text-white bg-gradient-to-r from-blue-500 to-purple-500">
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h1 className="text-4xl font-bold mb-8">Welcome to the Compiler App</h1>
        <div className="space-x-4">
          <Link to="/login" className="px-6 py-2 bg-white text-blue-600 rounded shadow font-semibold hover:bg-blue-100">Login</Link>
          <Link to="/register" className="px-6 py-2 bg-white text-purple-600 rounded shadow font-semibold hover:bg-purple-100">Register</Link>
        </div>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/problems" element={<Problems />} />
      </Routes>
    </Router>
  )
}

export default App