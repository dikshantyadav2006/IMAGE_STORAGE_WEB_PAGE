import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar/Navbar.jsx';
import Home from './pages/Home';
import Upload from './pages/Upload';
import Profile from './pages/Profile';
import PostDetail from './pages/PostDetail';
import Login from './pages/Login';
import Signup from './pages/Signup';
import EditProfile from './pages/EditProfile';
import EditPost from './pages/EditPost';
import { AuthProvider } from './context/authContext/AuthContext';
import { PostProvider } from './context/postContext/PostContext';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <PostProvider>
          <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/profile/:username" element={<Profile />} />
                <Route path="/post/:id" element={<PostDetail />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/edit-post/:id" element={<EditPost />} />
              </Routes>
            </main>
          </div>
        </PostProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;