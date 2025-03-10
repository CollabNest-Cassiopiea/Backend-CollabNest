const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function seedDatabase() {
  const numUsers = 100;
  const numProjects = 100;

  try {
    // 1. Create Users
    console.log('Creating Users...');
    const users = [];
    for (let i = 0; i < numUsers; i++) {
      const role = faker.helpers.arrayElement(['STUDENT', 'MENTOR', 'PROFESSOR', 'ADMIN']);
      const email = faker.internet.email();
      const password = faker.internet.password();

      const user = await prisma.user.create({
        data: {
          email: email,
          password: password,
          role: role,
        },
      });
      users.push(user);

      // Create Profiles
      if (role === 'STUDENT') {
        await prisma.studentProfile.create({
          data: {
            user_id: user.user_id,
            name: faker.person.fullName(),
            bio: faker.lorem.sentence(),
            skills: [faker.word.noun(), faker.word.noun()],
            experience: faker.helpers.arrayElement(['Beginner', 'Intermediate', 'Advanced']),
            branch: faker.helpers.arrayElement(['Computer Science', 'Electrical Engineering', 'Mechanical Engineering']),
            year: faker.number.int({ min: 1, max: 4 }),
          },
        });
      } else if (role === 'MENTOR') {
        await prisma.mentorProfile.create({
          data: {
            user_id: user.user_id,
            name: faker.person.fullName(),
            bio: faker.lorem.sentence(),
            skills: [faker.word.noun(), faker.word.noun()],
            experience: faker.helpers.arrayElement(['1-2 years', '3-5 years', '5+ years']),
            branch: faker.helpers.arrayElement(['Computer Science', 'Electrical Engineering', 'Mechanical Engineering']),
            year: faker.number.int({ min: 3, max: 5 }),
          },
        });
      } else if (role === 'PROFESSOR') {
        await prisma.professorProfile.create({
          data: {
            user_id: user.user_id,
            name: faker.person.fullName(),
            department: faker.commerce.department(),
            research_field: faker.lorem.words(3),
            papers_published: [faker.lorem.sentence(), faker.lorem.sentence()],
          },
        });
      } else if (role === 'ADMIN') {
        await prisma.admin.create({
          data: {
            user_id: user.user_id,
            name: faker.person.fullName(),
            bio: faker.lorem.sentence(),
            permissions: [faker.word.noun(), faker.word.noun()],
          },
        });
      }
    }

    // 2. Create Projects
    console.log('Creating Projects...');
    const projects = [];
    const mentors = users.filter(u => u.role === 'MENTOR');
    const professors = users.filter(u => u.role === 'PROFESSOR');
    for (let i = 0; i < numProjects; i++) {
      const mentor = faker.helpers.arrayElement(mentors);
      const professor = faker.helpers.arrayElement(professors);
      const project = await prisma.project.create({
        data: {
          title: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          field: faker.commerce.department(),
          tech_stack: [faker.word.noun(), faker.word.noun()],
          duration: faker.helpers.arrayElement(['1 week', '2 weeks', '1 month', '3 months']),
          mentor: mentor ? { connect: { mentor_id: mentor.MentorProfile.mentor_id } } : undefined,
          professor: professor ? { connect: { professor_id: professor.ProfessorProfile.professor_id } } : undefined,
          status: faker.helpers.arrayElement(['OPEN', 'CLOSED', 'IN_PROGRESS']),
        },
      });
      projects.push(project);
    }

    

    // 3. Create Tasks and Notifications
    console.log('Creating Tasks and Notifications...');
    const students = users.filter(u => u.role === 'STUDENT');
    for (let i = 0; i < numUsers; i++) {
      const user = users[i];
      const student = faker.helpers.arrayElement(students);

      // For each user, create 1 task and 1 notification
      const project = faker.helpers.arrayElement(projects);
      await prisma.task.create({
        data: {
          project_id: project.project_id,
          assigned_to: student.StudentProfile.student_id,
          title: faker.hacker.verb(),
          description: faker.hacker.phrase(),
          status: faker.helpers.arrayElement(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
        },
      });

      await prisma.notification.create({
        data: {
          user_id: user.user_id,
          message: faker.lorem.sentence(),
          status: faker.helpers.arrayElement(['UNREAD', 'READ']),
        },
      });
    }

    // 4. Creating Applications
    console.log('Creating Applications');
    for (const student of students) {
      // For each student, assign them to 3 random projects
      for (let j = 0; j < 3; j++) {
        const project = faker.helpers.arrayElement(projects);
        await prisma.application.create({
          data: {
            student_id: student.StudentProfile.student_id,
            project_id: project.project_id,
            status: faker.helpers.arrayElement(['PENDING', 'APPROVED', 'REJECTED', 'INTERVIEW_SCHEDULED']),
          },
        });
      }
    }

    // 5. Creating Meetings
    console.log('Creating Meetings');
    for (let i = 0; i < numProjects; i++) {
      const project = projects[i];
      const professor = professors[i % professors.length];
      const student = students[i % students.length];
      await prisma.meeting.create({
        data: {
          project_id: project.project_id,
          professor_id: professor.ProfessorProfile.professor_id,
          student_id: student.StudentProfile.student_id,
          meeting_link: faker.internet.url(),
        },
      });
    }

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
