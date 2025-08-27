const FooterSection = () => {
  return (
    <div className="mt-12 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
        <p className="text-gray-600 mb-4">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-all duration-300"
          >
            Sign In Here
          </a>
        </p>
        <div className="flex justify-center items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            256-bit Encryption
          </span>
          <span className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            Secure Storage
          </span>
        </div>
      </div>
    </div>
  );
};

export default FooterSection;
