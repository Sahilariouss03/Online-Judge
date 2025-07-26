import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import Problems from "./Problems.jsx";
import SolveProblem from "./SolveProblem.jsx";

function Home() {
  return (
    <div className="fixed top-0 left-0 w-full h-full m-0 p-0 font-sans text-white bg-gradient-to-br from-blue-400 via-purple-300 to-pink-200">
      <div className="flex flex-col items-center justify-center h-full space-y-6">
        <h1 className="text-5xl font-extrabold mb-8 drop-shadow-lg">
          Welcome to the Online Judge App
        </h1>
        <div className="space-x-4">
          <Link
            to="/login"
            className="px-6 py-2 bg-white text-blue-600 rounded-full shadow font-semibold hover:bg-blue-100 transition-all duration-150"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-6 py-2 bg-white text-purple-600 rounded-full shadow font-semibold hover:bg-purple-100 transition-all duration-150"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProfileDropdown({ setIsLoggedIn }) {
  const [open, setOpen] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [LastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [originalUser, setOriginalUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setFirstName(user.firstName || "");
      setLastName(user.LastName || "");
      setEmail(user.email || "");
      setPassword("");
      setOriginalUser(user);
    }
  }, [showEdit]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      // Only send changed fields
      const updateData = {};
      if (firstName && firstName !== originalUser.firstName)
        updateData.firstName = firstName;
      if (LastName && LastName !== originalUser.LastName)
        updateData.LastName = LastName;
      if (email && email !== originalUser.email) updateData.email = email;
      if (password) updateData.password = password;
      const res = await fetch("http://localhost:3000/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");
      setSuccess("Profile updated!");
      localStorage.setItem("user", JSON.stringify(data.user));
      setTimeout(() => setShowEdit(false), 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/users/profile", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete profile");
      setSuccess("Profile deleted!");
      setTimeout(() => {
        handleLogout();
      }, 1000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg"
      >
        <span role="img" aria-label="profile">
          👤
        </span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg py-2">
          <button
            onClick={() => {
              setShowEdit(true);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-blue-100"
          >
            Edit Profile
          </button>
          <button
            onClick={() => {
              setShowDelete(true);
              setOpen(false);
            }}
            className="block w-full text-left px-4 py-2 hover:bg-blue-100"
          >
            Delete Profile
          </button>
          <Link
            to="/profile"
            className="block w-full text-left px-4 py-2 hover:bg-blue-100"
          >
            Profile Page
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 hover:bg-blue-100"
          >
            Logout
          </button>
        </div>
      )}
      {/* Edit Profile Modal */}
      {showEdit && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <form
            onSubmit={handleEdit}
            className="bg-white p-8 rounded shadow-md w-96 relative"
          >
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}
            <input
              type="text"
              placeholder={originalUser.firstName || "First Name"}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="text"
              placeholder={originalUser.LastName || "Last Name"}
              value={LastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="email"
              placeholder={originalUser.email || "Email"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-2 p-2 border rounded"
            />
            <input
              type="password"
              placeholder="New Password (leave blank to keep)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 border rounded"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}
      {/* Delete Profile Modal with confirmation */}
      {showDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-8 rounded shadow-md w-80 relative">
            <button
              type="button"
              onClick={() => setShowDelete(false)}
              className="absolute top-2 right-2 text-gray-500"
            >
              ✖
            </button>
            <h2 className="text-xl font-bold mb-4">Delete Profile</h2>
            {error && <div className="mb-2 text-red-600">{error}</div>}
            {success && <div className="mb-2 text-green-600">{success}</div>}
            <p className="mb-4">
              Are you sure you want to delete your profile? This action cannot
              be undone.
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleDelete}
                className="w-1/2 bg-red-600 text-white py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDelete(false)}
                className="w-1/2 bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 font-sans">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md mt-20 flex flex-col items-center relative">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-5xl shadow-lg border-4 border-white">
            👤
          </div>
        </div>
        <div className="h-12" />
        <h2 className="text-3xl font-bold mb-2 text-center">
          {user.firstName} {user.LastName}
        </h2>
        <span
          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
            isAdmin ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
          }`}
        >
          {isAdmin ? "Admin" : "User"}
        </span>
        <div className="mb-2 text-gray-700">
          <span className="font-semibold">Email:</span> {user.email}
        </div>
        <div className="flex justify-center mt-6">
          <ProfileDropdownButton />
        </div>
      </div>
    </div>
  );
}

// Extract the dropdown button for reuse
function ProfileDropdownButton() {
  // This is a wrapper to use the same dropdown as in the top bar, but without the name
  const [dummy, setDummy] = useState(false); // just to force re-render on logout
  return <ProfileDropdown setIsLoggedIn={() => setDummy((d) => !d)} />;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (
    <Router>
      <AppContent isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
    </Router>
  );
}

function AppContent({ isLoggedIn, setIsLoggedIn }) {
  const location = useLocation();
  const showDropdown =
    isLoggedIn && !["/", "/login", "/register"].includes(location.pathname);
  return (
    <>
      {/* Fixed header for profile bar */}
      {showDropdown && (
        <header className="fixed top-0 left-0 w-full h-16 bg-white shadow z-50 flex items-center justify-end pr-8">
          <ProfileBar setIsLoggedIn={setIsLoggedIn} />
        </header>
      )}
      {/* Main content with top margin to avoid overlap */}
      <div className={showDropdown ? "pt-20" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/solve/:problemId" element={<SolveProblem />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  );
}

// New wrapper for profile bar (name + dropdown)
function ProfileBar({ setIsLoggedIn }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (
    <div className="absolute top-4 right-8 z-50 flex items-center space-x-3">
      <span className="font-semibold text-lg text-gray-800">
        {user.firstName} {user.LastName}
      </span>
      <ProfileDropdown setIsLoggedIn={setIsLoggedIn} key={user.email || ""} />
    </div>
  );
}

export default App;
