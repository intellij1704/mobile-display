export default function UnderConstruction() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 px-6">
      {/* Card Container */}
      <div className="bg-white shadow-xl rounded-2xl p-10 max-w-lg text-center">
        {/* Icon */}
        <div className="mb-6">
          <span className="text-6xl animate-bounce">🚧</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">
          Page Under Construction
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 text-lg mb-6">
          We’re working hard to bring you something amazing.  
          Please check back again soon!
        </p>

        {/* Progress / Decorative */}
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse"></div>
        </div>

        {/* Footer Note */}
        <p className="text-sm text-gray-500 mt-6">
          Thank you for your patience 🙏
        </p>
      </div>
    </div>
  );
}
