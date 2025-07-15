import SetHeaderClientComponent from "@/components/feature/header/set-header-client-component";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Globe, MapPin, Phone, GraduationCap, Users, BookOpen, Award, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

// Simple Badge component inline
function Badge({
  children,
  className,
  variant = "default"
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline"
}) {
  const variants = {
    default: "border-transparent bg-primary-600 text-white hover:bg-primary-700",
    secondary: "border-transparent bg-secondary-200 text-secondary-800 hover:bg-secondary-300",
    destructive: "border-transparent bg-red-600 text-white hover:bg-red-700",
    outline: "text-primary-700 border-primary-300",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

export default function UniversityProfile() {
  return (
    <>
      <SetHeaderClientComponent title="SAMPLE UNIVERSITY" />
      <main className="max-w-6xl mx-auto py-8 px-4 space-y-8">

        {/* Header Section with University Identity */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-xl p-8 border border-primary-200">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* University Logo */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-primary-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">SU</span>
              </div>
            </div>

            {/* University Info */}
            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-primary-900 mb-2">
                  Sample University
                </h1>
                <p className="text-primary-700 text-lg mb-3">
                  Innovation Through Knowledge, Excellence Through Learning
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                    🏛️ Established 1965
                  </Badge>
                  <Badge variant="outline" className="border-green-300 text-green-700">
                    ✅ Accredited
                  </Badge>
                </div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-col sm:flex-row gap-6 text-sm text-primary-600">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>Boston, Massachusetts, USA</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={16} />
                  <a href="https://sampleuniversity.edu" className="hover:text-primary-800 underline">
                    sampleuniversity.edu
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} />
                  <span>(617) 555-0123</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campus Banner */}
        <div className="relative h-64 rounded-xl overflow-hidden">
          <Image
            src="/placeholder.jpg"
            alt="University Campus"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-xl font-semibold mb-1">Beautiful Campus in the Heart of Boston</h2>
            <p className="text-sm opacity-90">Inspiring spaces for learning and discovery</p>
          </div>
        </div>

        {/* About University */}
        <Card className="border-primary-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-800">
              <GraduationCap size={20} />
              About Sample University
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-primary-700 leading-relaxed">
              Sample University has been a beacon of academic excellence for nearly six decades,
              fostering innovation, critical thinking, and leadership in our diverse community of
              learners. Located in the vibrant city of Boston, we offer world-class education
              across multiple disciplines while maintaining our commitment to personalized learning
              and student success.
            </p>
            <p className="text-primary-700 leading-relaxed">
              Our campus combines historic architecture with state-of-the-art facilities, creating
              an inspiring environment where tradition meets innovation. With a strong emphasis on
              research, community engagement, and global perspectives, we prepare our students to
              become leaders in their chosen fields and contributors to society.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Academic Programs */}
          <Card className="border-primary-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary-800">
                <BookOpen size={20} />
                Academic Programs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">College of Arts & Sciences</h4>
                  <p className="text-sm text-primary-600">Liberal arts, sciences, and humanities programs</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">School of Engineering</h4>
                  <p className="text-sm text-primary-600">Cutting-edge engineering and technology programs</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">Business School</h4>
                  <p className="text-sm text-primary-600">Comprehensive business and management education</p>
                </div>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <h4 className="font-semibold text-primary-800 mb-2">Graduate Studies</h4>
                  <p className="text-sm text-primary-600">Master's and doctoral degree programs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campus Life */}
          <Card className="border-primary-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary-800">
                <Users size={20} />
                Campus Life & Resources
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium text-blue-800">Student Organizations</span>
                  <Badge className="bg-blue-100 text-blue-800">150+</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Research Centers</span>
                  <Badge className="bg-green-100 text-green-800">25+</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium text-purple-800">Athletic Teams</span>
                  <Badge className="bg-purple-100 text-purple-800">18</Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium text-orange-800">Study Abroad Programs</span>
                  <Badge className="bg-orange-100 text-orange-800">40+</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-primary-200 text-center">
            <CardContent className="p-6">
              <Award size={32} className="mx-auto text-primary-600 mb-3" />
              <h3 className="font-bold text-primary-800 mb-2">Rankings & Recognition</h3>
              <p className="text-sm text-primary-600">
                Ranked #45 in National Universities by U.S. News & World Report
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary-200 text-center">
            <CardContent className="p-6">
              <Users size={32} className="mx-auto text-primary-600 mb-3" />
              <h3 className="font-bold text-primary-800 mb-2">Student-Faculty Ratio</h3>
              <p className="text-sm text-primary-600">
                14:1 ratio ensuring personalized attention and mentorship
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary-200 text-center">
            <CardContent className="p-6">
              <Calendar size={32} className="mx-auto text-primary-600 mb-3" />
              <h3 className="font-bold text-primary-800 mb-2">Semester System</h3>
              <p className="text-sm text-primary-600">
                Fall and Spring semesters with optional summer sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact & Visit */}
        <Card className="border-secondary-200 bg-secondary-50/30">
          <CardHeader>
            <CardTitle className="text-secondary-800">Visit Our Campus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-secondary-800 mb-2">Admissions Office</h4>
                <p className="text-sm text-secondary-700 mb-2">
                  123 University Avenue<br />
                  Boston, MA 02115
                </p>
                <p className="text-sm text-secondary-700">
                  Phone: (617) 555-0100<br />
                  Email: admissions@sampleuniversity.edu
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-secondary-800 mb-2">Campus Tours</h4>
                <p className="text-sm text-secondary-700 mb-2">
                  Daily guided tours available<br />
                  Monday - Friday: 10 AM, 2 PM<br />
                  Saturday: 11 AM, 1 PM
                </p>
                <p className="text-sm text-secondary-700">
                  Register online or call (617) 555-0123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </>
  );
}
