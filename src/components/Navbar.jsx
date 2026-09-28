import { Link } from "react-router-dom";
import { LogOut, MessageSquare, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header className="border-b border-base-300 fixed w-full top-0 z-40 bg-base-100/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h1 className="text-lg font-bold">Chatty</h1>
        </div>

        {/* Actions */}
        {authUser && (
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="flex items-center gap-2 btn btn-sm"
            >
              <User className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>

            <button
              onClick={logout}
              className="flex items-center gap-2 btn btn-sm"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;