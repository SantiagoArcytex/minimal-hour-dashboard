// Custom 404 page
import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Page not found</p>
        <p className="text-gray-500 mb-4">
          The client page you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/admin"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go to Admin Dashboard
        </Link>
      </div>
    </div>
  );
}

