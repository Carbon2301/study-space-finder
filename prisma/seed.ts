import { PrismaClient } from "@prisma/client";
import { mockLocations } from "../src/lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Bắt đầu seeding dữ liệu...");

  // Xóa sạch dữ liệu cũ
  await prisma.reservation.deleteMany();
  await prisma.review.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.location.deleteMany();

  for (const loc of mockLocations) {
    const createdLocation = await prisma.location.create({
      data: {
        id: loc.id,
        name: loc.name,
        description: loc.description,
        address: loc.address,
        rating: loc.rating,
        reviewCount: loc.reviewCount,
        noiseLevel: loc.noiseLevel,
        purposes: loc.purposes,
        availableSeats: loc.availableSeats,
        totalSeats: loc.totalSeats,
        priceRange: loc.priceRange,
        distance: loc.distance,
        tags: loc.tags,
        amenities: loc.amenities,
        images: loc.images,
      },
    });

    // Seed Opening Hours
    for (const oh of loc.openingHours) {
      await prisma.openingHour.create({
        data: {
          day: oh.day,
          open: oh.open,
          close: oh.close,
          locationId: createdLocation.id,
        },
      });
    }

    // Seed Reviews
    for (const rev of loc.reviews) {
      await prisma.review.create({
        data: {
          id: rev.id,
          author: rev.author,
          avatar: rev.avatar,
          rating: rev.rating,
          comment: rev.comment,
          date: rev.date,
          purpose: rev.purpose,
          locationId: createdLocation.id,
        },
      });
    }
  }

  console.log("Đã hoàn tất seeding dữ liệu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
