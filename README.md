# Online Judge System

A full-stack online judge system for competitive programming with problem management, code compilation, and execution.

## Features

- **User Authentication**: Register, login, and profile management
- **Admin Panel**: Create, edit, and delete problems (admin only)
- **Problem Management**: View problems with difficulty levels
- **Code Editor**: Integrated code editor with syntax highlighting
- **Code Execution**: Real-time code compilation and execution
- **Responsive Design**: Modern UI with Tailwind CSS

## System Architecture

The system consists of three main components:

1. **Frontend** (React + Vite): User interface and code editor
2. **Backend** (Node.js + Express): API server and user management
3. **Compiler Service** (Node.js): Code compilation and execution

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or cloud instance)
- C++ compiler (g++) for code execution

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd online-judge-project
```

### 2. Set up environment variables
Create a `.env` file in the `backend` directory:
```env
MONGO_URI=mongodb://localhost:27017/online-judge
JWT_SECRET=your-secret-key-here
PORT=3000
```

### 3. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install compiler dependencies
cd ../Compiler
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

## Running the Application

### Option 1: Using the batch script (Windows)
```bash
start-services.bat
```

### Option 2: Manual startup

1. **Start the Backend Server**:
```bash
cd backend
npm start
```

2. **Start the Compiler Service**:
```bash
cd Compiler
npm start
```

3. **Start the Frontend**:
```bash
cd Frontend
npm run dev
```

## Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Compiler Service**: http://localhost:5000

## Usage

### For Users

1. **Register/Login**: Create an account or login with existing credentials
2. **Browse Problems**: View available problems with difficulty levels
3. **Solve Problems**: 
   - Click on a problem to open the solve page
   - Read the problem statement on the left
   - Write your C++ code in the editor on the right
   - Use "Run Code" to test your solution
   - Use "Submit Solution" to submit your final answer

### For Admins

1. **Login as Admin**: Use admin credentials to access admin features
2. **Create Problems**: Add new problems with statements and difficulty levels
3. **Manage Problems**: Edit or delete existing problems

## API Endpoints

### Authentication
- `POST /register` - User registration
- `POST /login` - User login
- `POST /register/admin` - Admin registration
- `POST /login/admin` - Admin login

### Problems
- `GET /problems` - Get all problems
- `GET /problems/:problemId` - Get specific problem
- `POST /problems` - Create problem (admin only)
- `PUT /problems/:problemId` - Update problem (admin only)
- `DELETE /problems/:problemId` - Delete problem (admin only)
- `POST /problems/:problemId/run` - Run code
- `POST /problems/:problemId/submit` - Submit solution

### User Management
- `PUT /users/profile` - Update user profile
- `DELETE /users/profile` - Delete user profile

## Code Execution

The system supports C++ code execution:

- Code is compiled using g++ compiler
- Standard input/output is supported
- Execution time and memory limits can be configured
- Error handling for compilation and runtime errors

## Project Structure

```
online-judge-project/
├── Frontend/                 # React frontend
│   ├── src/
│   │   ├── App.jsx          # Main app component
│   │   ├── Login.jsx        # Login page
│   │   ├── Register.jsx     # Registration page
│   │   ├── Problems.jsx     # Problems list
│   │   └── SolveProblem.jsx # Problem solving page
│   └── package.json
├── backend/                  # Node.js backend
│   ├── routes/              # API routes
│   ├── models/              # Database models
│   ├── middlewares/         # Authentication middleware
│   ├── database/            # Database connection
│   └── index.js             # Main server file
├── Compiler/                # Code compilation service
│   ├── compiler.js          # Main compiler server
│   ├── generateFile.js      # File generation utility
│   ├── Execute.js           # Code execution utility
│   └── package.json
└── README.md
```

## Technologies Used

- **Frontend**: React, Vite, Tailwind CSS, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Code Execution**: Child process, file system operations
- **Development**: Nodemon, ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License. 