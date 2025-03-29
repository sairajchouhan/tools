import { Link } from "@tanstack/react-router";

export function NavBar() {
  return (
    <nav className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-lg font-semibold">
              DevTools
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link 
                to="/url-parser" 
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium"
                activeProps={{
                  className: "bg-gray-100 text-gray-900 rounded-md px-3 py-2 text-sm font-medium"
                }}
              >
                URL Parser
              </Link>
              <Link 
                to="/json-diff" 
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md px-3 py-2 text-sm font-medium"
                activeProps={{
                  className: "bg-gray-100 text-gray-900 rounded-md px-3 py-2 text-sm font-medium"
                }}
              >
                JSON Diff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 