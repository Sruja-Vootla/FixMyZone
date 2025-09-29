import { useAuth } from "../../context/AuthContext";

export default function Logout() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="bg-red-600 px-6 py-2 rounded-full text-white font-semibold"
    >
      Logout
    </button>
  );
}
