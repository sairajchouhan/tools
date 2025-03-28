import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div className="container mx-auto py-12 max-w-3xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Daily Dev Tools</h1>
        <p className="text-gray-600 mb-8">Simple utilities to make your development workflow easier</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="/url-parser"
            className="flex flex-col items-center p-6 bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4 p-4 bg-blue-100 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">URL Parser</h2>
            <p className="text-gray-600 text-sm text-center">Parse and visualize URL path segments and query parameters</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
