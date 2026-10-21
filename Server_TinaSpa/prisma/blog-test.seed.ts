import { PrismaClient } from '@prisma/client';

// 3 test blog categories + 10 test posts. Slugs start with `test-` and note = TEST_SEED so they can be removed with:
//   npx tsx prisma/blog-test.seed.ts --clean
const TEST_NOTE = 'TEST_SEED';

const categories = [
  {
    slug: 'test-cham-soc-da',
    nameVietnamese: 'Chăm sóc da',
    nameEnglish: 'Skincare',
    nameCambodia: 'ការថែរក្សាស្បែក',
    description: 'Kiến thức chăm sóc da hằng ngày và sau liệu trình.',
  },
  {
    slug: 'test-lieu-trinh-spa',
    nameVietnamese: 'Liệu trình spa',
    nameEnglish: 'Spa treatments',
    nameCambodia: 'ការព្យាបាលស្ប៉ា',
    description: 'Giới thiệu các liệu trình tại Tina Spa và những điều cần biết.',
  },
  {
    slug: 'test-song-khoe-dep',
    nameVietnamese: 'Sống khỏe đẹp',
    nameEnglish: 'Wellness',
    nameCambodia: 'សុខភាព និងសម្រស់',
    description: 'Thói quen ăn uống, ngủ nghỉ và thư giãn cho làn da khỏe từ bên trong.',
  },
];

interface PostSeed {
  slug: string;
  category: string;
  nameVietnamese: string;
  nameEnglish: string;
  summary: string;
  sections: [string, string][];
  thumbnailURL: string;
  status: 'PUBLISHED' | 'DRAFT' | 'HIDDEN';
  isFeatured: boolean;
  daysAgo: number;
  viewCount: number;
}

const posts: PostSeed[] = [
  {
    slug: 'test-5-buoc-skincare-buoi-sang',
    category: 'test-cham-soc-da',
    nameVietnamese: '5 bước skincare buổi sáng cho da sáng khỏe',
    nameEnglish: '5 morning skincare steps for healthy, glowing skin',
    summary: 'Chu trình buổi sáng đơn giản nhưng đủ để bảo vệ và nuôi dưỡng da suốt cả ngày.',
    sections: [
      ['Làm sạch dịu nhẹ', 'Buổi sáng chỉ cần sữa rửa mặt dịu nhẹ hoặc nước sạch nếu da khô, tránh làm mất lớp dầu tự nhiên.'],
      ['Toner cân bằng', 'Toner giúp cân bằng độ pH và chuẩn bị cho các bước dưỡng tiếp theo thấm tốt hơn.'],
      ['Serum Vitamin C', 'Vitamin C chống oxy hóa, làm sáng da và tăng hiệu quả của kem chống nắng.'],
      ['Kem dưỡng ẩm', 'Chọn kết cấu mỏng nhẹ vào ban ngày để không gây bí da dưới lớp trang điểm.'],
      ['Kem chống nắng', 'Bước quan trọng nhất: thoa đủ lượng và thoa lại sau mỗi 2–3 giờ khi ở ngoài trời.'],
    ],
    thumbnailURL: '/images/p4.png',
    status: 'PUBLISHED',
    isFeatured: true,
    daysAgo: 2,
    viewCount: 1240,
  },
  {
    slug: 'test-cham-soc-da-sau-laser',
    category: 'test-cham-soc-da',
    nameVietnamese: 'Chăm sóc da sau laser: những điều cần nhớ',
    nameEnglish: 'Post-laser skincare: what to remember',
    summary: 'Da sau laser cần được làm dịu, cấp ẩm và chống nắng kỹ để phục hồi nhanh và tránh thâm.',
    sections: [
      ['48 giờ đầu', 'Không dùng sản phẩm chứa acid, retinol hoặc cồn. Ưu tiên kem phục hồi chứa ceramide, panthenol.'],
      ['Tránh nắng tuyệt đối', 'Dùng kem chống nắng vật lý và che chắn kỹ khi ra ngoài trong ít nhất 2 tuần.'],
      ['Tái khám đúng hẹn', 'Chuyên viên sẽ đánh giá mức độ phục hồi và điều chỉnh liệu trình phù hợp.'],
    ],
    thumbnailURL: '/images/p6.png',
    status: 'PUBLISHED',
    isFeatured: false,
    daysAgo: 6,
    viewCount: 860,
  },
  {
    slug: 'test-retinol-cho-nguoi-moi-bat-dau',
    category: 'test-cham-soc-da',
    nameVietnamese: 'Retinol cho người mới bắt đầu',
    nameEnglish: 'Retinol for beginners',
    summary: 'Cách làm quen với retinol để có hiệu quả chống lão hóa mà không bị bong tróc, kích ứng.',
    sections: [
      ['Bắt đầu nồng độ thấp', 'Chọn retinol 0.1–0.3% và dùng 2–3 tối mỗi tuần trong tháng đầu tiên.'],
      ['Phương pháp sandwich', 'Thoa kem dưỡng trước và sau retinol để giảm kích ứng cho da nhạy cảm.'],
      ['Không quên chống nắng', 'Retinol khiến da nhạy cảm hơn với ánh nắng, vì vậy kem chống nắng là bắt buộc.'],
    ],
    thumbnailURL: '/images/p1.png',
    status: 'PUBLISHED',
    isFeatured: false,
    daysAgo: 12,
    viewCount: 532,
  },
  {
    slug: 'test-phan-biet-chong-nang-vat-ly-hoa-hoc',
    category: 'test-cham-soc-da',
    nameVietnamese: 'Phân biệt kem chống nắng vật lý và hóa học',
    nameEnglish: 'Mineral vs chemical sunscreen',
    summary: 'Ưu nhược điểm của từng loại và cách chọn kem chống nắng phù hợp với làn da của bạn.',
    sections: [
      ['Chống nắng vật lý', 'Dùng zinc oxide, titanium dioxide phản xạ tia UV, dịu nhẹ cho da nhạy cảm nhưng dễ để lại vệt trắng.'],
      ['Chống nắng hóa học', 'Hấp thụ tia UV và chuyển hóa thành nhiệt, kết cấu mỏng nhẹ, dễ tán.'],
    ],
    thumbnailURL: '/images/p2.png',
    status: 'DRAFT',
    isFeatured: false,
    daysAgo: 1,
    viewCount: 0,
  },
  {
    slug: 'test-lieu-trinh-cham-soc-da-chuyen-sau',
    category: 'test-lieu-trinh-spa',
    nameVietnamese: 'Liệu trình chăm sóc da chuyên sâu tại Tina Spa',
    nameEnglish: 'Deep facial treatment at Tina Spa',
    summary: '90 phút làm sạch sâu, tẩy tế bào chết, điện di dưỡng chất và đắp mặt nạ phục hồi.',
    sections: [
      ['Soi da và tư vấn', 'Chuyên viên soi da bằng máy để xác định tình trạng và chọn sản phẩm phù hợp.'],
      ['Làm sạch và tẩy da chết', 'Loại bỏ bụi bẩn, bã nhờn và tế bào chết giúp da thông thoáng.'],
      ['Điện di và mặt nạ', 'Đưa dưỡng chất vào sâu trong da, kết thúc bằng mặt nạ làm dịu và cấp ẩm.'],
    ],
    thumbnailURL: '/images/ServiceBackground.png',
    status: 'PUBLISHED',
    isFeatured: true,
    daysAgo: 4,
    viewCount: 980,
  },
  {
    slug: 'test-tri-mun-chuan-y-khoa',
    category: 'test-lieu-trinh-spa',
    nameVietnamese: 'Trị mụn chuẩn y khoa: quy trình 6 bước',
    nameEnglish: 'Medical-grade acne treatment in 6 steps',
    summary: 'Quy trình lấy nhân mụn vô khuẩn, kháng viêm và phục hồi giúp hạn chế thâm và sẹo.',
    sections: [
      ['Vô khuẩn dụng cụ', 'Toàn bộ dụng cụ được tiệt trùng và dùng riêng cho từng khách.'],
      ['Lấy nhân mụn đúng cách', 'Chỉ lấy mụn đã chín, tránh tổn thương mô xung quanh.'],
      ['Kháng viêm và phục hồi', 'Chiếu ánh sáng sinh học và đắp mặt nạ làm dịu để da nhanh lành.'],
    ],
    thumbnailURL: '/images/p5.png',
    status: 'PUBLISHED',
    isFeatured: false,
    daysAgo: 9,
    viewCount: 715,
  },
  {
    slug: 'test-massage-body-da-nong',
    category: 'test-lieu-trinh-spa',
    nameVietnamese: 'Massage body đá nóng: thư giãn sâu sau tuần làm việc',
    nameEnglish: 'Hot stone body massage: deep relaxation',
    summary: 'Đá bazan làm ấm giúp giãn cơ, lưu thông máu và giảm căng thẳng hiệu quả.',
    sections: [
      ['Lợi ích', 'Giảm đau mỏi vai gáy, cải thiện giấc ngủ và giúp tinh thần thư thái.'],
      ['Ai không nên dùng', 'Phụ nữ mang thai, người có bệnh tim mạch hoặc huyết áp cao nên hỏi ý kiến bác sĩ.'],
    ],
    thumbnailURL: '/images/background.png',
    status: 'HIDDEN',
    isFeatured: false,
    daysAgo: 20,
    viewCount: 210,
  },
  {
    slug: 'test-6-thuc-pham-cho-lan-da-khoe',
    category: 'test-song-khoe-dep',
    nameVietnamese: '6 thực phẩm giúp làn da khỏe từ bên trong',
    nameEnglish: '6 foods for healthy skin from within',
    summary: 'Bổ sung những thực phẩm giàu chất chống oxy hóa và omega-3 để da căng mịn tự nhiên.',
    sections: [
      ['Cá hồi', 'Giàu omega-3 giúp giữ ẩm và giảm viêm cho da.'],
      ['Bơ', 'Chứa chất béo tốt và vitamin E bảo vệ da khỏi oxy hóa.'],
      ['Cà chua, cam, trà xanh, hạt óc chó', 'Cung cấp lycopene, vitamin C, polyphenol và kẽm cho làn da khỏe mạnh.'],
    ],
    thumbnailURL: '/images/p3.png',
    status: 'PUBLISHED',
    isFeatured: false,
    daysAgo: 15,
    viewCount: 448,
  },
  {
    slug: 'test-giac-ngu-va-lan-da',
    category: 'test-song-khoe-dep',
    nameVietnamese: 'Giấc ngủ ảnh hưởng đến làn da như thế nào?',
    nameEnglish: 'How sleep affects your skin',
    summary: 'Thiếu ngủ khiến da xỉn màu, bọng mắt và lão hóa nhanh hơn. Đây là cách cải thiện.',
    sections: [
      ['Da tái tạo về đêm', 'Từ 22h đến 2h là thời điểm da tái tạo mạnh nhất, nên ngủ trước 23h.'],
      ['Thói quen trước khi ngủ', 'Hạn chế điện thoại, giữ phòng tối và mát, thay vỏ gối thường xuyên.'],
    ],
    thumbnailURL: '/images/screen.png',
    status: 'PUBLISHED',
    isFeatured: false,
    daysAgo: 25,
    viewCount: 302,
  },
  {
    slug: 'test-thu-gian-cuoi-tuan-tai-nha',
    category: 'test-song-khoe-dep',
    nameVietnamese: 'Gợi ý thư giãn cuối tuần tại nhà',
    nameEnglish: 'Weekend self-care ideas at home',
    summary: 'Đắp mặt nạ, xông hơi thảo dược và yoga nhẹ nhàng để nạp lại năng lượng.',
    sections: [
      ['Xông hơi thảo dược', 'Sả, gừng, lá bưởi giúp thông thoáng lỗ chân lông và thư giãn tinh thần.'],
      ['Yoga 15 phút', 'Vài tư thế giãn cơ đơn giản giúp giảm căng thẳng sau một tuần làm việc.'],
    ],
    thumbnailURL: '/images/p2.png',
    status: 'DRAFT',
    isFeatured: false,
    daysAgo: 0,
    viewCount: 0,
  },
];

const toHtml = (post: PostSeed) =>
  [`<p>${post.summary}</p>`, ...post.sections.map(([title, body]) => `<h2>${title}</h2><p>${body}</p>`)].join('');

const prisma = new PrismaClient();

async function clean() {
  const blogs = await prisma.blog.deleteMany({ where: { note: TEST_NOTE } });
  const cats = await prisma.blogCategory.deleteMany({ where: { note: TEST_NOTE, blogs: { none: {} } } });
  console.log(`Removed ${blogs.count} test posts, ${cats.count} test categories`);
}

async function seed() {
  const author = await prisma.user.findFirst({
    where: { role: { in: ['MANAGER', 'STAFF', 'ADMIN'] } },
    orderBy: { role: 'asc' },
  });
  const maxOrder = await prisma.blogCategory.aggregate({ _max: { displayOrder: true } });

  const categoryAIDs = new Map<string, string>();
  for (const [index, category] of categories.entries()) {
    const row = await prisma.blogCategory.upsert({
      where: { slug: category.slug },
      update: {},
      create: { ...category, displayOrder: (maxOrder._max.displayOrder ?? 0) + index + 1, note: TEST_NOTE },
    });
    categoryAIDs.set(category.slug, row.blogCategoryAID);
  }

  let created = 0;
  for (const post of posts) {
    if (await prisma.blog.findUnique({ where: { slug: post.slug } })) continue;
    const date = new Date(Date.now() - post.daysAgo * 24 * 60 * 60 * 1000);
    await prisma.blog.create({
      data: {
        slug: post.slug,
        nameVietnamese: post.nameVietnamese,
        nameEnglish: post.nameEnglish,
        blogCategoryAID: categoryAIDs.get(post.category)!,
        summary: post.summary,
        content: toHtml(post),
        thumbnailURL: post.thumbnailURL,
        authorAID: author?.userAID ?? null,
        createdByAID: author?.userAID ?? null,
        status: post.status,
        publishedAt: post.status === 'DRAFT' ? null : date,
        isFeatured: post.isFeatured,
        viewCount: post.viewCount,
        metaTitle: post.nameVietnamese,
        metaDescription: post.summary,
        createdAt: date,
        note: TEST_NOTE,
      },
    });
    created += 1;
  }
  console.log(`Seeded test blog: ${categories.length} categories, ${created} new posts, ${posts.length - created} existing`);
}

try {
  if (process.argv.includes('--clean')) await clean();
  else await seed();
} finally {
  await prisma.$disconnect();
}
