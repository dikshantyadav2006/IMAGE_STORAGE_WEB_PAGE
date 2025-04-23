import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login } from "../../utils/authApi.js"; // <-- Import from your authApi file

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ identifier: "", password: "" });
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await login(credentials); // ✅ Using authApi
      console.log("Login successful:", res);
      navigate("/dashboard");
    } catch (error) {
      const errMsg = error?.response?.data?.message || "Login failed";
      setMessage(errMsg);
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="dark:bg-[--primary-dark-color] bg-[--primary-light-color] p-6 rounded shadow-md w-96">
        <h2 className="text-xl font-bold text-center mb-4">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            placeholder="Username or Mobile"
            className="w-full p-2 border rounded focus:outline-none text-black focus:ring-2 focus:ring-blue-500"
            value={credentials.identifier}
            onChange={(e) => setCredentials({ ...credentials, identifier: e.target.value })}
            autoComplete="username"
          />

          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-2 pr-10 border text-black rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center px-2 text-gray-500"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {message && <p className="text-red-500">{message}</p>}

          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            disabled={!credentials.identifier || !credentials.password}
          >
            Login
          </button>

          <div className="flex justify-center items-center">
            <Link
              className="w-full signup border p-2 text-center hover:text-white rounded-xl hover:bg-gray-800"
              to="/signup"
            >
              Signup
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
