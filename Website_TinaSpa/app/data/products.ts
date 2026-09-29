export const productCategories = [
  { id: 'all', label: 'Tất cả sản phẩm' },
  { id: 'serum', label: 'Tinh chất & serum' },
  { id: 'cream', label: 'Kem dưỡng & tái tạo' },
  { id: 'sunscreen', label: 'Kem chống nắng' },
  { id: 'mask', label: 'Mặt nạ phục hồi' },
  { id: 'eye', label: 'Dưỡng mắt' }
] as const

export const sortOptions = [
  { id: 'newest', label: 'Mới nhất' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
  { id: 'rating', label: 'Đánh giá cao' }
] as const

export const priceFilters = [
  { id: 'all', label: 'Mọi mức giá' },
  { id: 'under-500', label: 'Dưới 500.000đ' },
  { id: '500-700', label: '500.000đ – 700.000đ' },
  { id: 'over-700', label: 'Trên 700.000đ' }
] as const

export type ProductCategoryId = (typeof productCategories)[number]['id']
export type ProductCategory = Exclude<ProductCategoryId, 'all'>
export type SortId = (typeof sortOptions)[number]['id']
export type PriceFilterId = (typeof priceFilters)[number]['id']

export interface ProductShot {
  readonly src: string
  readonly alt: string
}

export interface ProductEffect {
  readonly icon: string
  readonly title: string
  readonly text: string
}

export interface ProductItem {
  readonly id: string
  readonly name: string
  readonly subtitle: string
  readonly description: string
  readonly price: number
  readonly compareAt: number | null
  readonly image: string
  readonly imageAlt: string
  readonly category: ProductCategory
  readonly badge: string
  readonly rating: number
  readonly reviews: number
  readonly volume: string
  readonly createdAt: string
  readonly story: readonly string[]
  readonly highlights: readonly string[]
  readonly effects: readonly ProductEffect[]
  readonly ingredients: readonly string[]
  readonly usage: readonly string[]
  readonly notes: readonly string[]
  readonly gallery: readonly ProductShot[]
}

export const products: readonly ProductItem[] = [
  {
    id: 'luminous-elixir',
    name: 'Luminous Elixir',
    subtitle: '24K Gold & Active Botanical Serum',
    description: 'Tinh chất vàng 24K và hoạt chất thực vật, giúp da sáng, căng và đều màu.',
    price: 890000,
    compareAt: 1050000,
    image: '/images/p4.png',
    imageAlt: 'Lọ tinh chất Luminous Elixir nắp vàng của Dr Tina Beauty',
    category: 'serum',
    badge: 'Bán chạy',
    rating: 4.9,
    reviews: 128,
    volume: '30ml',
    createdAt: '2026-09-18',
    story: [
      'Tinh chất vàng 24K và hoạt chất thực vật, dùng sau liệu trình để da sáng, căng và đều màu hơn.',
      'Kết cấu mỏng, thấm nhanh, phù hợp buổi tối hoặc ngay sau toner khi da còn ẩm.'
    ],
    highlights: [
      'Hạt vàng lơ lửng giúp da trông rạng hơn sau vài tuần dùng đều',
      'Lớp serum nhẹ, không bóng nhờn, dễ chồng kem dưỡng phía trên',
      'Phòng khám dùng trong routine sáng da sau laser và trẻ hóa'
    ],
    effects: [
      { icon: 'auto_awesome', title: 'Sáng và đều màu', text: 'Hỗ trợ da xỉn, thiếu sức sống trông trong hơn.' },
      { icon: 'water_drop', title: 'Cấp ẩm nhẹ', text: 'Giữ da mềm để hoạt chất phía sau thấm đều.' },
      { icon: 'spa', title: 'Dịu sau liệu trình', text: 'Dùng được khi da đã ổn, không châm chích.' }
    ],
    ingredients: ['Vàng 24K', 'Niacinamide', 'Chiết xuất thực vật', 'Hyaluronic acid', 'Không hương liệu gắt'],
    usage: [
      'Rửa mặt, thấm toner, để da còn hơi ẩm.',
      'Nhỏ 3–4 giọt ra lòng bàn tay, ấn nhẹ khắp mặt và cổ.',
      'Khóa lại bằng kem dưỡng. Ban ngày luôn dùng kem chống nắng.'
    ],
    notes: [
      'Tránh đưa trực tiếp vào mắt. Nếu dính mắt, rửa lại bằng nước sạch.',
      'Ngưng dùng và báo phòng khám nếu da đỏ, rát kéo dài.',
      'Bảo quản nơi khô, tránh nắng gắt. Đóng nắp sau mỗi lần dùng.'
    ],
    gallery: [
      { src: '/images/p4.png', alt: 'Lọ tinh chất Luminous Elixir trên đá' },
      { src: '/images/p5.png', alt: 'Chai toner cánh hoa hồng Botanica Flora' },
      { src: '/images/p6.png', alt: 'Hũ kem Botanical Rose Renewal' },
      { src: '/images/p1.png', alt: 'Mặt nạ biocellulose Dr Tina Beauty' }
    ]
  },
  {
    id: 'rose-renewal-cream',
    name: 'Botanical Rose Renewal Cream',
    subtitle: 'Kem tái tạo hoa hồng',
    description: 'Kem dưỡng với dầu tầm xuân và hoa hồng Bulgaria, khóa ẩm và làm dịu da.',
    price: 750000,
    compareAt: 890000,
    image: '/images/p6.png',
    imageAlt: 'Hũ kem Botanical Rose Renewal Cream nắp vàng',
    category: 'cream',
    badge: 'Mới',
    rating: 4.8,
    reviews: 86,
    volume: '50ml',
    createdAt: '2026-09-12',
    story: [
      'Kem tái tạo với dầu tầm xuân và hoa hồng Bulgaria, khóa ẩm sau serum và làm dịu da thiếu nước.',
      'Kết cấu kem mỏng, tán đều, hợp cả da thường và da hỗn hợp thiên khô.'
    ],
    highlights: [
      'Màng ẩm nhẹ, không bết khi dùng ban đêm',
      'Hương hoa hồng dịu, không át mùi phòng trị liệu',
      'Nên dùng thành cặp với toner và tinh chất trong cùng routine'
    ],
    effects: [
      { icon: 'water_drop', title: 'Khóa ẩm', text: 'Giữ nước trên da sau serum và toner.' },
      { icon: 'spa', title: 'Làm dịu', text: 'Hoa hồng và tầm xuân hỗ trợ da khô, kéo căng.' },
      { icon: 'favorite', title: 'Da mềm hơn', text: 'Dùng đều giúp da bớt sần khi trang điểm.' }
    ],
    ingredients: ['Dầu tầm xuân', 'Dầu hoa hồng Bulgaria', 'Bơ thực vật', 'Vitamin E', 'Chất khóa ẩm nhẹ'],
    usage: [
      'Lấy một lượng bằng hạt đậu sau serum.',
      'Tán từ trong ra ngoài, cổ và xương quai xanh.',
      'Dùng sáng và tối. Ban ngày chờ kem ngồi da rồi mới bôi chống nắng.'
    ],
    notes: ['Không thay kem chống nắng.', 'Nếu da đang bong tróc sau liệu trình, dùng lượng mỏng và hỏi bác sĩ.'],
    gallery: [
      { src: '/images/p6.png', alt: 'Hũ kem Botanical Rose Renewal trên đá' },
      { src: '/images/p4.png', alt: 'Tinh chất Luminous Elixir' },
      { src: '/images/p5.png', alt: 'Toner cánh hoa hồng' },
      { src: '/images/p2.png', alt: 'Kem chống nắng Luxury Sunscreen' }
    ]
  },
  {
    id: 'rose-petal-toner',
    name: 'Rose Petal Infusion Toner',
    subtitle: 'Botanica Flora',
    description: 'Toner cánh hoa hồng cấp ẩm, làm dịu và đánh thức làn da trước serum.',
    price: 550000,
    compareAt: null,
    image: '/images/p5.png',
    imageAlt: 'Chai toner Botanica Flora ngâm cánh hoa hồng',
    category: 'serum',
    badge: 'Cấp ẩm',
    rating: 4.7,
    reviews: 64,
    volume: '100ml',
    createdAt: '2026-08-28',
    story: [
      'Toner cánh hoa hồng làm bước đệm trước serum: cấp ẩm, dịu da và lấy đi lớp khô trên bề mặt.',
      'Có thể vỗ bằng tay hoặc thấm bông, tùy da đang nhạy hay ổn định.'
    ],
    highlights: [
      'Nước hoa hồng ngâm cánh thật, nhìn trong và nhẹ',
      'Dùng được sáng tối, kể cả ngày không makeup',
      'Chuẩn bị da để tinh chất thấm đều hơn'
    ],
    effects: [
      { icon: 'water_drop', title: 'Cấp ẩm tức thì', text: 'Da bớt căng khô ngay sau khi vỗ.' },
      { icon: 'spa', title: 'Làm dịu', text: 'Hợp da vừa treatment, cần bước chăm nhẹ.' },
      { icon: 'air', title: 'Da thông thoáng', text: 'Không để lại màng nhờn trước serum.' }
    ],
    ingredients: ['Nước hoa hồng', 'Cánh hoa hồng', 'Glycerin thực vật', 'Panthenol', 'Không cồn khô'],
    usage: [
      'Sau sữa rửa mặt, đổ ra lòng bàn tay hoặc bông cotton.',
      'Vỗ nhẹ đến khi da ẩm, không chà.',
      'Tiếp serum khi da còn hơi ẩm.'
    ],
    notes: ['Đậy nắp kín để cánh hoa không oxy hóa.', 'Lắc nhẹ trước khi dùng nếu cánh hoa lắng đáy.'],
    gallery: [
      { src: '/images/p5.png', alt: 'Chai toner Botanica Flora trên bàn đá' },
      { src: '/images/p4.png', alt: 'Tinh chất Luminous Elixir' },
      { src: '/images/p6.png', alt: 'Kem Botanical Rose Renewal' },
      { src: '/images/p1.png', alt: 'Mặt nạ biocellulose' }
    ]
  },
  {
    id: 'biocellulose-mask',
    name: 'Deluxe Spa Facial Biocellulose Mask',
    subtitle: 'Mặt nạ phục hồi',
    description: 'Mặt nạ biocellulose ôm sát da, cấp ẩm tức thì sau liệu trình tại phòng khám.',
    price: 480000,
    compareAt: null,
    image: '/images/p1.png',
    imageAlt: 'Hộp và gói mặt nạ Deluxe Spa Facial Biocellulose Mask',
    category: 'mask',
    badge: 'Phục hồi',
    rating: 4.9,
    reviews: 102,
    volume: '5 x 25ml',
    createdAt: '2026-08-04',
    story: [
      'Mặt nạ biocellulose ôm sát da, cấp ẩm tức thì sau liệu trình khi bác sĩ cho phép đắp tại nhà.',
      'Mỗi hộp 5 gói, dùng cách ngày hoặc theo lịch phòng khám giao.'
    ],
    highlights: [
      'Màng mỏng, bám theo khuôn mặt, ít chảy nước',
      'Cảm giác mát, dễ chịu sau 15 phút',
      'Phù hợp buổi tối, khi không cần ra ngoài ngay'
    ],
    effects: [
      { icon: 'healing', title: 'Phục hồi', text: 'Xoa dịu da khô, căng sau treatment.' },
      { icon: 'water_drop', title: 'Cấp ẩm đậm', text: 'Một lần đắp đủ cho da thiếu nước.' },
      { icon: 'spa', title: 'Da mịn hơn', text: 'Bề mặt mềm, dễ nhận kem dưỡng sau đó.' }
    ],
    ingredients: ['Màng biocellulose', 'Chiết xuất dưỡng ẩm', 'Panthenol', 'Không hương liệu'],
    usage: [
      'Rửa mặt sạch, để da khô ráo.',
      'Xé gói, trải mặt nạ, chỉnh lỗ mắt mũi miệng.',
      'Đắp 15 phút, gỡ ra, vỗ phần tinh chất còn lại. Không cần rửa.'
    ],
    notes: [
      'Chỉ dùng một lần mỗi gói.',
      'Không đắp khi da đang trợt, rỉ dịch hoặc bác sĩ chưa cho dùng hoạt chất.'
    ],
    gallery: [
      { src: '/images/p1.png', alt: 'Hộp và gói mặt nạ Deluxe Spa Facial' },
      { src: '/images/p5.png', alt: 'Toner cánh hoa hồng' },
      { src: '/images/p6.png', alt: 'Kem tái tạo hoa hồng' },
      { src: '/images/p4.png', alt: 'Tinh chất Luminous Elixir' }
    ]
  },
  {
    id: 'luxury-sunscreen',
    name: 'Luxury Sunscreen SPF 50+',
    subtitle: 'Radiance Defense',
    description: 'Kem chống nắng phổ rộng SPF 50+ PA++++, finish sáng, nhẹ và không bết.',
    price: 620000,
    compareAt: null,
    image: '/images/p2.png',
    imageAlt: 'Tuýp kem chống nắng Luxury Sunscreen SPF 50+ của Dr Tina Beauty',
    category: 'sunscreen',
    badge: 'SPF 50+',
    rating: 4.8,
    reviews: 91,
    volume: '50ml',
    createdAt: '2026-07-16',
    story: [
      'Kem chống nắng phổ rộng SPF 50+ PA++++, finish sáng, lớp mỏng và không để lại vệt trắng đậm.',
      'Là bước cuối mỗi buổi sáng, kể cả ngày ở trong nhà gần cửa sổ.'
    ],
    highlights: [
      'Chỉ số SPF 50+ PA++++, phổ rộng',
      'Lên da sáng nhẹ, hợp makeup phía trên',
      'Tuýp nhỏ, dễ mang theo để dặm lại'
    ],
    effects: [
      { icon: 'wb_sunny', title: 'Chống nắng phổ rộng', text: 'Che UVA và UVB trong sinh hoạt hàng ngày.' },
      { icon: 'verified', title: 'Đã kiểm nghiệm', text: 'Công thức lâm sàng, kiểm tra trên da.' },
      { icon: 'face_retouching_natural', title: 'Finish sáng', text: 'Da trông tươi, không bóng dầu gắt.' }
    ],
    ingredients: ['Màng lọc phổ rộng', 'Chất dưỡng ẩm nhẹ', 'Vitamin E', 'Không oxybenzone'],
    usage: [
      'Dùng sau kem dưỡng, trước trang điểm.',
      'Lấy hai ngón tay cho mặt và cổ, tán đều.',
      'Dặm lại sau 2 giờ nếu ra nắng hoặc ra nhiều mồ hôi.'
    ],
    notes: ['Chống nắng không thay mũ và kính khi đứng nắng gắt.', 'Tẩy trang kỹ vào buổi tối.'],
    gallery: [
      { src: '/images/p2.png', alt: 'Tuýp kem chống nắng Luxury Sunscreen trên vải lanh' },
      { src: '/images/p6.png', alt: 'Kem dưỡng Botanical Rose Renewal' },
      { src: '/images/p3.png', alt: 'Kem mắt Peptide Firming Eye' },
      { src: '/images/p4.png', alt: 'Tinh chất Luminous Elixir' }
    ]
  },
  {
    id: 'peptide-firming-eye',
    name: 'Peptide Firming Eye',
    subtitle: 'Kem mắt săn chắc',
    description: 'Kem mắt peptide giảm quầng thâm và nếp nhăn, đầu massage mát dịu.',
    price: 680000,
    compareAt: null,
    image: '/images/p3.png',
    imageAlt: 'Tuýp kem mắt Peptide Firming Eye màu vàng hồng',
    category: 'eye',
    badge: 'Dưỡng mắt',
    rating: 4.6,
    reviews: 47,
    volume: '15ml',
    createdAt: '2026-06-22',
    story: [
      'Kem mắt peptide giúp vùng mắt bớt khô, hỗ trợ quầng thâm và nếp nhăn nhỏ khi dùng đều.',
      'Đầu tuýp mát, tán được lượng rất ít mà không kéo da.'
    ],
    highlights: [
      'Chỉ cần lượng bằng hạt gạo cho cả hai mắt',
      'Dùng sáng tối, sau serum và trước kem mặt',
      'Đầu applicator hạn chế nhiễm bẩn từ ngón tay'
    ],
    effects: [
      { icon: 'visibility', title: 'Vùng mắt mềm hơn', text: 'Giảm cảm giác khô, kéo ở đuôi mắt.' },
      { icon: 'spa', title: 'Peptide', text: 'Hỗ trợ da mỏng trông săn và đủ ẩm.' },
      { icon: 'favorite', title: 'Dịu, không hương', text: 'Hợp da dễ phản ứng quanh mắt.' }
    ],
    ingredients: ['Peptide', 'Chất dưỡng ẩm', 'Vitamin E', 'Không hương liệu'],
    usage: [
      'Lấy một chấm nhỏ ra đầu applicator hoặc ngón áp út.',
      'Chấm quanh xương hốc mắt, không miết vào mí.',
      'Vỗ nhẹ đến khi thấm. Dùng trước kem dưỡng mặt.'
    ],
    notes: ['Không dùng lên mí mắt đang viêm.', 'Nếu bị rát, ngưng và hỏi bác sĩ trước lần dùng tiếp.'],
    gallery: [
      { src: '/images/p3.png', alt: 'Tuýp kem mắt Peptide Firming Eye trên đá' },
      { src: '/images/p4.png', alt: 'Tinh chất Luminous Elixir' },
      { src: '/images/p2.png', alt: 'Kem chống nắng Luxury Sunscreen' },
      { src: '/images/p6.png', alt: 'Kem Botanical Rose Renewal' }
    ]
  }
]

export function findProduct(id: string) {
  return products.find((item) => item.id === id)
}

export function relatedProducts(id: string, limit = 3) {
  const current = findProduct(id)
  if (!current) return []
  const others = products.filter((item) => item.id !== id)
  const sameCategory = others.filter((item) => item.category === current.category)
  const rest = others.filter((item) => item.category !== current.category)
  return [...sameCategory, ...rest].slice(0, limit)
}

export function categoryLabel(category: ProductCategory) {
  return productCategories.find((item) => item.id === category)?.label ?? category
}

export function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')}đ`
}

export function matchesPrice(price: number, filter: PriceFilterId) {
  if (filter === 'under-500') return price < 500000
  if (filter === '500-700') return price >= 500000 && price <= 700000
  if (filter === 'over-700') return price > 700000
  return true
}
