import { Stethoscope } from "lucide-react";

const HeaderSection = () => {
  return (
    <div className="text-center mb-12">
      <div className="inline-flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg mb-4">
        <Stethoscope className="text-blue-600" size={32} />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          MedLink Registration
        </h1>
      </div>
      <p className="text-gray-600 text-lg">
        Complete medical profile setup for personalized healthcare
      </p>
    </div>
  );
};

export default HeaderSection;
