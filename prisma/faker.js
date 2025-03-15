const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prisma = new PrismaClient();

async function seedProjects() {
  try {
    console.log('Creating 10 Projects for Student...');

    const statuses = ['OPEN', 'CLOSED', 'IN_PROGRESS'];
    const studentId = 1; // Aryan Vats' user_id

    for (let i = 0; i < 10; i++) {
      let status;

      if (i < 2) status = 'CLOSED'; 
      else if (i < 4) status = 'IN_PROGRESS';
      else status = faker.helpers.arrayElement(statuses);

      await prisma.project.create({
        data: {
          title: faker.commerce.productName(),
          description: faker.lorem.sentence(),
          field: faker.commerce.department(),
          tech_stack: [faker.word.noun(), faker.word.noun()],
          duration: faker.helpers.arrayElement(['1 week', '2 weeks', '1 month', '3 months']),
          status: status,
          students: {
            connect: { student_id: studentId },
          },
        },
      });
    }

    console.log('Projects created successfully');
  } catch (error) {
    console.error('Error seeding projects:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedProjects();
