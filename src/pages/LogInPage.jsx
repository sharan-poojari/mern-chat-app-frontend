import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const LogInPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuthStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 p-6"
      >
        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="input input-bordered w-full"
          value={formData.email}
          onChange={(e) =>
            setFormData({
              ...formData,
              email: e.target.value,
            })
          }
          required
        />

        <input
          type="password"
          placeholder="Password"
          className="input input-bordered w-full"
          value={formData.password}
          onChange={(e) =>
            setFormData({
              ...formData,
              password: e.target.value,
            })
          }
          required
        />

        <button
          type="submit"
          className="btn btn-primary w-full"
        >
          Login
        </button>

        <p className="text-center text-sm text-base-content/60">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LogInPage;