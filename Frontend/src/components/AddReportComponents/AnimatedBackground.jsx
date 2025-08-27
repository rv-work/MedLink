const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-20 left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-3xl animate-bounce"></div>
      <div className="absolute bottom-32 right-32 w-56 h-56 bg-purple-400/10 rounded-full blur-2xl animate-pulse"></div>
      <div
        className="absolute top-1/2 left-1/4 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl animate-bounce"
        style={{ animationDelay: "2s" }}
      ></div>
      <div
        className="absolute top-1/4 right-1/4 w-24 h-24 bg-pink-400/10 rounded-full blur-2xl animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>
    </div>
  );
};

export default AnimatedBackground;
