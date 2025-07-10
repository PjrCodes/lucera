import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import Image from "next/image";

export default function UniversityHome() {
  return (
    <>
    <SetHeaderClientComponent title="SAMPLE UNIVERSITY" />
    <main className="max-w-4xl mx-auto py-8 px-2 sm:py-12 sm:px-4 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary-800 mb-4 text-center">
        Sample University
      </h1>
      <p className="text-base sm:text-lg text-primary-700 mb-6 text-center max-w-2xl">
        Welcome to Sample University, a place where innovation meets tradition. Our
        vibrant campus is home to a diverse community of learners and educators,
        dedicated to academic excellence and personal growth.
      </p>
      <div className="flex flex-col md:flex-row gap-4 sm:gap-8 mb-6 w-full justify-center items-center">
        <div className="w-full md:w-auto flex-1 flex justify-center">
          <Image
            src="/images/university-campus.jpg"
            alt="University Campus"
            width={400}
            height={250}
            className="rounded-lg shadow-md object-cover w-full max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>
        <div className="w-full md:w-auto flex-1 flex justify-center">
          <Image
            src="/images/university-students.jpg"
            alt="University Students"
            width={400}
            height={250}
            className="rounded-lg shadow-md object-cover w-full max-w-xs sm:max-w-sm md:max-w-md"
          />
        </div>
      </div>
      <p className="text-sm sm:text-md text-primary-700 text-center max-w-2xl">
        At Sample University, we offer a wide range of programs, world-class
        faculty, and state-of-the-art facilities to empower our students for
        success in a rapidly changing world. Join us and become part of a legacy
        of achievement and discovery.
      </p>
    </main>
    </>
  );
}
