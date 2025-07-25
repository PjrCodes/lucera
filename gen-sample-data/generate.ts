// generates sample data for testing purposes directly into the mongodb database.
// borrows from schema defined in src/lib/schemas/*.ts
//
// USAGE:
// - To generate sample data: npm run ts-node generate.ts
// - To cleanup sample data: npm run ts-node generate.ts --cleanup
//
// This script generates realistic sample data including:
// - 2 Teachers and 25 Students
// - 2 Courses (Machine Learning and Geospatial Data Science)
// - Multiple assignments per course with submissions and grades
// - Announcements, messages, bookmarks, and other interaction data
// - File records, content materials, and extracted chunks
//
// The script is REVERSIBLE - use --cleanup flag to remove all generated data
//
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
import path from 'path';
const envPath = path.resolve(__dirname, "../.env.local");
dotenv.config({ path: envPath });

console.log("Generating sample data...");

// Utility functions
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomGrade(): number {
  // Generate realistic grade distribution (70-100, with bias toward higher scores)
  const weights = [0.05, 0.15, 0.25, 0.35, 0.20]; // 70-74, 75-79, 80-84, 85-89, 90-100
  const ranges = [[70, 74], [75, 79], [80, 84], [85, 89], [90, 100]];

  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (rand <= cumulative) {
      const [min, max] = ranges[i];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
  }
  return 85; // fallback
}

async function main() {
  // This script is for development purposes to populate the database with sample data.
  // It requires the MONGODB_URI environment variable to connect to the database.
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("lucera");

  console.log("Connected to MongoDB");
  console.log("🚀 Starting sample data generation...");

  // Check if sample data already exists
  const existingUsers = await db.collection("users_and_their_data").findOne({ id: "teacher_1" });
  if (existingUsers) {
    console.log("⚠️  Sample data already exists! Use --cleanup flag to remove it first.");
    await client.close();
    return;
  }

  // First, check existing courses to build upon
  const existingCourses = await db.collection("courses").find({}).toArray();
  console.log(`Found ${existingCourses.length} existing courses`);

  // Sample file paths from uploads directory
  const sampleFiles = [
    "Assignment_01.pdf", "Assignment_01 (7).pdf", "RL - Assignment-2.pdf",
    "Lec1_Introduction.pdf", "lecture_10.pdf", "lecture_18.pdf",
    "Geospatial-systems.pdf", "Spatial_Statistics.pdf", "Course_Summary.pdf"
  ];

  // Create sample teacher users
  const teacherUsers = [
    {
      _id: new ObjectId(),
      id: "teacher_1",
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@university.edu",
      emailVerified: true,
      image: "/placeholder.jpg",
      role: "teacher",
      dashboardLayout: {
        leftColumn: ["UPCOMING_DEADLINES", "CLASS_PROGRESS"],
        rightColumn: ["BOOKMARKS", "CREATE"]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedCourses: [],
      relatedFiles: []
    },
    {
      _id: new ObjectId(),
      id: "teacher_2",
      name: "Prof. Michael Chen",
      email: "michael.chen@university.edu",
      emailVerified: true,
      image: "/placeholder.jpg",
      role: "teacher",
      dashboardLayout: {
        leftColumn: ["UPCOMING_DEADLINES", "CLASS_PROGRESS"],
        rightColumn: ["BOOKMARKS", "CREATE"]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedCourses: [],
      relatedFiles: []
    }
  ];

  // Create sample student users
  const studentUsers = [];
  const studentNames = [
    "Alice Johnson", "Bob Smith", "Carol Davis", "David Wilson", "Eva Brown",
    "Frank Miller", "Grace Lee", "Henry Taylor", "Iris Wang", "Jack Thompson",
    "Kate Rodriguez", "Liam O'Brien", "Maya Patel", "Noah Kim", "Olivia Zhang",
    "Paul Martinez", "Quinn Anderson", "Rachel Green", "Sam Murphy", "Tina Liu",
    "Uma Singh", "Victor Petrov", "Wendy Clark", "Xavier Costa", "Yuki Tanaka"
  ];

  for (let i = 0; i < 25; i++) {
    const name = studentNames[i];
    const email = name.toLowerCase().replace(' ', '.') + "@student.edu";
    studentUsers.push({
      _id: new ObjectId(),
      id: `student_${i + 1}`,
      name,
      email,
      emailVerified: true,
      image: "/placeholder.jpg",
      role: "student",
      dashboardLayout: {
        leftColumn: ["UPCOMING_DEADLINES", "PROGRESS"],
        rightColumn: ["BOOKMARKS", "ANNOUNCEMENTS", "YOUR_BADGES"]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      relatedCourses: [],
      relatedFiles: []
    });
  }

  // Create sample courses
  const sampleCourses = [
    {
      _id: new ObjectId(),
      name: "Advanced Machine Learning",
      courseCode: "CS-7650",
      description: "Advanced topics in machine learning including deep learning, reinforcement learning, and neural network architectures. Students will implement algorithms and work on real-world applications.",
      shortDescription: "Advanced ML concepts, deep learning, reinforcement learning, neural networks, practical implementations",
      userId: teacherUsers[0]._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "published",
      courseStartDate: new Date("2024-08-20"),
      courseEndDate: new Date("2024-12-15"),
      llmParsingFailed: false,
      enrolledStudentCount: 20,
      completedStudentCount: 15,
      courseColor: "#3B82F6",
      courseColorStyle: "background-color: #3B82F6; color: #FFFFFF;",
      coverImage: null,
      units: [
        { name: "Deep Learning Fundamentals", description: "Neural networks, backpropagation, optimization" },
        { name: "Convolutional Neural Networks", description: "CNN architectures, computer vision applications" },
        { name: "Recurrent Neural Networks", description: "RNNs, LSTMs, sequence modeling" },
        { name: "Reinforcement Learning", description: "Q-learning, policy gradients, deep RL" },
        { name: "Advanced Topics", description: "GANs, transformers, attention mechanisms" }
      ],
      timeline: [
        {
          type: "assignment",
          title: "Neural Network Implementation",
          startDate: "2024-09-01",
          dueDate: "2024-09-15",
          gradeReleaseDate: "2024-09-22"
        },
        {
          type: "project",
          title: "CNN Image Classification",
          startDate: "2024-09-16",
          dueDate: "2024-10-10",
          gradeReleaseDate: "2024-10-17"
        },
        {
          type: "midsem_exam",
          title: "Midterm Examination",
          startDate: "2024-10-15",
          dueDate: "2024-10-15",
          gradeReleaseDate: "2024-10-22"
        },
        {
          type: "assignment",
          title: "RNN Text Generation",
          startDate: "2024-10-20",
          dueDate: "2024-11-05",
          gradeReleaseDate: "2024-11-12"
        },
        {
          type: "project",
          title: "Reinforcement Learning Game",
          startDate: "2024-11-10",
          dueDate: "2024-12-01",
          gradeReleaseDate: "2024-12-08"
        },
        {
          type: "endsem_exam",
          title: "Final Examination",
          startDate: "2024-12-10",
          dueDate: "2024-12-10",
          gradeReleaseDate: "2024-12-15"
        }
      ]
    },
    {
      _id: new ObjectId(),
      name: "Geospatial Data Science",
      courseCode: "GIS-5820",
      description: "Comprehensive study of geospatial data analysis, GIS technologies, remote sensing, and spatial statistics. Covers both theoretical foundations and practical applications in various domains.",
      shortDescription: "GIS analysis, remote sensing, spatial statistics, geographic data processing, mapping technologies",
      userId: teacherUsers[1]._id.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "published",
      courseStartDate: new Date("2024-08-20"),
      courseEndDate: new Date("2024-12-15"),
      llmParsingFailed: false,
      enrolledStudentCount: 18,
      completedStudentCount: 12,
      courseColor: "#059669",
      courseColorStyle: "background-color: #059669; color: #FFFFFF;",
      coverImage: null,
      units: [
        { name: "GIS Fundamentals", description: "Coordinate systems, projections, spatial data types" },
        { name: "Spatial Data Processing", description: "Data collection, cleaning, transformation" },
        { name: "Remote Sensing", description: "Satellite imagery, image processing, classification" },
        { name: "Spatial Statistics", description: "Spatial autocorrelation, interpolation, modeling" },
        { name: "Applications", description: "Urban planning, environmental monitoring, transportation" }
      ],
      timeline: [
        {
          type: "assignment",
          title: "Coordinate System Analysis",
          startDate: "2024-09-01",
          dueDate: "2024-09-12",
          gradeReleaseDate: "2024-09-19"
        },
        {
          type: "project",
          title: "Satellite Image Classification",
          startDate: "2024-09-20",
          dueDate: "2024-10-15",
          gradeReleaseDate: "2024-10-22"
        },
        {
          type: "assignment",
          title: "Spatial Statistics Lab",
          startDate: "2024-10-16",
          dueDate: "2024-11-01",
          gradeReleaseDate: "2024-11-08"
        },
        {
          type: "project",
          title: "GIS Application Development",
          startDate: "2024-11-05",
          dueDate: "2024-12-01",
          gradeReleaseDate: "2024-12-08"
        },
        {
          type: "endsem_exam",
          title: "Final Examination",
          startDate: "2024-12-10",
          dueDate: "2024-12-10",
          gradeReleaseDate: "2024-12-15"
        }
      ]
    }
  ];

  // Assign students to courses
  const mlStudents = studentUsers.slice(0, 20);
  const gisStudents = studentUsers.slice(5, 23); // Some overlap

  // Update user related courses
  mlStudents.forEach((student: any) => {
    student.relatedCourses = [sampleCourses[0]._id.toString()];
  });
  gisStudents.forEach((student: any) => {
    if (student.relatedCourses.length > 0) {
      student.relatedCourses.push(sampleCourses[1]._id.toString());
    } else {
      student.relatedCourses = [sampleCourses[1]._id.toString()];
    }
  });

  (teacherUsers[0] as any).relatedCourses = [sampleCourses[0]._id.toString()];
  (teacherUsers[1] as any).relatedCourses = [sampleCourses[1]._id.toString()];

  // Insert users into both collections (auth and user_data)
  console.log("Inserting users...");

  // Insert into users collection (for auth) - only _id, name, email, emailVerified, image
  const authUsers = [...teacherUsers, ...studentUsers].map(user => ({
    _id: user._id, // ObjectId
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image
  }));
  await db.collection("users").insertMany(authUsers);

  // Insert into user_data collection - id field references users._id
  const userDataRecords = [...teacherUsers, ...studentUsers].map(user => ({
    _id: new ObjectId(), // New ObjectId for user_data
    id: user._id.toString(), // String reference to users._id
    role: user.role,
    dashboardLayout: user.dashboardLayout,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    relatedCourses: user.relatedCourses,
    relatedFiles: user.relatedFiles
  }));
  await db.collection("user_data").insertMany(userDataRecords);

  // Note: users_and_their_data is a MongoDB view that automatically aggregates
  // data from users and user_data collections, so we don't insert into it

  // Insert courses
  console.log("Inserting courses...");
  await db.collection("courses").insertMany(sampleCourses);

  // Create sample files
  console.log("Creating file records...");
  const fileRecords: any[] = [];
  for (let i = 0; i < sampleFiles.length; i++) {
    const fileName = sampleFiles[i];
    const fileId = new ObjectId();
    const userId = i < 5 ? teacherUsers[0]._id.toString() : teacherUsers[1]._id.toString();

    fileRecords.push({
      _id: fileId,
      name: fileName,
      size: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
      file_type: "application/pdf",
      path: `data/uploads/${fileName}`,
      userId,
      createdAt: randomDate(new Date("2024-08-01"), new Date()),
      updatedAt: randomDate(new Date("2024-08-01"), new Date()),
      type: i % 3 === 0 ? "assignment" : (i % 3 === 1 ? "content" : "syllabus"),
      blockDownload: Math.random() > 0.8,
      blockChatbot: Math.random() > 0.9
    });
  }
  await db.collection("files").insertMany(fileRecords);

  // Create assignments for each course
  console.log("Creating assignments...");
  const assignments: any[] = [];

  // ML Course assignments
  const mlAssignments = [
    {
      _id: new ObjectId(),
      title: "Neural Network Implementation",
      description: "Implement a neural network from scratch using only NumPy. Train on MNIST dataset and achieve >95% accuracy.",
      topics: [1, 2], // Deep Learning Fundamentals, CNNs
      startDate: "2024-09-01",
      dueDate: "2024-09-15",
      gradeReleaseDate: "2024-09-22",
      submissionType: "file_upload",
      grading: {
        type: "percentage",
        method: "rubric",
        total_points: 100,
        rubric: {
          criteria: [
            { description: "Implementation Quality", points: 30 },
            { description: "Code Documentation", points: 20 },
            { description: "Performance Results", points: 25 },
            { description: "Analysis and Insights", points: 25 }
          ],
          level: [
            { description: "Excellent", rank: 4 },
            { description: "Good", rank: 3 },
            { description: "Satisfactory", rank: 2 },
            { description: "Needs Improvement", rank: 1 }
          ]
        }
      },
      courseId: sampleCourses[0]._id.toString(),
      fileId: fileRecords[0]._id.toString(),
      createdBy: teacherUsers[0]._id.toString(),
      createdAt: new Date("2024-08-25"),
      updatedAt: new Date("2024-08-25"),
      gradesPublished: true,
      gradesPublishedAt: new Date("2024-09-22"),
      gradesPublishedBy: teacherUsers[0]._id.toString(),
      blockDownload: false,
      blockChatbot: false
    },
    {
      _id: new ObjectId(),
      title: "CNN Image Classification Project",
      description: "Design and train a CNN for multi-class image classification. Compare different architectures and optimization techniques.",
      topics: [2, 3], // CNNs, RNNs
      startDate: "2024-09-16",
      dueDate: "2024-10-10",
      gradeReleaseDate: "2024-10-17",
      submissionType: "file_upload",
      grading: {
        type: "percentage",
        method: "direct",
        total_points: 100,
        rubric: {
          criteria: [],
          level: []
        }
      },
      courseId: sampleCourses[0]._id.toString(),
      fileId: fileRecords[1]._id.toString(),
      createdBy: teacherUsers[0]._id.toString(),
      createdAt: new Date("2024-09-10"),
      updatedAt: new Date("2024-09-10"),
      gradesPublished: true,
      gradesPublishedAt: new Date("2024-10-17"),
      gradesPublishedBy: teacherUsers[0]._id.toString(),
      blockDownload: false,
      blockChatbot: false
    }
  ];

  // GIS Course assignments
  const gisAssignments = [
    {
      _id: new ObjectId(),
      title: "Coordinate System Analysis",
      description: "Analyze different coordinate systems and projections. Create maps showing distortion effects.",
      topics: [1], // GIS Fundamentals
      startDate: "2024-09-01",
      dueDate: "2024-09-12",
      gradeReleaseDate: "2024-09-19",
      submissionType: "file_upload",
      grading: {
        type: "percentage",
        method: "rubric",
        total_points: 100,
        rubric: {
          criteria: [
            { description: "Technical Accuracy", points: 40 },
            { description: "Visual Quality of Maps", points: 30 },
            { description: "Analysis Depth", points: 30 }
          ],
          level: [
            { description: "Excellent", rank: 4 },
            { description: "Good", rank: 3 },
            { description: "Satisfactory", rank: 2 },
            { description: "Needs Improvement", rank: 1 }
          ]
        }
      },
      courseId: sampleCourses[1]._id.toString(),
      fileId: fileRecords[5]._id.toString(),
      createdBy: teacherUsers[1]._id.toString(),
      createdAt: new Date("2024-08-25"),
      updatedAt: new Date("2024-08-25"),
      gradesPublished: true,
      gradesPublishedAt: new Date("2024-09-19"),
      gradesPublishedBy: teacherUsers[1]._id.toString(),
      blockDownload: false,
      blockChatbot: false
    },
    {
      _id: new ObjectId(),
      title: "Spatial Statistics Laboratory",
      description: "Apply spatial statistics methods to real-world geographic datasets. Perform spatial autocorrelation analysis.",
      topics: [4], // Spatial Statistics
      startDate: "2024-10-16",
      dueDate: "2024-11-01",
      gradeReleaseDate: "2024-11-08",
      submissionType: "file_upload",
      grading: {
        type: "percentage",
        method: "direct",
        total_points: 100,
        rubric: {
          criteria: [],
          level: []
        }
      },
      courseId: sampleCourses[1]._id.toString(),
      fileId: fileRecords[6]._id.toString(),
      createdBy: teacherUsers[1]._id.toString(),
      createdAt: new Date("2024-10-10"),
      updatedAt: new Date("2024-10-10"),
      gradesPublished: false,
      blockDownload: false,
      blockChatbot: false
    }
  ];

  assignments.push(...mlAssignments, ...gisAssignments);
  await db.collection("assignment").insertMany(assignments);

  // Create submissions and grades
  console.log("Creating submissions and grades...");
  const submissions: any[] = [];

  // ML course submissions
  mlStudents.forEach(student => {
    mlAssignments.forEach((assignment) => {
      // 90% of students submit assignments
      if (Math.random() > 0.1) {
        const submittedAt = randomDate(new Date(assignment.startDate), new Date(assignment.dueDate));
        const isGraded = assignment.gradesPublished;

        submissions.push({
          _id: new ObjectId(),
          assignmentId: assignment._id.toString(),
          courseId: assignment.courseId,
          studentId: student._id.toString(),
          submissionType: "file_upload",
          submissionContent: null,
          submittedFileId: randomElement(fileRecords)._id.toString(),
          submittedAt,
          status: isGraded ? "graded" : "submitted",
          grade: isGraded ? randomGrade() : null,
          feedback: isGraded ? [
            "Good work overall. Strong implementation with clear documentation.",
            "Excellent analysis. Consider exploring additional optimization techniques.",
            "Well done. Minor issues with edge case handling.",
            "Strong performance. Could benefit from more detailed explanations.",
            "Good effort. Some areas need improvement in methodology."
          ][Math.floor(Math.random() * 5)] : null,
          gradedBy: isGraded ? teacherUsers[0]._id.toString() : null,
          gradedAt: isGraded ? randomDate(new Date(assignment.gradeReleaseDate), new Date()) : null,
          rubricGrades: assignment.grading.method === "rubric" && isGraded ?
            assignment.grading.rubric.criteria.map((criteria, index) => ({
              criteriaIndex: index,
              levelRank: Math.floor(Math.random() * 4) + 1,
              points: Math.floor((Math.random() * 0.4 + 0.6) * criteria.points) // 60-100% of points
            })) : null
        });
      }
    });
  });

  // GIS course submissions
  gisStudents.forEach(student => {
    gisAssignments.forEach((assignment) => {
      // 85% of students submit assignments
      if (Math.random() > 0.15) {
        const submittedAt = randomDate(new Date(assignment.startDate), new Date(assignment.dueDate));
        const isGraded = assignment.gradesPublished;

        submissions.push({
          _id: new ObjectId(),
          assignmentId: assignment._id.toString(),
          courseId: assignment.courseId,
          studentId: student._id.toString(),
          submissionType: "file_upload",
          submissionContent: null,
          submittedFileId: randomElement(fileRecords)._id.toString(),
          submittedAt,
          status: isGraded ? "graded" : "submitted",
          grade: isGraded ? randomGrade() : null,
          feedback: isGraded ? [
            "Excellent spatial analysis with clear methodology.",
            "Good work. Maps are well-designed and informative.",
            "Strong technical execution. Consider adding more interpretation.",
            "Well done. Minor improvements needed in data presentation.",
            "Good effort. Some concepts need further development."
          ][Math.floor(Math.random() * 5)] : null,
          gradedBy: isGraded ? teacherUsers[1]._id.toString() : null,
          gradedAt: isGraded ? randomDate(new Date(assignment.gradeReleaseDate), new Date()) : null,
          rubricGrades: assignment.grading.method === "rubric" && isGraded ?
            assignment.grading.rubric.criteria.map((criteria, index) => ({
              criteriaIndex: index,
              levelRank: Math.floor(Math.random() * 4) + 1,
              points: Math.floor((Math.random() * 0.4 + 0.6) * criteria.points)
            })) : null
        });
      }
    });
  });

  await db.collection("submitted_assignments").insertMany(submissions);

  // Create content/materials
  console.log("Creating course content...");
  const content = [
    {
      _id: new ObjectId(),
      title: "Deep Learning Introduction",
      description: "Fundamental concepts of deep learning, neural networks, and backpropagation algorithm.",
      topics: [1],
      courseId: sampleCourses[0]._id.toString(),
      fileId: fileRecords[2]._id.toString(),
      createdBy: teacherUsers[0]._id.toString(),
      createdAt: new Date("2024-08-20"),
      updatedAt: new Date("2024-08-20"),
      shortDescription: "Neural networks, backpropagation, gradient descent, activation functions",
      type: "content",
      extractedChunks: [],
      blockDownload: false,
      blockChatbot: false
    },
    {
      _id: new ObjectId(),
      title: "GIS Coordinate Systems Guide",
      description: "Comprehensive guide to geographic coordinate systems, projections, and datum transformations.",
      topics: [1],
      courseId: sampleCourses[1]._id.toString(),
      fileId: fileRecords[7]._id.toString(),
      createdBy: teacherUsers[1]._id.toString(),
      createdAt: new Date("2024-08-20"),
      updatedAt: new Date("2024-08-20"),
      shortDescription: "Coordinate systems, map projections, datum, transformation, geographic reference",
      type: "content",
      extractedChunks: [],
      blockDownload: false,
      blockChatbot: false
    }
  ];

  await db.collection("content").insertMany(content);

  // Create announcements
  console.log("Creating announcements...");
  const announcements = [
    {
      _id: new ObjectId(),
      title: "Welcome to Advanced Machine Learning",
      content: "Welcome to the course! Please review the syllabus and set up your development environment. Office hours are Tuesdays and Thursdays 2-4 PM.",
      courseId: sampleCourses[0]._id.toString(),
      courseName: sampleCourses[0].name,
      courseCode: sampleCourses[0].courseCode,
      createdBy: teacherUsers[0]._id.toString(),
      createdAt: new Date("2024-08-20"),
      updatedAt: new Date("2024-08-20"),
      isActive: true
    },
    {
      _id: new ObjectId(),
      title: "Midterm Exam Details",
      content: "The midterm exam will be held on October 15th. It will cover topics 1-3. Study guide has been posted to the course materials.",
      courseId: sampleCourses[0]._id.toString(),
      courseName: sampleCourses[0].name,
      courseCode: sampleCourses[0].courseCode,
      createdBy: teacherUsers[0]._id.toString(),
      createdAt: new Date("2024-10-01"),
      updatedAt: new Date("2024-10-01"),
      isActive: true
    },
    {
      _id: new ObjectId(),
      title: "GIS Software Installation",
      content: "Please install QGIS and ArcGIS Pro (student license available). Installation guides are available in the course materials section.",
      courseId: sampleCourses[1]._id.toString(),
      courseName: sampleCourses[1].name,
      courseCode: sampleCourses[1].courseCode,
      createdBy: teacherUsers[1]._id.toString(),
      createdAt: new Date("2024-08-22"),
      updatedAt: new Date("2024-08-22"),
      isActive: true
    }
  ];

  await db.collection("announcements").insertMany(announcements);

  // Create some announcement read statuses
  const announcementReadStatuses: any[] = [];
  announcements.forEach(announcement => {
    const relevantStudents = announcement.courseId === sampleCourses[0]._id.toString() ? mlStudents : gisStudents;

    // Random percentage of students have read each announcement
    const readCount = Math.floor(relevantStudents.length * (Math.random() * 0.5 + 0.3)); // 30-80% read rate
    const readStudents = relevantStudents.slice(0, readCount);

    readStudents.forEach(student => {
      announcementReadStatuses.push({
        _id: new ObjectId(),
        announcementId: announcement._id.toString(),
        userId: student._id.toString(),
        readAt: randomDate(announcement.createdAt, new Date()),
        createdAt: randomDate(announcement.createdAt, new Date())
      });
    });
  });

  if (announcementReadStatuses.length > 0) {
    await db.collection("announcement_read_status").insertMany(announcementReadStatuses);
  }

  // Create some bookmarks
  console.log("Creating bookmarks...");
  const bookmarks: any[] = [];

  // Random students bookmark random content
  [...mlStudents, ...gisStudents].forEach(student => {
    // Each student bookmarks 1-3 items
    const bookmarkCount = Math.floor(Math.random() * 3) + 1;
    const allItems = [
      ...assignments.map(a => ({ type: "assignment", id: a._id.toString() })),
      ...content.map(c => ({ type: "content", id: c._id.toString() })),
      ...sampleCourses.map(course => ({ type: "course", id: course._id.toString() }))
    ];

    // Filter items relevant to student's courses
    const relevantItems = allItems.filter(item => {
      if (item.type === "course") return (student.relatedCourses as string[]).includes(item.id);
      if (item.type === "assignment") {
        const assignment = assignments.find(a => a._id.toString() === item.id);
        return assignment && (student.relatedCourses as string[]).includes(assignment.courseId);
      }
      if (item.type === "content") {
        const contentItem = content.find(c => c._id.toString() === item.id);
        return contentItem && (student.relatedCourses as string[]).includes(contentItem.courseId);
      }
      return false;
    });

    for (let i = 0; i < Math.min(bookmarkCount, relevantItems.length); i++) {
      const item = relevantItems[i];
      bookmarks.push({
        _id: new ObjectId(),
        userId: student._id.toString(),
        type: item.type,
        relatedId: item.id,
        createdAt: randomDate(new Date("2024-08-20"), new Date()),
        updatedAt: randomDate(new Date("2024-08-20"), new Date())
      });
    }
  });

  if (bookmarks.length > 0) {
    await db.collection("bookmarks").insertMany(bookmarks);
  }

  // Create messages between users
  console.log("Creating messages...");
  const messages: any[] = [];
  const messageReadStatuses: any[] = [];

  // Teachers send messages to students
  teacherUsers.forEach(teacher => {
    const teacherCourse = sampleCourses.find(course => course.userId === teacher._id.toString());
    if (teacherCourse) {
      const courseStudents = teacher._id.toString() === teacherUsers[0]._id.toString() ? mlStudents : gisStudents;

      // Teacher sends 2-5 messages to random students
      const messageCount = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < messageCount; i++) {
        const student = randomElement(courseStudents);
        const messageId = new ObjectId();
        const sentAt = randomDate(new Date("2024-08-20"), new Date());

        messages.push({
          _id: messageId,
          senderId: teacher._id.toString(),
          receiverId: student._id.toString(),
          message: [
            "Hi! I noticed you've been doing well in the course. Keep up the great work!",
            "Please see me during office hours to discuss your recent assignment.",
            "Great question in class today. I've attached some additional resources.",
            "Your project proposal looks interesting. Let's schedule a meeting to discuss it further.",
            "I wanted to follow up on our discussion about the research opportunities."
          ][Math.floor(Math.random() * 5)],
          createdAt: sentAt,
          updatedAt: sentAt
        });

        // 70% chance the message has been read
        if (Math.random() > 0.3) {
          messageReadStatuses.push({
            _id: new ObjectId(),
            messageId: messageId.toString(),
            userId: student._id.toString(),
            readAt: randomDate(sentAt, new Date()),
            createdAt: randomDate(sentAt, new Date())
          });
        }
      }
    }
  });

  // Students send messages to teachers
  [...mlStudents, ...gisStudents].forEach(student => {
    // 40% of students send messages to their teachers
    if (Math.random() > 0.6) {
      student.relatedCourses.forEach(courseId => {
        const course = sampleCourses.find(c => c._id.toString() === courseId);
        if (course) {
          const teacher = teacherUsers.find(t => t._id.toString() === course.userId);
          if (teacher) {
            const messageId = new ObjectId();
            const sentAt = randomDate(new Date("2024-09-01"), new Date());

            messages.push({
              _id: messageId,
              senderId: student._id.toString(),
              receiverId: teacher._id.toString(),
              message: [
                "I have a question about the latest assignment. Could we schedule a meeting?",
                "Thank you for the feedback on my project. I have a few clarifications to ask.",
                "I'm having trouble with one of the concepts. Could you recommend additional reading?",
                "Would it be possible to get an extension on the upcoming assignment?",
                "I'm interested in the research you mentioned. Could you tell me more about it?"
              ][Math.floor(Math.random() * 5)],
              createdAt: sentAt,
              updatedAt: sentAt
            });

            // 90% chance teacher has read student messages
            if (Math.random() > 0.1) {
              messageReadStatuses.push({
                _id: new ObjectId(),
                messageId: messageId.toString(),
                userId: teacher._id.toString(),
                readAt: randomDate(sentAt, new Date()),
                createdAt: randomDate(sentAt, new Date())
              });
            }
          }
        }
      });
    }
  });

  // Some student-to-student messages within the same courses
  [...mlStudents, ...gisStudents].forEach(student => {
    if (Math.random() > 0.7) { // 30% of students send peer messages
      const courseStudents = ((student.relatedCourses as string[]).includes(sampleCourses[0]._id.toString())) ?
        mlStudents : gisStudents;
      const otherStudents = courseStudents.filter(s => s._id.toString() !== student._id.toString());

      if (otherStudents.length > 0) {
        const peer = randomElement(otherStudents);
        const messageId = new ObjectId();
        const sentAt = randomDate(new Date("2024-09-01"), new Date());

        messages.push({
          _id: messageId,
          senderId: student._id.toString(),
          receiverId: peer._id.toString(),
          message: [
            "Hey! Did you understand the last lecture? I'm a bit confused about some concepts.",
            "Want to form a study group for the upcoming exam?",
            "I found this great resource that might help with our assignment.",
            "Are you planning to attend the review session tomorrow?",
            "Could you share your notes from yesterday's class? I missed it."
          ][Math.floor(Math.random() * 5)],
          createdAt: sentAt,
          updatedAt: sentAt
        });

        // 60% chance peer has read the message
        if (Math.random() > 0.4) {
          messageReadStatuses.push({
            _id: new ObjectId(),
            messageId: messageId.toString(),
            userId: peer._id.toString(),
            readAt: randomDate(sentAt, new Date()),
            createdAt: randomDate(sentAt, new Date())
          });
        }
      }
    }
  });

  if (messages.length > 0) {
    await db.collection("messages").insertMany(messages);
  }

  if (messageReadStatuses.length > 0) {
    await db.collection("message_read_status").insertMany(messageReadStatuses);
  }

  // Create extracted chunks for content
  console.log("Creating extracted chunks...");
  const extractedChunks: any[] = [];
  content.forEach(contentItem => {
    const chunkCount = Math.floor(Math.random() * 5) + 3; // 3-7 chunks per content
    for (let i = 0; i < chunkCount; i++) {
      extractedChunks.push({
        _id: new ObjectId(),
        text: `This is extracted chunk ${i + 1} from ${contentItem.title}. It contains important information about the course material and concepts covered in this section.`,
        contentId: contentItem._id.toString(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  });

  if (extractedChunks.length > 0) {
    await db.collection("extracted_chunks").insertMany(extractedChunks);
  }

  // Clean up and close connection
  await client.close();

  console.log("✅ Sample data generation completed!");
  console.log(`📊 Generated:
  - ${teacherUsers.length + studentUsers.length} users (${teacherUsers.length} teachers, ${studentUsers.length} students)
  - ${sampleCourses.length} courses
  - ${assignments.length} assignments
  - ${submissions.length} submissions with grades
  - ${fileRecords.length} file records
  - ${content.length} content items
  - ${announcements.length} announcements
  - ${announcementReadStatuses.length} announcement read statuses
  - ${bookmarks.length} bookmarks
  - ${messages.length} messages
  - ${messageReadStatuses.length} message read statuses
  - ${extractedChunks.length} extracted chunks`);

  return;
}

// Function to clean up sample data (for reversibility)
async function cleanup() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db("lucera");

  console.log("🧹 Cleaning up sample data...");

  // Check if sample data exists
  const existingUsers = await db.collection("users").findOne({
    name: { $in: ["Dr. Sarah Johnson", "Prof. Michael Chen"] }
  });
  if (!existingUsers) {
    console.log("ℹ️  No sample data found to clean up.");
    await client.close();
    return;
  }

  // Get the actual ObjectIds of sample users
  const sampleUsers = await db.collection("users").find({
    name: { $regex: /(Dr\. Sarah Johnson|Prof\. Michael Chen|Alice Johnson|Bob Smith|Carol Davis|David Wilson|Eva Brown|Frank Miller|Grace Lee|Henry Taylor|Iris Wang|Jack Thompson|Kate Rodriguez|Liam O'Brien|Maya Patel|Noah Kim|Olivia Zhang|Paul Martinez|Quinn Anderson|Rachel Green|Sam Murphy|Tina Liu|Uma Singh|Victor Petrov|Wendy Clark|Xavier Costa|Yuki Tanaka)/ }
  }).toArray();

  const sampleUserObjectIds = sampleUsers.map(user => user._id);
  const sampleUserStringIds = sampleUsers.map(user => user._id.toString());

  console.log("Deleting users...");
  await db.collection("users").deleteMany({
    _id: { $in: sampleUserObjectIds }
  });

  await db.collection("user_data").deleteMany({
    id: { $in: sampleUserStringIds }
  });

  // Delete courses created by sample teachers
  console.log("Deleting courses...");
  const sampleCourses = await db.collection("courses").find({
    userId: { $in: sampleUserStringIds }
  }).toArray();

  const sampleCourseIds = sampleCourses.map(course => course._id.toString());

  await db.collection("courses").deleteMany({
    userId: { $in: sampleUserStringIds }
  });

  // Delete assignments for sample courses
  console.log("Deleting assignments...");
  await db.collection("assignment").deleteMany({
    courseId: { $in: sampleCourseIds }
  });

  // Delete submissions by sample students
  console.log("Deleting submissions...");
  await db.collection("submitted_assignments").deleteMany({
    studentId: { $in: sampleUserStringIds }
  });

  // Delete content for sample courses
  console.log("Deleting content...");
  await db.collection("content").deleteMany({
    courseId: { $in: sampleCourseIds }
  });

  // Delete announcements for sample courses
  console.log("Deleting announcements...");
  await db.collection("announcements").deleteMany({
    courseId: { $in: sampleCourseIds }
  });

  // Delete announcement read statuses for sample users
  await db.collection("announcement_read_status").deleteMany({
    userId: { $in: sampleUserStringIds }
  });

  // Delete bookmarks by sample users
  console.log("Deleting bookmarks...");
  await db.collection("bookmarks").deleteMany({
    userId: { $in: sampleUserStringIds }
  });

  // Delete messages involving sample users
  console.log("Deleting messages...");
  await db.collection("messages").deleteMany({
    $or: [
      { senderId: { $in: sampleUserStringIds } },
      { receiverId: { $in: sampleUserStringIds } }
    ]
  });

  // Delete message read statuses for sample users
  await db.collection("message_read_status").deleteMany({
    userId: { $in: sampleUserStringIds }
  });

  // Delete files created by sample users
  console.log("Deleting files...");
  await db.collection("files").deleteMany({
    userId: { $in: sampleUserStringIds }
  });

  // Delete extracted chunks
  console.log("Deleting extracted chunks...");
  await db.collection("extracted_chunks").deleteMany({
    text: { $regex: /This is extracted chunk.*from/ }
  });

  await client.close();
  console.log("✅ Sample data cleanup completed!");
}

// Main execution
async function run() {
  const args = process.argv.slice(2);

  if (args.includes('--cleanup') || args.includes('-c')) {
    await cleanup();
  } else {
    await main();
  }
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
