import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to My Website</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Get Started
          </h2>
          <p className="text-gray-600 mb-8">
            This is a simple homepage built with Next.js and Tailwind CSS.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-600">
            © 2024 My Website. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
