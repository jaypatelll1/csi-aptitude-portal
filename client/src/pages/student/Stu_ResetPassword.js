import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const Stu_ResetPassword = () => {
  const navigate = useNavigate();
  const { resettoken } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);

  const encryptPassword = async (password) => {
    const SECRET_KEY = process.env.REACT_APP_KEY.slice(0, 32); // 32 bytes
    const IV = process.env.REACT_APP_IV.slice(0, 16); // 16 bytes

    const encoder = new TextEncoder();
    const encodedPassword = encoder.encode(password);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(SECRET_KEY),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    const encryptedData = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: new TextEncoder().encode(IV) },
      cryptoKey,
      encodedPassword
    );

    return btoa(String.fromCharCode(...new Uint8Array(encryptedData))); // Convert to Base64
  };

  useEffect(() => {
    const verifyToken = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        await axios.get(`${API_BASE_URL}/api/users/verify-reset-token`, {
          headers: {
            resettoken: resettoken,
            "Content-Type": "application/json",
          },
        });
        setTokenValid(true);
      } catch (err) {
        setError("Invalid or expired reset token.");
      }
    };

    verifyToken();
  }, [resettoken]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const encryptedPassword = await encryptPassword(newPassword);
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.post(`${API_BASE_URL}/api/users/reset-password`, {
        resettoken: resettoken,
        password: encryptedPassword,
      });
      navigate("/"); // Redirect to login after successful password reset
    } catch (err) {
      setError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return <div>{error || "Verifying token..."}</div>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-screen max-w-xl p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-center text-gray-800 font-poppins">
          Reset Password
        </h2>
        <p className="text-sm text-center text-custom_grey mb-6">
          Please enter your new password and confirm password
        </p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleResetPassword}>
          <div className="mb-1">
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              id="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white bg-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 ${
              loading ? "bg-gray-500 cursor-not-allowed" : "bg-custom_blue"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Stu_ResetPassword;
