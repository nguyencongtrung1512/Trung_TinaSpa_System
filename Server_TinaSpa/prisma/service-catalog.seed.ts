import type { PrismaClient } from '@prisma/client';

type SeedService = {
  slug: string;
  name: string;
  price: number;
  shortVi: string;
  shortEn: string;
  descriptionVi: string;
  descriptionEn: string;
};

type SeedCategory = {
  slug: string;
  nameVi: string;
  nameEn: string;
  descriptionVi?: string;
  descriptionEn?: string;
  icon?: string;
  image?: string;
  imageAlt?: string;
  isFeatured: boolean;
  services?: SeedService[];
};

// Mirrors Website_TinaSpa/app/data/home.ts + app/i18n/locales/{vi,en}.ts (services, serviceMenus).
const categories: SeedCategory[] = [
  {
    slug: 'skin-exam',
    nameVi: 'Khám da tổng quát',
    nameEn: 'Comprehensive skin exam',
    descriptionVi: 'Đánh giá tình trạng da, xác định nguyên nhân và phác đồ phù hợp trước khi điều trị.',
    descriptionEn: 'Assess your skin, identify root causes and set the right plan before any treatment.',
    icon: 'dermatology',
    isFeatured: true,
  },
  {
    slug: 'acne',
    nameVi: 'Điều trị mụn',
    nameEn: 'Acne treatment',
    descriptionVi: 'Liệu trình y khoa giảm viêm, kiểm soát dầu và phục hồi hàng rào bảo vệ da.',
    descriptionEn: 'Medical treatments that calm inflammation, control oil and restore the skin barrier.',
    icon: 'face_retouching_natural',
    isFeatured: true,
  },
  {
    slug: 'rejuvenation',
    nameVi: 'Trẻ hóa da',
    nameEn: 'Skin rejuvenation',
    descriptionVi: 'Công nghệ trẻ hóa giúp da căng mịn, đều màu và khỏe hơn theo thời gian.',
    descriptionEn: 'Rejuvenation technology for firmer, smoother, more even and healthier skin over time.',
    icon: 'spa',
    isFeatured: true,
  },
  {
    slug: 'laser',
    nameVi: 'Laser thẩm mỹ',
    nameEn: 'Aesthetic laser',
    descriptionVi: 'Hỗ trợ nám, sẹo, lỗ chân lông và các vấn đề sắc tố dưới sự theo dõi của bác sĩ.',
    descriptionEn: 'Helps with melasma, scars, pores and pigmentation under a doctor’s supervision.',
    icon: 'wb_iridescent',
    isFeatured: true,
  },
  {
    slug: 'body',
    nameVi: 'Chăm sóc body',
    nameEn: 'Body care',
    descriptionVi: 'Liệu trình thư giãn kết hợp chăm sóc chuyên sâu cho cơ thể sau ngày dài.',
    descriptionEn: 'Relaxing rituals combined with in-depth body care after a long day.',
    icon: 'self_improvement',
    isFeatured: true,
  },
  {
    slug: 'consult',
    nameVi: 'Tư vấn liệu trình',
    nameEn: 'Treatment consultation',
    descriptionVi: 'Lộ trình cá nhân hóa theo mục tiêu sắc đẹp, ngân sách và lịch sinh hoạt.',
    descriptionEn: 'A personalized plan built around your beauty goals, budget and daily schedule.',
    icon: 'favorite',
    isFeatured: true,
  },
  {
    slug: 'combo',
    nameVi: 'Gói Combo',
    nameEn: 'Combo Packages',
    image: '/images/p1.png',
    imageAlt: 'Gói chăm sóc combo tại Dr Tina Beauty',
    isFeatured: false,
    services: [
      {
        slug: 'perfectly-polished',
        name: 'Perfectly Polished',
        price: 390000,
        shortVi: 'Làm móng tay sắc (Mani hoặc Pedi) kèm dưỡng da tay chuyên sâu',
        shortEn: 'Manicure or pedicure with intensive hand care',
        descriptionVi:
          'Cắt da, tạo form và sơn màu cho tay hoặc chân, kết thúc bằng mặt nạ dưỡng ẩm và massage tay 10 phút giúp da mềm mịn.',
        descriptionEn:
          'Cuticle care, shaping and polish for hands or feet, finished with a hydrating mask and a 10-minute hand massage for soft skin.',
      },
      {
        slug: 'glow-relax',
        name: 'Glow & Relax',
        price: 590000,
        shortVi: 'Chăm sóc da mặt cơ bản kết hợp massage cổ vai gáy',
        shortEn: 'Basic facial combined with a neck and shoulder massage',
        descriptionVi:
          'Làm sạch sâu, tẩy tế bào chết dịu nhẹ, đắp mặt nạ cấp ẩm và massage cổ vai gáy 20 phút giải tỏa căng thẳng.',
        descriptionEn:
          'Deep cleansing, gentle exfoliation, a hydrating mask and a 20-minute neck and shoulder massage to release tension.',
      },
      {
        slug: 'hand-foot-ritual',
        name: 'Hand & Foot Ritual',
        price: 650000,
        shortVi: 'Combo Mani + Pedi sơn gel, ngâm thảo mộc thư giãn',
        shortEn: 'Gel mani + pedi combo with a relaxing herbal soak',
        descriptionVi:
          'Ngâm chân thảo mộc ấm, chăm sóc móng tay và móng chân, sơn gel bền màu 3–4 tuần cùng dưỡng da gót chân.',
        descriptionEn:
          'Warm herbal foot soak, hand and toenail care, long-lasting gel polish for 3–4 weeks plus heel care.',
      },
      {
        slug: 'bridal-beauty-day',
        name: 'Bridal Beauty Day',
        price: 1290000,
        shortVi: 'Gói làm đẹp trọn ngày cho cô dâu trước lễ cưới',
        shortEn: 'A full beauty day for brides before the wedding',
        descriptionVi:
          'Chăm sóc da mặt phục hồi, làm móng đính đá nhẹ, massage body thư giãn và tư vấn chăm sóc da trước ngày trọng đại.',
        descriptionEn:
          'Restorative facial, nails with light crystal accents, a relaxing body massage and skin care advice before the big day.',
      },
    ],
  },
  {
    slug: 'manicure',
    nameVi: 'Manicure',
    nameEn: 'Manicure',
    image: '/images/p4.png',
    imageAlt: 'Dịch vụ chăm sóc móng tay Dr Tina Beauty',
    isFeatured: false,
    services: [
      {
        slug: 'classic-manicure',
        name: 'Classic Manicure',
        price: 190000,
        shortVi: 'Làm mới màu sắc (Mani hoặc Pedi), cắt da và tạo form móng',
        shortEn: 'Fresh color (mani or pedi), cuticle care and nail shaping',
        descriptionVi: 'Ngâm tay, cắt da, tạo form và sơn thường theo bảng màu theo mùa của Dr Tina Beauty.',
        descriptionEn: 'Hand soak, cuticle care, shaping and regular polish from the Dr Tina Beauty seasonal palette.',
      },
      {
        slug: 'gel-polish',
        name: 'Gel Polish',
        price: 290000,
        shortVi: 'Sơn gel bền màu, bóng đẹp đến 4 tuần',
        shortEn: 'Long-lasting, glossy gel polish for up to 4 weeks',
        descriptionVi: 'Sơn gel cao cấp không mùi, hơ đèn LED nhanh khô, giữ màu bóng đẹp từ 3 đến 4 tuần.',
        descriptionEn: 'Premium odorless gel polish, quick LED curing, keeping a glossy finish for 3 to 4 weeks.',
      },
      {
        slug: 'french-tip',
        name: 'French Tip',
        price: 350000,
        shortVi: 'Đầu móng Pháp thanh lịch, tùy chọn viền nhũ vàng',
        shortEn: 'Elegant French tips with an optional gold shimmer line',
        descriptionVi: 'Tạo đầu móng trắng hoặc nude kiểu Pháp, có thể thêm viền nhũ vàng mảnh cho dịp đặc biệt.',
        descriptionEn: 'White or nude French tips, with an optional fine gold shimmer line for special occasions.',
      },
      {
        slug: 'nail-art',
        name: 'Nail Art',
        price: 420000,
        shortVi: 'Vẽ móng nghệ thuật theo mẫu hoặc theo ý tưởng riêng',
        shortEn: 'Artistic nail designs from our samples or your own ideas',
        descriptionVi: 'Kỹ thuật viên vẽ tay họa tiết hoa, ombre hoặc đính đá nhẹ theo mẫu có sẵn hoặc ý tưởng của bạn.',
        descriptionEn: 'Hand-painted florals, ombre or light crystals, based on our designs or your own ideas.',
      },
      {
        slug: 'nail-repair',
        name: 'Nail Repair',
        price: 250000,
        shortVi: 'Phục hồi móng yếu, gãy hoặc sau khi tháo gel',
        shortEn: 'Restores weak, broken nails or nails after gel removal',
        descriptionVi: 'Đắp lớp phục hồi keratin, dưỡng dầu biểu bì và hướng dẫn chăm sóc móng tại nhà.',
        descriptionEn: 'A keratin repair layer, cuticle oil treatment and at-home nail care guidance.',
      },
      {
        slug: 'paraffin-hand-care',
        name: 'Paraffin Hand Care',
        price: 220000,
        shortVi: 'Ủ sáp paraffin ấm giúp da tay mềm mịn tức thì',
        shortEn: 'Warm paraffin wax for instantly soft hands',
        descriptionVi: 'Tẩy tế bào chết tay, ủ sáp paraffin ấm 15 phút và thoa kem dưỡng giúp da tay mềm, sáng hơn.',
        descriptionEn: 'Hand exfoliation, a 15-minute warm paraffin wrap and moisturizer for softer, brighter hands.',
      },
    ],
  },
  {
    slug: 'pedicure',
    nameVi: 'Pedicure',
    nameEn: 'Pedicure',
    image: '/images/p2.png',
    imageAlt: 'Dịch vụ chăm sóc móng chân Dr Tina Beauty',
    isFeatured: false,
    services: [
      {
        slug: 'spa-pedicure',
        name: 'Spa Pedicure',
        price: 250000,
        shortVi: 'Ngâm chân thảo mộc, chà gót và sơn màu',
        shortEn: 'Herbal foot soak, heel scrub and polish',
        descriptionVi: 'Ngâm chân nước ấm thảo mộc, chà gót, cắt da và sơn màu, kết thúc với massage bàn chân 10 phút.',
        descriptionEn: 'Warm herbal foot soak, heel scrub, cuticle care and polish, finished with a 10-minute foot massage.',
      },
      {
        slug: 'gel-pedicure',
        name: 'Gel Pedicure',
        price: 350000,
        shortVi: 'Chăm sóc móng chân và sơn gel giữ màu lâu',
        shortEn: 'Toenail care with long-lasting gel polish',
        descriptionVi: 'Quy trình Spa Pedicure kết hợp sơn gel bền màu, phù hợp cho chuyến đi biển hoặc kỳ nghỉ.',
        descriptionEn: 'The Spa Pedicure routine with durable gel polish, perfect for beach trips or holidays.',
      },
      {
        slug: 'callus-treatment',
        name: 'Callus Treatment',
        price: 280000,
        shortVi: 'Làm mềm và loại bỏ vết chai gót chân',
        shortEn: 'Softens and removes heel calluses',
        descriptionVi: 'Ủ mềm vùng da chai bằng dung dịch chuyên dụng, mài nhẹ an toàn và dưỡng ẩm sâu cho gót chân.',
        descriptionEn: 'Calluses are softened with a professional solution, gently buffed and deeply moisturized.',
      },
      {
        slug: 'detox-foot-ritual',
        name: 'Detox Foot Ritual',
        price: 390000,
        shortVi: 'Ngâm muối khoáng, đắp bùn và massage bấm huyệt',
        shortEn: 'Mineral salt soak, mud wrap and acupressure massage',
        descriptionVi:
          'Ngâm muối khoáng, đắp bùn khoáng thải độc và massage bấm huyệt bàn chân giúp ngủ ngon, giảm mỏi chân.',
        descriptionEn:
          'Mineral salt soak, detoxifying mineral mud and acupressure foot massage for better sleep and less tired feet.',
      },
    ],
  },
];

/** Inserts missing categories/services by slug; existing rows (possibly edited by admins) are left untouched. */
export async function seedServiceCatalog(prisma: PrismaClient): Promise<void> {
  let createdCategories = 0;
  let createdServices = 0;

  for (const [categoryIndex, item] of categories.entries()) {
    let category = await prisma.serviceCategory.findUnique({ where: { slug: item.slug } });
    if (!category) {
      category = await prisma.serviceCategory.create({
        data: {
          nameVietnamese: item.nameVi,
          nameEnglish: item.nameEn,
          slug: item.slug,
          descriptionVietnamese: item.descriptionVi,
          descriptionEnglish: item.descriptionEn,
          icon: item.icon,
          image: item.image,
          imageAlt: item.imageAlt,
          isFeatured: item.isFeatured,
          sortOrder: categoryIndex + 1,
        },
      });
      createdCategories += 1;
    }

    for (const [serviceIndex, service] of (item.services ?? []).entries()) {
      const existing = await prisma.service.findUnique({ where: { slug: service.slug } });
      if (existing) continue;
      await prisma.service.create({
        data: {
          nameVietnamese: service.name,
          nameEnglish: service.name,
          serviceCategoryAID: category.serviceCategoryAID,
          slug: service.slug,
          shortDescriptionVietnamese: service.shortVi,
          shortDescriptionEnglish: service.shortEn,
          descriptionVietnamese: service.descriptionVi,
          descriptionEnglish: service.descriptionEn,
          price: service.price,
          sortOrder: serviceIndex + 1,
        },
      });
      createdServices += 1;
    }
  }

  console.log(
    `Seeded service catalog: ${createdCategories} categories, ${createdServices} services created`,
  );
}
