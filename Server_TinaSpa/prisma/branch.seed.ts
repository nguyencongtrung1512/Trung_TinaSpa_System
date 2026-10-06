import type { PrismaClient } from '@prisma/client';

// Mirrors Website_TinaSpa/app/features/contact/ContactPage.tsx + locale `contact.branches`.
const branches = [
  {
    slug: 'q1',
    nameVietnamese: 'TinaSpa Bến Nghé — Quận 1',
    nameEnglish: 'TinaSpa Ben Nghe — District 1',
    addressVietnamese:
      '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    addressEnglish:
      '12 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
    hotline: '(028) 3823 6688',
    openTime: '08:00',
    closeTime: '20:00',
    sortOrder: 1,
  },
  {
    slug: 'hn',
    nameVietnamese: 'TinaSpa Tràng Tiền — Hoàn Kiếm',
    nameEnglish: 'TinaSpa Trang Tien — Hoan Kiem',
    addressVietnamese:
      '45 Lý Thường Kiệt, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
    addressEnglish:
      '45 Ly Thuong Kiet, Hang Bai Ward, Hoan Kiem District, Hanoi',
    hotline: '(024) 3936 9988',
    openTime: '09:00',
    closeTime: '21:00',
    sortOrder: 2,
  },
];

export async function seedBranches(prisma: PrismaClient) {
  let created = 0;
  for (const branch of branches) {
    const existing = await prisma.branch.findUnique({
      where: { slug: branch.slug },
    });
    if (existing) continue;
    await prisma.branch.create({ data: branch });
    created += 1;
  }
  console.log(`Seeded branches: ${created} created`);
}
