const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const mentor = await prisma.mentorProfile.create({
    data: {
      name: "Aryan Vats",
      bio: null,
      skills: { set: [] },
      experience: null,
      branch: "MC",
      year: 2023,
      User: { connect: { user_id: 1 } },
      projects_in: { 
        connect: [ 
          { project_id: 2 }, 
          { project_id: 6 }, 
          { project_id: 5 }, 
          { project_id: 11 }, 
          { project_id: 8 }, 
          { project_id: 9 } 
        ] 
      }
    },
  });
  console.log('Created mentor:', mentor);
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });