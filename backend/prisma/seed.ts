import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Clean up existing data to avoid duplicates
  await prisma.emissionFactor.deleteMany();
  await prisma.generatedAd.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();

  // Create Categories and nested Emission Factors
  const categoriesData = [
    {
      name: 'fast-fashion',
      emissionFactors: [
        {
          material: 'cotton',
          co2eKg: 8.3,
          waterLiters: 2700.0,
          wasteKg: 1.2,
          source: 'Stockholm Environment Institute (2021) - Cotton Apparel Lifecycle Assessment',
        },
        {
          material: 'polyester',
          co2eKg: 12.5,
          waterLiters: 350.0,
          wasteKg: 1.5,
          source: 'World Resources Institute (2020) - Environmental footprint of synthetic fibers',
        },
        {
          material: 'general',
          co2eKg: 10.0,
          waterLiters: 1500.0,
          wasteKg: 1.3,
          source: 'Ellen MacArthur Foundation (2021) - A New Textiles Economy',
        },
      ],
    },
    {
      name: 'electronics',
      emissionFactors: [
        {
          material: 'smartphone',
          co2eKg: 80.0,
          waterLiters: 12000.0,
          wasteKg: 0.2,
          source: 'Apple Product Environmental Report (2023) - iPhone 15 LCA',
        },
        {
          material: 'laptop',
          co2eKg: 320.0,
          waterLiters: 190000.0,
          wasteKg: 1.5,
          source: 'Dell Product Carbon Footprint Report (2022) - Latitude 7420 LCA',
        },
        {
          material: 'general',
          co2eKg: 120.0,
          waterLiters: 30000.0,
          wasteKg: 0.8,
          source: 'Global E-waste Monitor (2020) - Environmental lifecycle impacts',
        },
      ],
    },
    {
      name: 'flights',
      emissionFactors: [
        {
          material: 'short-haul',
          co2eKg: 150.0,
          waterLiters: 0.0,
          wasteKg: 2.0,
          source: 'UK Department for Environment, Food & Rural Affairs (DEFRA) (2023)',
        },
        {
          material: 'long-haul',
          co2eKg: 800.0,
          waterLiters: 0.0,
          wasteKg: 5.0,
          source: 'DEFRA Greenhouse gas reporting factors (2023)',
        },
      ],
    },
    {
      name: 'fast-food',
      emissionFactors: [
        {
          material: 'beef',
          co2eKg: 6.0,
          waterLiters: 1500.0,
          wasteKg: 0.1,
          source: "Poore & Nemecek (2018) - Reducing food's environmental impacts",
        },
        {
          material: 'chicken',
          co2eKg: 1.8,
          waterLiters: 300.0,
          wasteKg: 0.05,
          source: 'Oxford University Food Footprints Data (2018)',
        },
        {
          material: 'plant-based',
          co2eKg: 0.8,
          waterLiters: 120.0,
          wasteKg: 0.02,
          source: 'Oxford University Food Footprints Data (2018)',
        },
      ],
    },
    {
      name: 'delivery',
      emissionFactors: [
        {
          material: 'car',
          co2eKg: 1.2,
          waterLiters: 0.0,
          wasteKg: 0.1,
          source: 'European Environment Agency (2022) - Urban transport emissions',
        },
        {
          material: 'motorbike',
          co2eKg: 0.6,
          waterLiters: 0.0,
          wasteKg: 0.05,
          source: 'EEA greenhouse gas transport factors (2022)',
        },
        {
          material: 'general',
          co2eKg: 0.8,
          waterLiters: 0.0,
          wasteKg: 0.07,
          source: 'European Environment Agency (2022)',
        },
      ],
    },
    {
      name: 'home-goods',
      emissionFactors: [
        {
          material: 'wood',
          co2eKg: 45.0,
          waterLiters: 5000.0,
          wasteKg: 15.0,
          source: 'Furniture Industry Research Association (FIRA) (2021)',
        },
        {
          material: 'plastic',
          co2eKg: 12.0,
          waterLiters: 800.0,
          wasteKg: 2.0,
          source: 'Environmental Footprint of Plastics Lifecycle (2021)',
        },
        {
          material: 'general',
          co2eKg: 30.0,
          waterLiters: 2000.0,
          wasteKg: 8.0,
          source: 'FIRA Carbon Footprint Report (2021)',
        },
      ],
    },
  ];

  for (const cat of categoriesData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
      },
    });

    for (const ef of cat.emissionFactors) {
      await prisma.emissionFactor.create({
        data: {
          categoryId: category.id,
          material: ef.material,
          co2eKg: ef.co2eKg,
          waterLiters: ef.waterLiters,
          wasteKg: ef.wasteKg,
          source: ef.source,
        },
      });
    }
  }

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
