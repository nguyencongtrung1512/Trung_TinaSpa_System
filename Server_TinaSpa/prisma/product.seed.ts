import type { PrismaClient } from '@prisma/client';

// Mirrors Website_TinaSpa/app/data/products.ts + locale `products.items` (vi/en). nameCambodia & *Cambodia are left null (no locale yet).
interface ProductDetailSeed {
  detailType: string;
  nameVietnamese: string;
  nameEnglish: string | null;
  contentVietnamese?: string | null;
  contentEnglish?: string | null;
  icon?: string;
  image?: string;
  imageAlt?: string;
  sortOrder: number;
}

interface ProductSeed {
  slug: string;
  nameVietnamese: string;
  nameEnglish: string;
  subtitleVietnamese: string;
  subtitleEnglish: string;
  descriptionVietnamese: string;
  descriptionEnglish: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  imageAlt: string;
  badge: string;
  details: ProductDetailSeed[];
}

const products: ProductSeed[] = 
[
  {
    "slug": "luminous-elixir",
    "nameVietnamese": "Luminous Elixir",
    "nameEnglish": "Luminous Elixir",
    "subtitleVietnamese": "24K Gold & Active Botanical Serum",
    "subtitleEnglish": "24K Gold & Active Botanical Serum",
    "descriptionVietnamese": "Tinh chất vàng 24K và hoạt chất thực vật, giúp da sáng, căng và đều màu.",
    "descriptionEnglish": "A 24K gold and botanical serum for brighter, firmer and more even skin.",
    "category": "serum",
    "price": 890000,
    "compareAtPrice": 1050000,
    "image": "/images/p4.png",
    "imageAlt": "Lọ tinh chất Luminous Elixir nắp vàng của Dr Tina Beauty",
    "badge": "Bán chạy",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Tinh chất vàng 24K và hoạt chất thực vật, dùng sau liệu trình để da sáng, căng và đều màu hơn.",
        "contentEnglish": "A 24K gold and botanical serum, used after treatments for brighter, firmer and more even-toned skin.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Kết cấu mỏng, thấm nhanh, phù hợp buổi tối hoặc ngay sau toner khi da còn ẩm.",
        "contentEnglish": "Light, fast-absorbing texture, ideal in the evening or right after toner while skin is still damp.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Hạt vàng lơ lửng giúp da trông rạng hơn sau vài tuần dùng đều",
        "contentEnglish": "Suspended gold flakes make skin look more radiant after a few weeks of regular use",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Lớp serum nhẹ, không bóng nhờn, dễ chồng kem dưỡng phía trên",
        "contentEnglish": "A light, non-greasy serum that layers easily under moisturizer",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Phòng khám dùng trong routine sáng da sau laser và trẻ hóa",
        "contentEnglish": "Used by the clinic in brightening routines after laser and rejuvenation",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Sáng và đều màu",
        "nameEnglish": "Bright and even",
        "contentVietnamese": "Hỗ trợ da xỉn, thiếu sức sống trông trong hơn.",
        "contentEnglish": "Helps dull, tired skin look clearer.",
        "icon": "auto_awesome",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Cấp ẩm nhẹ",
        "nameEnglish": "Light hydration",
        "contentVietnamese": "Giữ da mềm để hoạt chất phía sau thấm đều.",
        "contentEnglish": "Keeps skin soft so the next actives absorb evenly.",
        "icon": "water_drop",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Dịu sau liệu trình",
        "nameEnglish": "Soothing after treatment",
        "contentVietnamese": "Dùng được khi da đã ổn, không châm chích.",
        "contentEnglish": "Suitable once skin has settled, with no stinging.",
        "icon": "spa",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Vàng 24K",
        "contentEnglish": "24K gold",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Niacinamide",
        "contentEnglish": "Niacinamide",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Chiết xuất thực vật",
        "contentEnglish": "Botanical extracts",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Hyaluronic acid",
        "contentEnglish": "Hyaluronic acid",
        "sortOrder": 4
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Không hương liệu gắt",
        "contentEnglish": "No harsh fragrance",
        "sortOrder": 5
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Rửa mặt, thấm toner, để da còn hơi ẩm.",
        "contentEnglish": "Cleanse, apply toner and leave skin slightly damp.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Nhỏ 3–4 giọt ra lòng bàn tay, ấn nhẹ khắp mặt và cổ.",
        "contentEnglish": "Dispense 3–4 drops into your palm and press gently over face and neck.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Khóa lại bằng kem dưỡng. Ban ngày luôn dùng kem chống nắng.",
        "contentEnglish": "Seal with moisturizer. Always use sunscreen during the day.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Tránh đưa trực tiếp vào mắt. Nếu dính mắt, rửa lại bằng nước sạch.",
        "contentEnglish": "Avoid direct contact with eyes. If it gets in the eyes, rinse with clean water.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Ngưng dùng và báo phòng khám nếu da đỏ, rát kéo dài.",
        "contentEnglish": "Stop using and contact the clinic if redness or burning persists.",
        "sortOrder": 2
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Bảo quản nơi khô, tránh nắng gắt. Đóng nắp sau mỗi lần dùng.",
        "contentEnglish": "Store in a dry place away from strong sunlight. Close the cap after each use.",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Lọ tinh chất Luminous Elixir trên đá",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p5.png",
        "imageAlt": "Chai toner cánh hoa hồng Botanica Flora",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Hũ kem Botanical Rose Renewal",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p1.png",
        "imageAlt": "Mặt nạ biocellulose Dr Tina Beauty",
        "sortOrder": 4
      }
    ]
  },
  {
    "slug": "rose-renewal-cream",
    "nameVietnamese": "Botanical Rose Renewal Cream",
    "nameEnglish": "Botanical Rose Renewal Cream",
    "subtitleVietnamese": "Kem tái tạo hoa hồng",
    "subtitleEnglish": "Rose renewal cream",
    "descriptionVietnamese": "Kem dưỡng với dầu tầm xuân và hoa hồng Bulgaria, khóa ẩm và làm dịu da.",
    "descriptionEnglish": "A moisturizer with rosehip oil and Bulgarian rose that locks in moisture and soothes skin.",
    "category": "cream",
    "price": 750000,
    "compareAtPrice": 890000,
    "image": "/images/p6.png",
    "imageAlt": "Hũ kem Botanical Rose Renewal Cream nắp vàng",
    "badge": "Mới",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Kem tái tạo với dầu tầm xuân và hoa hồng Bulgaria, khóa ẩm sau serum và làm dịu da thiếu nước.",
        "contentEnglish": "A renewal cream with rosehip oil and Bulgarian rose that seals in moisture after serum and soothes dehydrated skin.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Kết cấu kem mỏng, tán đều, hợp cả da thường và da hỗn hợp thiên khô.",
        "contentEnglish": "A light cream that spreads evenly, suitable for normal and dry-leaning combination skin.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Màng ẩm nhẹ, không bết khi dùng ban đêm",
        "contentEnglish": "A light moisture veil that is not sticky at night",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Hương hoa hồng dịu, không át mùi phòng trị liệu",
        "contentEnglish": "A soft rose scent that never overpowers the treatment room",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Nên dùng thành cặp với toner và tinh chất trong cùng routine",
        "contentEnglish": "Best paired with toner and serum in the same routine",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Khóa ẩm",
        "nameEnglish": "Locks in moisture",
        "contentVietnamese": "Giữ nước trên da sau serum và toner.",
        "contentEnglish": "Holds water in the skin after serum and toner.",
        "icon": "water_drop",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Làm dịu",
        "nameEnglish": "Soothing",
        "contentVietnamese": "Hoa hồng và tầm xuân hỗ trợ da khô, kéo căng.",
        "contentEnglish": "Rose and rosehip help dry, tight skin.",
        "icon": "spa",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Da mềm hơn",
        "nameEnglish": "Softer skin",
        "contentVietnamese": "Dùng đều giúp da bớt sần khi trang điểm.",
        "contentEnglish": "Regular use helps skin feel smoother under makeup.",
        "icon": "favorite",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Dầu tầm xuân",
        "contentEnglish": "Rosehip oil",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Dầu hoa hồng Bulgaria",
        "contentEnglish": "Bulgarian rose oil",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Bơ thực vật",
        "contentEnglish": "Plant butter",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Vitamin E",
        "contentEnglish": "Vitamin E",
        "sortOrder": 4
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Chất khóa ẩm nhẹ",
        "contentEnglish": "Light humectants",
        "sortOrder": 5
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Lấy một lượng bằng hạt đậu sau serum.",
        "contentEnglish": "Take a pea-sized amount after serum.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Tán từ trong ra ngoài, cổ và xương quai xanh.",
        "contentEnglish": "Spread from the center outwards, including neck and collarbone.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Dùng sáng và tối. Ban ngày chờ kem ngồi da rồi mới bôi chống nắng.",
        "contentEnglish": "Use morning and evening. In the day, let it set before applying sunscreen.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Không thay kem chống nắng.",
        "contentEnglish": "Does not replace sunscreen.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Nếu da đang bong tróc sau liệu trình, dùng lượng mỏng và hỏi bác sĩ.",
        "contentEnglish": "If your skin is peeling after a treatment, apply a thin layer and ask your doctor.",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Hũ kem Botanical Rose Renewal trên đá",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Tinh chất Luminous Elixir",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p5.png",
        "imageAlt": "Toner cánh hoa hồng",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p2.png",
        "imageAlt": "Kem chống nắng Luxury Sunscreen",
        "sortOrder": 4
      }
    ]
  },
  {
    "slug": "rose-petal-toner",
    "nameVietnamese": "Rose Petal Infusion Toner",
    "nameEnglish": "Rose Petal Infusion Toner",
    "subtitleVietnamese": "Botanica Flora",
    "subtitleEnglish": "Botanica Flora",
    "descriptionVietnamese": "Toner cánh hoa hồng cấp ẩm, làm dịu và đánh thức làn da trước serum.",
    "descriptionEnglish": "A rose petal toner that hydrates, soothes and awakens skin before serum.",
    "category": "serum",
    "price": 550000,
    "compareAtPrice": null,
    "image": "/images/p5.png",
    "imageAlt": "Chai toner Botanica Flora ngâm cánh hoa hồng",
    "badge": "Cấp ẩm",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Toner cánh hoa hồng làm bước đệm trước serum: cấp ẩm, dịu da và lấy đi lớp khô trên bề mặt.",
        "contentEnglish": "A rose petal toner that prepares skin for serum: it hydrates, soothes and lifts away surface dryness.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Có thể vỗ bằng tay hoặc thấm bông, tùy da đang nhạy hay ổn định.",
        "contentEnglish": "Pat in with your hands or apply with a cotton pad, depending on whether your skin is sensitive or stable.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Nước hoa hồng ngâm cánh thật, nhìn trong và nhẹ",
        "contentEnglish": "Rose water infused with real petals, clear and light",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Dùng được sáng tối, kể cả ngày không makeup",
        "contentEnglish": "Use morning and evening, even on makeup-free days",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Chuẩn bị da để tinh chất thấm đều hơn",
        "contentEnglish": "Prepares skin so serums absorb more evenly",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Cấp ẩm tức thì",
        "nameEnglish": "Instant hydration",
        "contentVietnamese": "Da bớt căng khô ngay sau khi vỗ.",
        "contentEnglish": "Skin feels less tight and dry right after patting.",
        "icon": "water_drop",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Làm dịu",
        "nameEnglish": "Soothing",
        "contentVietnamese": "Hợp da vừa treatment, cần bước chăm nhẹ.",
        "contentEnglish": "Suits freshly treated skin that needs gentle care.",
        "icon": "spa",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Da thông thoáng",
        "nameEnglish": "Breathable skin",
        "contentVietnamese": "Không để lại màng nhờn trước serum.",
        "contentEnglish": "Leaves no greasy film before serum.",
        "icon": "air",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Nước hoa hồng",
        "contentEnglish": "Rose water",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Cánh hoa hồng",
        "contentEnglish": "Rose petals",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Glycerin thực vật",
        "contentEnglish": "Plant glycerin",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Panthenol",
        "contentEnglish": "Panthenol",
        "sortOrder": 4
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Không cồn khô",
        "contentEnglish": "No drying alcohol",
        "sortOrder": 5
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Sau sữa rửa mặt, đổ ra lòng bàn tay hoặc bông cotton.",
        "contentEnglish": "After cleansing, pour into your palm or onto a cotton pad.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Vỗ nhẹ đến khi da ẩm, không chà.",
        "contentEnglish": "Pat gently until skin feels damp, without rubbing.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Tiếp serum khi da còn hơi ẩm.",
        "contentEnglish": "Follow with serum while skin is still slightly damp.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Đậy nắp kín để cánh hoa không oxy hóa.",
        "contentEnglish": "Close the cap tightly so the petals do not oxidize.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Lắc nhẹ trước khi dùng nếu cánh hoa lắng đáy.",
        "contentEnglish": "Shake gently before use if the petals settle at the bottom.",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p5.png",
        "imageAlt": "Chai toner Botanica Flora trên bàn đá",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Tinh chất Luminous Elixir",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Kem Botanical Rose Renewal",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p1.png",
        "imageAlt": "Mặt nạ biocellulose",
        "sortOrder": 4
      }
    ]
  },
  {
    "slug": "biocellulose-mask",
    "nameVietnamese": "Deluxe Spa Facial Biocellulose Mask",
    "nameEnglish": "Deluxe Spa Facial Biocellulose Mask",
    "subtitleVietnamese": "Mặt nạ phục hồi",
    "subtitleEnglish": "Recovery mask",
    "descriptionVietnamese": "Mặt nạ biocellulose ôm sát da, cấp ẩm tức thì sau liệu trình tại phòng khám.",
    "descriptionEnglish": "A close-fitting biocellulose mask for instant hydration after clinic treatments.",
    "category": "mask",
    "price": 480000,
    "compareAtPrice": null,
    "image": "/images/p1.png",
    "imageAlt": "Hộp và gói mặt nạ Deluxe Spa Facial Biocellulose Mask",
    "badge": "Phục hồi",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Mặt nạ biocellulose ôm sát da, cấp ẩm tức thì sau liệu trình khi bác sĩ cho phép đắp tại nhà.",
        "contentEnglish": "A close-fitting biocellulose mask for instant hydration after treatment, once your doctor approves at-home use.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Mỗi hộp 5 gói, dùng cách ngày hoặc theo lịch phòng khám giao.",
        "contentEnglish": "Five sachets per box, used every other day or on the schedule given by the clinic.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Màng mỏng, bám theo khuôn mặt, ít chảy nước",
        "contentEnglish": "A thin sheet that follows your face with little dripping",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Cảm giác mát, dễ chịu sau 15 phút",
        "contentEnglish": "A cool, pleasant feeling after 15 minutes",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Phù hợp buổi tối, khi không cần ra ngoài ngay",
        "contentEnglish": "Best in the evening, when you do not need to go out right away",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Phục hồi",
        "nameEnglish": "Recovery",
        "contentVietnamese": "Xoa dịu da khô, căng sau treatment.",
        "contentEnglish": "Soothes dry, tight skin after treatment.",
        "icon": "healing",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Cấp ẩm đậm",
        "nameEnglish": "Deep hydration",
        "contentVietnamese": "Một lần đắp đủ cho da thiếu nước.",
        "contentEnglish": "One application is enough for thirsty skin.",
        "icon": "water_drop",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Da mịn hơn",
        "nameEnglish": "Smoother skin",
        "contentVietnamese": "Bề mặt mềm, dễ nhận kem dưỡng sau đó.",
        "contentEnglish": "A softer surface that takes moisturizer well.",
        "icon": "spa",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Màng biocellulose",
        "contentEnglish": "Biocellulose sheet",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Chiết xuất dưỡng ẩm",
        "contentEnglish": "Moisturizing extracts",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Panthenol",
        "contentEnglish": "Panthenol",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Không hương liệu",
        "contentEnglish": "Fragrance-free",
        "sortOrder": 4
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Rửa mặt sạch, để da khô ráo.",
        "contentEnglish": "Cleanse your face and let it dry.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Xé gói, trải mặt nạ, chỉnh lỗ mắt mũi miệng.",
        "contentEnglish": "Open the sachet, unfold the mask and align the eye, nose and mouth openings.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Đắp 15 phút, gỡ ra, vỗ phần tinh chất còn lại. Không cần rửa.",
        "contentEnglish": "Leave on for 15 minutes, remove and pat in the remaining essence. No need to rinse.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Chỉ dùng một lần mỗi gói.",
        "contentEnglish": "Single use per sachet.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Không đắp khi da đang trợt, rỉ dịch hoặc bác sĩ chưa cho dùng hoạt chất.",
        "contentEnglish": "Do not apply on broken, weeping skin or before your doctor approves actives.",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p1.png",
        "imageAlt": "Hộp và gói mặt nạ Deluxe Spa Facial",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p5.png",
        "imageAlt": "Toner cánh hoa hồng",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Kem tái tạo hoa hồng",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Tinh chất Luminous Elixir",
        "sortOrder": 4
      }
    ]
  },
  {
    "slug": "luxury-sunscreen",
    "nameVietnamese": "Luxury Sunscreen SPF 50+",
    "nameEnglish": "Luxury Sunscreen SPF 50+",
    "subtitleVietnamese": "Radiance Defense",
    "subtitleEnglish": "Radiance Defense",
    "descriptionVietnamese": "Kem chống nắng phổ rộng SPF 50+ PA++++, finish sáng, nhẹ và không bết.",
    "descriptionEnglish": "Broad-spectrum SPF 50+ PA++++ sunscreen with a radiant, light, non-sticky finish.",
    "category": "sunscreen",
    "price": 620000,
    "compareAtPrice": 750000,
    "image": "/images/p2.png",
    "imageAlt": "Tuýp kem chống nắng Luxury Sunscreen SPF 50+ của Dr Tina Beauty",
    "badge": "SPF 50+",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Kem chống nắng phổ rộng SPF 50+ PA++++, finish sáng, lớp mỏng và không để lại vệt trắng đậm.",
        "contentEnglish": "Broad-spectrum SPF 50+ PA++++ sunscreen with a radiant finish, a thin layer and no heavy white cast.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Là bước cuối mỗi buổi sáng, kể cả ngày ở trong nhà gần cửa sổ.",
        "contentEnglish": "The last step every morning, even on days indoors near a window.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Chỉ số SPF 50+ PA++++, phổ rộng",
        "contentEnglish": "SPF 50+ PA++++, broad spectrum",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Lên da sáng nhẹ, hợp makeup phía trên",
        "contentEnglish": "A softly radiant finish that works under makeup",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Tuýp nhỏ, dễ mang theo để dặm lại",
        "contentEnglish": "A small tube that is easy to carry for reapplication",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Chống nắng phổ rộng",
        "nameEnglish": "Broad-spectrum protection",
        "contentVietnamese": "Che UVA và UVB trong sinh hoạt hàng ngày.",
        "contentEnglish": "Shields against UVA and UVB in daily life.",
        "icon": "wb_sunny",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Đã kiểm nghiệm",
        "nameEnglish": "Clinically tested",
        "contentVietnamese": "Công thức lâm sàng, kiểm tra trên da.",
        "contentEnglish": "A clinical formula, tested on skin.",
        "icon": "verified",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Finish sáng",
        "nameEnglish": "Radiant finish",
        "contentVietnamese": "Da trông tươi, không bóng dầu gắt.",
        "contentEnglish": "Skin looks fresh without harsh shine.",
        "icon": "face_retouching_natural",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Màng lọc phổ rộng",
        "contentEnglish": "Broad-spectrum filters",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Chất dưỡng ẩm nhẹ",
        "contentEnglish": "Light moisturizers",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Vitamin E",
        "contentEnglish": "Vitamin E",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Không oxybenzone",
        "contentEnglish": "Oxybenzone-free",
        "sortOrder": 4
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Dùng sau kem dưỡng, trước trang điểm.",
        "contentEnglish": "Apply after moisturizer and before makeup.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Lấy hai ngón tay cho mặt và cổ, tán đều.",
        "contentEnglish": "Use two finger-lengths for face and neck and spread evenly.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Dặm lại sau 2 giờ nếu ra nắng hoặc ra nhiều mồ hôi.",
        "contentEnglish": "Reapply every 2 hours in the sun or when sweating heavily.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Chống nắng không thay mũ và kính khi đứng nắng gắt.",
        "contentEnglish": "Sunscreen does not replace a hat and sunglasses in strong sun.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Tẩy trang kỹ vào buổi tối.",
        "contentEnglish": "Remove thoroughly in the evening.",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p2.png",
        "imageAlt": "Tuýp kem chống nắng Luxury Sunscreen trên vải lanh",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Kem dưỡng Botanical Rose Renewal",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p3.png",
        "imageAlt": "Kem mắt Peptide Firming Eye",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Tinh chất Luminous Elixir",
        "sortOrder": 4
      }
    ]
  },
  {
    "slug": "peptide-firming-eye",
    "nameVietnamese": "Peptide Firming Eye",
    "nameEnglish": "Peptide Firming Eye",
    "subtitleVietnamese": "Kem mắt săn chắc",
    "subtitleEnglish": "Firming eye cream",
    "descriptionVietnamese": "Kem mắt peptide giảm quầng thâm và nếp nhăn, đầu massage mát dịu.",
    "descriptionEnglish": "A peptide eye cream that reduces dark circles and fine lines, with a cooling massage tip.",
    "category": "eye",
    "price": 680000,
    "compareAtPrice": null,
    "image": "/images/p3.png",
    "imageAlt": "Tuýp kem mắt Peptide Firming Eye màu vàng hồng",
    "badge": "Dưỡng mắt",
    "details": [
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Kem mắt peptide giúp vùng mắt bớt khô, hỗ trợ quầng thâm và nếp nhăn nhỏ khi dùng đều.",
        "contentEnglish": "A peptide eye cream that eases dryness around the eyes and helps with dark circles and fine lines with regular use.",
        "sortOrder": 1
      },
      {
        "detailType": "STORY",
        "nameVietnamese": "Câu chuyện",
        "nameEnglish": "Story",
        "contentVietnamese": "Đầu tuýp mát, tán được lượng rất ít mà không kéo da.",
        "contentEnglish": "The cool tip spreads a tiny amount without tugging the skin.",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Chỉ cần lượng bằng hạt gạo cho cả hai mắt",
        "contentEnglish": "A rice-grain amount is enough for both eyes",
        "sortOrder": 1
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Dùng sáng tối, sau serum và trước kem mặt",
        "contentEnglish": "Use morning and evening, after serum and before face cream",
        "sortOrder": 2
      },
      {
        "detailType": "HIGHLIGHT",
        "nameVietnamese": "Điểm nổi bật",
        "nameEnglish": "Highlight",
        "contentVietnamese": "Đầu applicator hạn chế nhiễm bẩn từ ngón tay",
        "contentEnglish": "The applicator tip limits contamination from fingers",
        "sortOrder": 3
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Vùng mắt mềm hơn",
        "nameEnglish": "Softer eye area",
        "contentVietnamese": "Giảm cảm giác khô, kéo ở đuôi mắt.",
        "contentEnglish": "Reduces dryness and tightness at the outer corners.",
        "icon": "visibility",
        "sortOrder": 1
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Peptide",
        "nameEnglish": "Peptides",
        "contentVietnamese": "Hỗ trợ da mỏng trông săn và đủ ẩm.",
        "contentEnglish": "Helps thin skin look firmer and well hydrated.",
        "icon": "spa",
        "sortOrder": 2
      },
      {
        "detailType": "EFFECT",
        "nameVietnamese": "Dịu, không hương",
        "nameEnglish": "Gentle, fragrance-free",
        "contentVietnamese": "Hợp da dễ phản ứng quanh mắt.",
        "contentEnglish": "Suits reactive skin around the eyes.",
        "icon": "favorite",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Peptide",
        "contentEnglish": "Peptides",
        "sortOrder": 1
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Chất dưỡng ẩm",
        "contentEnglish": "Moisturizers",
        "sortOrder": 2
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Vitamin E",
        "contentEnglish": "Vitamin E",
        "sortOrder": 3
      },
      {
        "detailType": "INGREDIENT",
        "nameVietnamese": "Thành phần",
        "nameEnglish": "Ingredient",
        "contentVietnamese": "Không hương liệu",
        "contentEnglish": "Fragrance-free",
        "sortOrder": 4
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Lấy một chấm nhỏ ra đầu applicator hoặc ngón áp út.",
        "contentEnglish": "Place a small dot on the applicator tip or your ring finger.",
        "sortOrder": 1
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Chấm quanh xương hốc mắt, không miết vào mí.",
        "contentEnglish": "Dab around the orbital bone without rubbing the eyelids.",
        "sortOrder": 2
      },
      {
        "detailType": "USAGE",
        "nameVietnamese": "Cách dùng",
        "nameEnglish": "Usage",
        "contentVietnamese": "Vỗ nhẹ đến khi thấm. Dùng trước kem dưỡng mặt.",
        "contentEnglish": "Pat gently until absorbed. Use before face moisturizer.",
        "sortOrder": 3
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Không dùng lên mí mắt đang viêm.",
        "contentEnglish": "Do not use on inflamed eyelids.",
        "sortOrder": 1
      },
      {
        "detailType": "NOTE",
        "nameVietnamese": "Lưu ý",
        "nameEnglish": "Note",
        "contentVietnamese": "Nếu bị rát, ngưng và hỏi bác sĩ trước lần dùng tiếp.",
        "contentEnglish": "If it stings, stop and ask your doctor before using it again.",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p3.png",
        "imageAlt": "Tuýp kem mắt Peptide Firming Eye trên đá",
        "sortOrder": 1
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p4.png",
        "imageAlt": "Tinh chất Luminous Elixir",
        "sortOrder": 2
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p2.png",
        "imageAlt": "Kem chống nắng Luxury Sunscreen",
        "sortOrder": 3
      },
      {
        "detailType": "GALLERY",
        "nameVietnamese": "Hình ảnh",
        "nameEnglish": "Gallery",
        "image": "/images/p6.png",
        "imageAlt": "Kem Botanical Rose Renewal",
        "sortOrder": 4
      }
    ]
  }
];

const categories = [
  { slug: 'serum', nameVietnamese: 'Tinh chất & serum', nameEnglish: 'Essences & serums' },
  { slug: 'cream', nameVietnamese: 'Kem dưỡng & tái tạo', nameEnglish: 'Moisturizers & renewal' },
  { slug: 'sunscreen', nameVietnamese: 'Kem chống nắng', nameEnglish: 'Sunscreen' },
  { slug: 'mask', nameVietnamese: 'Mặt nạ phục hồi', nameEnglish: 'Recovery masks' },
  { slug: 'eye', nameVietnamese: 'Dưỡng mắt', nameEnglish: 'Eye care' },
];

export async function seedProducts(prisma: PrismaClient) {
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
  for (const { details, category, ...product } of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        ...product,
        productCategoryAID: categoryAIDs.get(category)!,
        details: { create: details },
        variants: {
          create: [
            {
              nameVietnamese: 'Tiêu chuẩn',
              nameEnglish: 'Standard',
              price: product.price,
              compareAtPrice: product.compareAtPrice,
              sortOrder: 0,
            },
          ],
        },
      },
    });
    created += 1;
  }
  console.log(`Seeded products: ${created} new, ${products.length - created} existing`);
}
