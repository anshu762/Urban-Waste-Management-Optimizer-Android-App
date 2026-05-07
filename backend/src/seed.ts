import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding zones...');
  
  const zones = [
    { zoneName: 'North Zone', city: 'Metropolis', areaCode: 'N-01' },
    { zoneName: 'South Zone', city: 'Metropolis', areaCode: 'S-01' },
    { zoneName: 'East Zone', city: 'Metropolis', areaCode: 'E-01' },
    { zoneName: 'West Zone', city: 'Metropolis', areaCode: 'W-01' },
    { zoneName: 'Central Zone', city: 'Metropolis', areaCode: 'C-01' },
  ];

  for (const z of zones) {
    await prisma.zone.create({
      data: z,
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
