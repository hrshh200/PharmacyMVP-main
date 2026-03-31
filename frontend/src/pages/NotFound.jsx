import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-6">
      <div className="text-center">
        
        {/* 404 Text */}
        <h1 className="text-7xl md:text-9xl font-extrabold text-blue-500">
          404
        </h1>

        {/* Message */}
        <h2 className="mt-4 text-2xl md:text-3xl font-semibold">
          Page Not Found
        </h2>

        <p className="mt-2 text-gray-400 max-w-md mx-auto">
          The page you are looking for doesn’t exist or has been moved.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition duration-300"
        >
          Go Back Home
        </Link>

      </div>
    </div>
  );
};

export default NotFound;