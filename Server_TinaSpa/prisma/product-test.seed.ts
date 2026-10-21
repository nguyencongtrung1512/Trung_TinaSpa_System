import { PrismaClient } from '@prisma/client';

// 10 test products for the portal / storefront. Slugs start with `test-` and note = TEST_SEED so they can be removed with:
//   npx tsx prisma/product-test.seed.ts --clean
const TEST_NOTE = 'TEST_SEED';

interface VariantSeed {
  nameVietnamese: string;
  nameEnglish: string;
  nameCambodia: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
}

interface TestProductSeed {
  slug: string;
  category: string;
  nameVietnamese: string;
  nameEnglish: string;
  nameCambodia: string;
  subtitleVietnamese: string;
  subtitleEnglish: string;
  descriptionVietnamese: string;
  descriptionEnglish: string;
  image: string;
  badge: string | null;
  status: string;
  variants: VariantSeed[];
  highlights: [string, string][];
  usageVietnamese: string;
  usageEnglish: string;
}

const size = (code: string, ml: number, price: number, compareAtPrice: number | null = null): VariantSeed => ({
  nameVietnamese: `${ml}ml`,
  nameEnglish: `${ml}ml`,
  nameCambodia: `${ml}ml`,
  sku: `${code}-${ml}`,
  price,
  compareAtPrice,
});

const products: TestProductSeed[] = [
  {
    slug: 'test-vitamin-c-brightening-serum',
    category: 'serum',
    nameVietnamese: 'Serum Vitamin C Sáng Da',
    nameEnglish: 'Vitamin C Brightening Serum',
    nameCambodia: 'សេរ៉ូមវីតាមីន C ធ្វើឲ្យស្បែកភ្លឺ',
    subtitleVietnamese: '15% Vitamin C nguyên chất & Ferulic Acid',
    subtitleEnglish: '15% pure Vitamin C & Ferulic Acid',
    descriptionVietnamese: 'Tinh chất Vitamin C nồng độ 15% giúp làm mờ thâm, sáng da và chống oxy hóa mỗi sáng.',
    descriptionEnglish: 'A 15% Vitamin C serum that fades dark spots, brightens and protects against oxidation every morning.',
    image: '/images/p4.png',
    badge: 'Mới',
    status: 'ACTIVE',
    variants: [size('VC', 15, 450000), size('VC', 30, 790000, 890000)],
    highlights: [
      ['Làm mờ vết thâm sau mụn', 'Fades post-acne marks'],
      ['Chống oxy hóa, bảo vệ da ban ngày', 'Antioxidant daytime protection'],
    ],
    usageVietnamese: 'Dùng 3–4 giọt mỗi sáng sau toner, trước kem chống nắng.',
    usageEnglish: 'Apply 3–4 drops every morning after toner, before sunscreen.',
  },
  {
    slug: 'test-hyaluronic-hydra-serum',
    category: 'serum',
    nameVietnamese: 'Serum Cấp Ẩm Hyaluronic',
    nameEnglish: 'Hyaluronic Hydra Serum',
    nameCambodia: 'សេរ៉ូមផ្តល់សំណើម Hyaluronic',
    subtitleVietnamese: '5 loại Hyaluronic Acid đa phân tử',
    subtitleEnglish: '5 multi-weight Hyaluronic Acids',
    descriptionVietnamese: 'Cấp ẩm sâu nhiều tầng, giúp da căng mọng và giảm khô ráp tức thì.',
    descriptionEnglish: 'Multi-layer deep hydration for plump skin and instant relief from dryness.',
    image: '/images/p5.png',
    badge: 'Bán chạy',
    status: 'ACTIVE',
    variants: [size('HA', 30, 620000), size('HA', 50, 950000, 1100000)],
    highlights: [
      ['Cấp ẩm tức thì và kéo dài 72h', 'Instant hydration lasting 72h'],
      ['Phù hợp mọi loại da, kể cả da nhạy cảm', 'Suits all skin types, including sensitive'],
    ],
    usageVietnamese: 'Thoa lên da còn ẩm sáng và tối, sau đó khóa ẩm bằng kem dưỡng.',
    usageEnglish: 'Apply to damp skin morning and night, then seal with moisturizer.',
  },
  {
    slug: 'test-ceramide-barrier-cream',
    category: 'cream',
    nameVietnamese: 'Kem Phục Hồi Ceramide',
    nameEnglish: 'Ceramide Barrier Cream',
    nameCambodia: 'ក្រែមស្តារស្បែក Ceramide',
    subtitleVietnamese: 'Ceramide NP, Panthenol & Rau má',
    subtitleEnglish: 'Ceramide NP, Panthenol & Centella',
    descriptionVietnamese: 'Kem dưỡng phục hồi hàng rào bảo vệ da, làm dịu đỏ rát sau liệu trình.',
    descriptionEnglish: 'Restores the skin barrier and calms redness after treatments.',
    image: '/images/p6.png',
    badge: null,
    status: 'ACTIVE',
    variants: [size('CER', 50, 680000)],
    highlights: [
      ['Phục hồi da sau laser, peel', 'Recovery after laser and peels'],
      ['Không hương liệu, không cồn', 'Fragrance-free, alcohol-free'],
    ],
    usageVietnamese: 'Thoa lớp mỏng buổi tối là bước cuối cùng của chu trình dưỡng da.',
    usageEnglish: 'Apply a thin layer in the evening as the last skincare step.',
  },
  {
    slug: 'test-retinol-night-cream',
    category: 'cream',
    nameVietnamese: 'Kem Đêm Retinol Tái Tạo',
    nameEnglish: 'Retinol Renewal Night Cream',
    nameCambodia: 'ក្រែមពេលយប់ Retinol',
    subtitleVietnamese: 'Retinol 0.3% bao nang & Squalane',
    subtitleEnglish: 'Encapsulated 0.3% Retinol & Squalane',
    descriptionVietnamese: 'Tái tạo da ban đêm, giảm nếp nhăn và cải thiện kết cấu da mà ít kích ứng.',
    descriptionEnglish: 'Overnight renewal that softens wrinkles and refines texture with minimal irritation.',
    image: '/images/p1.png',
    badge: 'Giảm 20%',
    status: 'ACTIVE',
    variants: [size('RET', 30, 720000, 900000), size('RET', 50, 1050000, 1300000)],
    highlights: [
      ['Giảm nếp nhăn sau 8 tuần', 'Visibly fewer wrinkles in 8 weeks'],
      ['Retinol bao nang giải phóng chậm', 'Slow-release encapsulated retinol'],
    ],
    usageVietnamese: 'Dùng buổi tối 2–3 lần/tuần, tăng dần tần suất. Ban ngày bắt buộc dùng kem chống nắng.',
    usageEnglish: 'Use 2–3 nights a week, increasing gradually. Always wear sunscreen during the day.',
  },
  {
    slug: 'test-daily-uv-shield-spf50',
    category: 'sunscreen',
    nameVietnamese: 'Kem Chống Nắng UV Shield SPF50+',
    nameEnglish: 'Daily UV Shield SPF50+',
    nameCambodia: 'ក្រែមការពារពន្លឺថ្ងៃ SPF50+',
    subtitleVietnamese: 'PA++++, kết cấu mỏng nhẹ không vệt trắng',
    subtitleEnglish: 'PA++++, weightless with no white cast',
    descriptionVietnamese: 'Chống nắng phổ rộng, kiềm dầu nhẹ, phù hợp dùng hằng ngày dưới lớp trang điểm.',
    descriptionEnglish: 'Broad-spectrum protection with light oil control, perfect daily under makeup.',
    image: '/images/p2.png',
    badge: 'Bán chạy',
    status: 'ACTIVE',
    variants: [size('UVS', 50, 420000)],
    highlights: [
      ['Không để lại vệt trắng', 'No white cast'],
      ['Chống nước, chống mồ hôi', 'Water and sweat resistant'],
    ],
    usageVietnamese: 'Thoa đủ lượng 15 phút trước khi ra nắng, thoa lại sau mỗi 2–3 giờ.',
    usageEnglish: 'Apply generously 15 minutes before sun exposure and reapply every 2–3 hours.',
  },
  {
    slug: 'test-tinted-mineral-sunscreen',
    category: 'sunscreen',
    nameVietnamese: 'Kem Chống Nắng Vật Lý Có Màu',
    nameEnglish: 'Tinted Mineral Sunscreen',
    nameCambodia: 'ក្រែមការពារពន្លឺថ្ងៃមានពណ៌',
    subtitleVietnamese: 'Zinc Oxide 20%, nâng tông tự nhiên',
    subtitleEnglish: '20% Zinc Oxide, natural tone-up',
    descriptionVietnamese: 'Chống nắng vật lý dịu nhẹ cho da nhạy cảm và da sau liệu trình, có màu che khuyết điểm nhẹ.',
    descriptionEnglish: 'Gentle mineral protection for sensitive and post-treatment skin with a light tint.',
    image: '/images/p3.png',
    badge: null,
    status: 'ACTIVE',
    variants: [
      { nameVietnamese: 'Tông sáng', nameEnglish: 'Light', nameCambodia: 'ពណ៌ភ្លឺ', sku: 'TMS-LIGHT', price: 490000, compareAtPrice: null },
      { nameVietnamese: 'Tông tự nhiên', nameEnglish: 'Natural', nameCambodia: 'ពណ៌ធម្មជាតិ', sku: 'TMS-NATURAL', price: 490000, compareAtPrice: null },
    ],
    highlights: [
      ['An toàn cho da sau laser', 'Safe after laser treatments'],
      ['Che khuyết điểm nhẹ', 'Light coverage'],
    ],
    usageVietnamese: 'Thoa đều lên mặt ở bước cuối buổi sáng, có thể thay kem nền.',
    usageEnglish: 'Apply evenly as the last morning step; can replace foundation.',
  },
  {
    slug: 'test-hydrogel-collagen-mask',
    category: 'mask',
    nameVietnamese: 'Mặt Nạ Thạch Collagen',
    nameEnglish: 'Hydrogel Collagen Mask',
    nameCambodia: 'ម៉ាស់ Collagen',
    subtitleVietnamese: 'Collagen thủy phân & Niacinamide',
    subtitleEnglish: 'Hydrolyzed Collagen & Niacinamide',
    descriptionVietnamese: 'Mặt nạ thạch bám sát da, làm mát và cấp ẩm tức thì, giúp da căng bóng.',
    descriptionEnglish: 'A cooling hydrogel mask that clings to skin for instant hydration and glow.',
    image: '/images/p1.png',
    badge: 'Combo',
    status: 'ACTIVE',
    variants: [
      { nameVietnamese: '1 miếng', nameEnglish: '1 sheet', nameCambodia: '១ សន្លឹក', sku: 'HCM-1', price: 65000, compareAtPrice: null },
      { nameVietnamese: 'Hộp 5 miếng', nameEnglish: 'Box of 5', nameCambodia: 'ប្រអប់ ៥ សន្លឹក', sku: 'HCM-5', price: 290000, compareAtPrice: 325000 },
      { nameVietnamese: 'Hộp 10 miếng', nameEnglish: 'Box of 10', nameCambodia: 'ប្រអប់ ១០ សន្លឹក', sku: 'HCM-10', price: 550000, compareAtPrice: 650000 },
    ],
    highlights: [
      ['Làm mát và dịu da tức thì', 'Instantly cools and soothes'],
      ['Không trượt, bám sát da', 'Stays in place, no slipping'],
    ],
    usageVietnamese: 'Đắp 20–30 phút sau bước toner, vỗ nhẹ phần tinh chất còn lại. Dùng 2–3 lần/tuần.',
    usageEnglish: 'Apply for 20–30 minutes after toner, then pat in the remaining essence. Use 2–3 times a week.',
  },
  {
    slug: 'test-green-tea-clay-mask',
    category: 'mask',
    nameVietnamese: 'Mặt Nạ Đất Sét Trà Xanh',
    nameEnglish: 'Green Tea Clay Mask',
    nameCambodia: 'ម៉ាស់ដីឥដ្ឋតែបៃតង',
    subtitleVietnamese: 'Kaolin, Trà xanh Jeju & BHA',
    subtitleEnglish: 'Kaolin, Jeju Green Tea & BHA',
    descriptionVietnamese: 'Làm sạch sâu lỗ chân lông, hút dầu thừa và giảm mụn đầu đen.',
    descriptionEnglish: 'Deep-cleans pores, absorbs excess oil and reduces blackheads.',
    image: '/images/p5.png',
    badge: null,
    status: 'INACTIVE',
    variants: [size('GTC', 100, 380000)],
    highlights: [
      ['Se khít lỗ chân lông', 'Refines pores'],
      ['Phù hợp da dầu, da hỗn hợp', 'For oily and combination skin'],
    ],
    usageVietnamese: 'Thoa lớp vừa phải, tránh vùng mắt, rửa sạch sau 10–15 phút. Dùng 1–2 lần/tuần.',
    usageEnglish: 'Apply an even layer avoiding the eyes, rinse after 10–15 minutes. Use 1–2 times a week.',
  },
  {
    slug: 'test-caffeine-eye-gel',
    category: 'eye',
    nameVietnamese: 'Gel Mắt Caffeine Giảm Bọng',
    nameEnglish: 'Caffeine De-Puffing Eye Gel',
    nameCambodia: 'ជែលភ្នែក Caffeine',
    subtitleVietnamese: 'Caffeine 5% & đầu lăn kim loại làm mát',
    subtitleEnglish: '5% Caffeine with a cooling metal roller',
    descriptionVietnamese: 'Giảm bọng mắt và quầng thâm buổi sáng, đầu lăn làm mát giúp mắt tươi tỉnh.',
    descriptionEnglish: 'Reduces morning puffiness and dark circles; the cooling roller wakes up tired eyes.',
    image: '/images/p3.png',
    badge: 'Mới',
    status: 'ACTIVE',
    variants: [size('CEG', 15, 390000, 450000)],
    highlights: [
      ['Giảm bọng mắt sau 15 phút', 'Less puffiness in 15 minutes'],
      ['Đầu lăn kim loại làm mát', 'Cooling metal roller'],
    ],
    usageVietnamese: 'Lăn nhẹ quanh vùng mắt từ trong ra ngoài vào buổi sáng.',
    usageEnglish: 'Roll gently around the eye area from inner to outer corner in the morning.',
  },
  {
    slug: 'test-bakuchiol-eye-cream',
    category: 'eye',
    nameVietnamese: 'Kem Mắt Bakuchiol Chống Nhăn',
    nameEnglish: 'Bakuchiol Anti-Wrinkle Eye Cream',
    nameCambodia: 'ក្រែមភ្នែក Bakuchiol',
    subtitleVietnamese: 'Retinol thực vật dịu nhẹ cho vùng mắt',
    subtitleEnglish: 'Gentle plant-based retinol for the eye area',
    descriptionVietnamese: 'Làm mờ nếp nhăn vùng mắt, an toàn cho da nhạy cảm và mẹ bầu.',
    descriptionEnglish: 'Softens fine lines around the eyes, safe for sensitive skin and pregnancy.',
    image: '/images/p6.png',
    badge: null,
    status: 'INACTIVE',
    variants: [size('BEC', 20, 560000)],
    highlights: [
      ['Không kích ứng như retinol', 'No retinol-like irritation'],
      ['Dùng được cả sáng và tối', 'Use morning and night'],
    ],
    usageVietnamese: 'Lấy lượng bằng hạt gạo, vỗ nhẹ bằng ngón áp út quanh vùng mắt.',
    usageEnglish: 'Tap a rice-grain amount around the eyes with your ring finger.',
  },
];

// Same categories as product.seed.ts
const categories = [
  { slug: 'serum', nameVietnamese: 'Tinh chất & serum', nameEnglish: 'Essences & serums' },
  { slug: 'cream', nameVietnamese: 'Kem dưỡng & tái tạo', nameEnglish: 'Moisturizers & renewal' },
  { slug: 'sunscreen', nameVietnamese: 'Kem chống nắng', nameEnglish: 'Sunscreen' },
  { slug: 'mask', nameVietnamese: 'Mặt nạ phục hồi', nameEnglish: 'Recovery masks' },
  { slug: 'eye', nameVietnamese: 'Dưỡng mắt', nameEnglish: 'Eye care' },
];

const prisma = new PrismaClient();

async function clean() {
  const { count } = await prisma.product.deleteMany({ where: { note: TEST_NOTE } });
  console.log(`Removed ${count} test products`);
}

async function seed() {
  const categoryAIDs = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const row = await prisma.productCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, displayOrder: index + 1 },
    });
    categoryAIDs.set(category.slug, row.productCategoryAID);
  }

  let created = 0;
  for (const p of products) {
    const categoryAID = categoryAIDs.get(p.category)!;
    if (await prisma.product.findUnique({ where: { slug: p.slug } })) continue;

    const cheapest = p.variants.reduce((min, v) => (v.price < min.price ? v : min));
    await prisma.product.create({
      data: {
        slug: p.slug,
        nameVietnamese: p.nameVietnamese,
        nameEnglish: p.nameEnglish,
        nameCambodia: p.nameCambodia,
        subtitleVietnamese: p.subtitleVietnamese,
        subtitleEnglish: p.subtitleEnglish,
        descriptionVietnamese: p.descriptionVietnamese,
        descriptionEnglish: p.descriptionEnglish,
        productCategoryAID: categoryAID,
        price: cheapest.price,
        compareAtPrice: cheapest.compareAtPrice,
        image: p.image,
        imageAlt: p.nameVietnamese,
        badge: p.badge,
        status: p.status,
        note: TEST_NOTE,
        details: {
          create: [
            {
              detailType: 'STORY',
              nameVietnamese: 'Câu chuyện',
              nameEnglish: 'Story',
              contentVietnamese: p.descriptionVietnamese,
              contentEnglish: p.descriptionEnglish,
              sortOrder: 1,
            },
            ...p.highlights.map(([vi, en], i) => ({
              detailType: 'HIGHLIGHT',
              nameVietnamese: 'Điểm nổi bật',
              nameEnglish: 'Highlight',
              contentVietnamese: vi,
              contentEnglish: en,
              sortOrder: i + 1,
            })),
            {
              detailType: 'USAGE',
              nameVietnamese: 'Cách dùng',
              nameEnglish: 'How to use',
              contentVietnamese: p.usageVietnamese,
              contentEnglish: p.usageEnglish,
              sortOrder: 1,
            },
          ],
        },
        variants: {
          create: p.variants.map((v, i) => ({
            ...v,
            sortOrder: i,
            images: { create: [{ nameVietnamese: p.nameVietnamese, nameEnglish: p.nameEnglish, image: p.image }] },
          })),
        },
      },
    });
    created += 1;
  }
  console.log(`Seeded test products: ${created} new, ${products.length - created} existing`);
}

try {
  if (process.argv.includes('--clean')) await clean();
  else await seed();
} finally {
  await prisma.$disconnect();
}
