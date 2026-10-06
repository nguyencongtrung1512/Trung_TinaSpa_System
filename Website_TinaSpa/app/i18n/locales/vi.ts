const vi = {
  common: {
    bookNow: 'Đặt lịch ngay',
    login: 'Đăng nhập',
    openMenu: 'Mở menu',
    closeMenu: 'Đóng menu',
    mainNav: 'Điều hướng chính',
    mobileNav: 'Menu di động',
    language: 'Ngôn ngữ',
    viewAll: 'Xem tất cả'
  },
  meta: {
    home: {
      title: 'Dr Tina Beauty — Chăm sóc sắc đẹp chuyên nghiệp',
      description:
        'Phòng khám thẩm mỹ Dr Tina Beauty. BS. Nguyễn Lânn tư vấn liệu trình da, trẻ hóa và chăm sóc spa y khoa.'
    },
    about: {
      title: 'Giới thiệu — Dr Tina Beauty',
      description: 'Giá trị cốt lõi của Dr Tina Beauty: chân thật, hài hòa, chữa lành và tinh tế.'
    },
    services: {
      title: 'Dịch vụ — Dr Tina Beauty',
      description: 'Menu chăm sóc tại Dr Tina Beauty: gói combo, manicure, pedicure với bảng giá chi tiết.'
    },
    contact: {
      title: 'Liên hệ — Dr Tina Beauty',
      description: 'Địa chỉ, hotline, giờ mở cửa và chỉ đường đến các cơ sở TinaSpa tại TP.HCM và Hà Nội.'
    },
    products: {
      title: 'Sản phẩm — Dr Tina Beauty',
      description:
        'Tinh chất, kem dưỡng, chống nắng và mặt nạ phục hồi được Dr Tina Beauty chọn lọc cho làn da sau liệu trình.'
    },
    productNotFound: 'Không tìm thấy sản phẩm — Dr Tina Beauty',
    booking: {
      title: 'Đặt lịch hẹn — Dr Tina Beauty',
      description: 'Dành một chút thời gian cho bản thân. Đặt lịch chăm sóc sắc đẹp cùng Dr Tina Beauty.'
    },
    login: {
      title: 'Đăng nhập — Dr Tina Beauty',
      description: 'Đăng nhập hoặc đăng ký cổng khách hàng Dr Tina Beauty để quản lý lịch hẹn và phác đồ trị liệu.'
    },
    account: {
      title: 'Hồ sơ của tôi — Dr Tina Beauty',
      description: 'Cập nhật thông tin cá nhân trong tài khoản Dr Tina Beauty.'
    }
  },
  account: {
    eyebrow: 'Tài khoản của tôi',
    title: 'Hồ sơ cá nhân',
    intro: 'Cập nhật thông tin để Dr Tina chăm sóc bạn chu đáo hơn.',
    portalLink: 'Vào cổng làm việc',
    logout: 'Đăng xuất',
    phone: 'Số điện thoại',
    phoneHint: 'Liên hệ chi nhánh nếu cần đổi số điện thoại.',
    fullName: 'Họ và tên',
    gender: 'Giới tính',
    genderNone: 'Chưa chọn',
    genders: { FEMALE: 'Nữ', MALE: 'Nam', OTHER: 'Khác' },
    dateOfBirth: 'Ngày sinh',
    age: '{{count}} tuổi',
    address: 'Địa chỉ',
    addressPlaceholder: 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành',
    avatar: 'Ảnh đại diện',
    avatarUpload: {
      choose: 'Chọn ảnh',
      replace: 'Đổi ảnh',
      remove: 'Gỡ ảnh',
      uploading: 'Đang tải lên',
      hint: 'JPG, PNG, WEBP, GIF · tối đa {{size}} MB. Nhấn "Lưu thay đổi" để cập nhật.'
    },
    save: 'Lưu thay đổi',
    saving: 'Đang lưu...',
    saved: 'Đã cập nhật hồ sơ.',
    retry: 'Thử lại',
    memberSince: 'Thành viên từ {{date}}',
    roles: { CUSTOMER: 'Khách hàng', STAFF: 'Nhân viên', MANAGER: 'Quản lý', ADMIN: 'Quản trị' },
    errors: {
      fullName: 'Họ tên cần ít nhất 2 ký tự.',
      dateOfBirth: 'Ngày sinh không được ở tương lai.',
      load: 'Không tải được hồ sơ. Vui lòng thử lại.',
      save: 'Không lưu được hồ sơ. Vui lòng thử lại.'
    }
  },
  error: {
    title: 'Đã có lỗi',
    details: 'Đã xảy ra sự cố không mong muốn.',
    generic: 'Lỗi',
    notFound: 'Không tìm thấy trang bạn đang tìm.'
  },
  nav: {
    home: 'Trang chủ',
    about: 'Giới thiệu',
    services: 'Dịch vụ',
    products: 'Sản phẩm',
    contact: 'Liên hệ',
    booking: 'Đặt lịch'
  },
  brand: {
    address: 'TP. Hồ Chí Minh'
  },
  footer: {
    tagline: 'Phòng khám thẩm mỹ ấm áp, nơi bác sĩ và liệu trình spa gặp nhau để chăm sóc da bền vững.',
    explore: 'Khám phá',
    services: 'Dịch vụ',
    contact: 'Liên hệ',
    copyright: 'Giữ gìn nét đẹp tự nhiên của bạn.'
  },
  hero: {
    eyebrow: 'Chào mừng đến với Dr Tina Beauty',
    title: 'Chăm sóc sắc đẹp chuyên nghiệp, tận tâm',
    description:
      'Phòng khám kết hợp thẩm mỹ y khoa và không gian spa yên tĩnh. BS. Nguyễn Lânn đồng hành cùng bạn từ tư vấn da đến liệu trình cá nhân hóa.',
    primaryCta: 'Đặt lịch ngay',
    secondaryCta: 'Tìm hiểu thêm',
    portraitAlt: 'BS. Nguyễn Loan - bác sĩ thẩm mỹ Dr Tina Beauty'
  },
  stats: {
    experience: 'Năm kinh nghiệm',
    customers: 'Khách hàng tin tưởng',
    treatments: 'Liệu trình chuyên sâu',
    groups: 'Nhóm dịch vụ thẩm mỹ'
  },
  services: {
    skinExam: {
      title: 'Khám da tổng quát',
      description: 'Đánh giá tình trạng da, xác định nguyên nhân và phác đồ phù hợp trước khi điều trị.'
    },
    acne: {
      title: 'Điều trị mụn',
      description: 'Liệu trình y khoa giảm viêm, kiểm soát dầu và phục hồi hàng rào bảo vệ da.'
    },
    rejuvenation: {
      title: 'Trẻ hóa da',
      description: 'Công nghệ trẻ hóa giúp da căng mịn, đều màu và khỏe hơn theo thời gian.'
    },
    laser: {
      title: 'Laser thẩm mỹ',
      description: 'Hỗ trợ nám, sẹo, lỗ chân lông và các vấn đề sắc tố dưới sự theo dõi của bác sĩ.'
    },
    body: {
      title: 'Chăm sóc body',
      description: 'Liệu trình thư giãn kết hợp chăm sóc chuyên sâu cho cơ thể sau ngày dài.'
    },
    consult: {
      title: 'Tư vấn liệu trình',
      description: 'Lộ trình cá nhân hóa theo mục tiêu sắc đẹp, ngân sách và lịch sinh hoạt.'
    }
  },
  serviceMenus: {
    combo: {
      title: 'Gói Combo',
      imageAlt: 'Gói chăm sóc combo tại Dr Tina Beauty',
      items: {
        perfectlyPolished: {
          summary: 'Làm móng tay sắc (Mani hoặc Pedi) kèm dưỡng da tay chuyên sâu',
          description:
            'Cắt da, tạo form và sơn màu cho tay hoặc chân, kết thúc bằng mặt nạ dưỡng ẩm và massage tay 10 phút giúp da mềm mịn.'
        },
        glowRelax: {
          summary: 'Chăm sóc da mặt cơ bản kết hợp massage cổ vai gáy',
          description:
            'Làm sạch sâu, tẩy tế bào chết dịu nhẹ, đắp mặt nạ cấp ẩm và massage cổ vai gáy 20 phút giải tỏa căng thẳng.'
        },
        handFootRitual: {
          summary: 'Combo Mani + Pedi sơn gel, ngâm thảo mộc thư giãn',
          description:
            'Ngâm chân thảo mộc ấm, chăm sóc móng tay và móng chân, sơn gel bền màu 3–4 tuần cùng dưỡng da gót chân.'
        },
        bridalBeautyDay: {
          summary: 'Gói làm đẹp trọn ngày cho cô dâu trước lễ cưới',
          description:
            'Chăm sóc da mặt phục hồi, làm móng đính đá nhẹ, massage body thư giãn và tư vấn chăm sóc da trước ngày trọng đại.'
        }
      }
    },
    manicure: {
      title: 'Manicure',
      imageAlt: 'Dịch vụ chăm sóc móng tay Dr Tina Beauty',
      items: {
        classicManicure: {
          summary: 'Làm mới màu sắc (Mani hoặc Pedi), cắt da và tạo form móng',
          description: 'Ngâm tay, cắt da, tạo form và sơn thường theo bảng màu theo mùa của Dr Tina Beauty.'
        },
        gelPolish: {
          summary: 'Sơn gel bền màu, bóng đẹp đến 4 tuần',
          description: 'Sơn gel cao cấp không mùi, hơ đèn LED nhanh khô, giữ màu bóng đẹp từ 3 đến 4 tuần.'
        },
        frenchTip: {
          summary: 'Đầu móng Pháp thanh lịch, tùy chọn viền nhũ vàng',
          description: 'Tạo đầu móng trắng hoặc nude kiểu Pháp, có thể thêm viền nhũ vàng mảnh cho dịp đặc biệt.'
        },
        nailArt: {
          summary: 'Vẽ móng nghệ thuật theo mẫu hoặc theo ý tưởng riêng',
          description: 'Kỹ thuật viên vẽ tay họa tiết hoa, ombre hoặc đính đá nhẹ theo mẫu có sẵn hoặc ý tưởng của bạn.'
        },
        nailRepair: {
          summary: 'Phục hồi móng yếu, gãy hoặc sau khi tháo gel',
          description: 'Đắp lớp phục hồi keratin, dưỡng dầu biểu bì và hướng dẫn chăm sóc móng tại nhà.'
        },
        paraffinHandCare: {
          summary: 'Ủ sáp paraffin ấm giúp da tay mềm mịn tức thì',
          description: 'Tẩy tế bào chết tay, ủ sáp paraffin ấm 15 phút và thoa kem dưỡng giúp da tay mềm, sáng hơn.'
        }
      }
    },
    pedicure: {
      title: 'Pedicure',
      imageAlt: 'Dịch vụ chăm sóc móng chân Dr Tina Beauty',
      items: {
        spaPedicure: {
          summary: 'Ngâm chân thảo mộc, chà gót và sơn màu',
          description: 'Ngâm chân nước ấm thảo mộc, chà gót, cắt da và sơn màu, kết thúc với massage bàn chân 10 phút.'
        },
        gelPedicure: {
          summary: 'Chăm sóc móng chân và sơn gel giữ màu lâu',
          description: 'Quy trình Spa Pedicure kết hợp sơn gel bền màu, phù hợp cho chuyến đi biển hoặc kỳ nghỉ.'
        },
        callusTreatment: {
          summary: 'Làm mềm và loại bỏ vết chai gót chân',
          description: 'Ủ mềm vùng da chai bằng dung dịch chuyên dụng, mài nhẹ an toàn và dưỡng ẩm sâu cho gót chân.'
        },
        detoxFootRitual: {
          summary: 'Ngâm muối khoáng, đắp bùn và massage bấm huyệt',
          description:
            'Ngâm muối khoáng, đắp bùn khoáng thải độc và massage bấm huyệt bàn chân giúp ngủ ngon, giảm mỏi chân.'
        }
      }
    }
  },
  homeServices: {
    eyebrow: 'Dịch vụ nổi bật',
    title: 'Chăm sóc trọn vẹn, nâng tầm giá trị',
    viewMenu: 'Xem toàn bộ menu',
    summary: '{{count}} dịch vụ · từ {{price}}'
  },
  process: {
    eyebrow: 'Quy trình làm việc',
    title: '4 bước đồng hành',
    description: 'Mỗi bước được thực hiện rõ ràng, có người theo sát từ lần đầu tiên đến khi hoàn tất.',
    steps: {
      book: {
        title: 'Đặt lịch hẹn',
        description: 'Chọn khung giờ phù hợp. Phòng khám xác nhận và nhắc lịch trước buổi tư vấn.'
      },
      consult: {
        title: 'Tư vấn bác sĩ',
        description: 'Khám da, nghe mong muốn và nhận đề xuất liệu trình kèm lưu ý chăm sóc.'
      },
      treat: {
        title: 'Thực hiện liệu trình',
        description: 'Kỹ thuật viên và bác sĩ phối hợp trong không gian riêng, đúng phác đồ đã thống nhất.'
      },
      aftercare: {
        title: 'Chăm sóc sau điều trị',
        description: 'Theo dõi phản ứng da, hướng dẫn dưỡng tại nhà và hẹn tái khám khi cần.'
      }
    }
  },
  team: {
    eyebrow: 'Đội ngũ chuyên môn',
    title: 'Người đồng hành cùng bạn',
    members: {
      doctor: {
        name: 'BS. Nguyễn Lânn',
        role: 'Bác sĩ thẩm mỹ',
        imageAlt: 'Chân dung BS. Nguyễn Lânn'
      },
      skinExpert: {
        name: 'Chuyên gia chăm sóc da',
        role: 'Liệu trình chuyên sâu',
        imageAlt: 'Không gian liệu trình chăm sóc da'
      },
      spaTechnician: {
        name: 'Kỹ thuật viên spa',
        role: 'Trải nghiệm thư giãn',
        imageAlt: 'Không gian spa Dr Tina Beauty'
      }
    }
  },
  testimonials: {
    eyebrow: 'Khách hàng nói gì',
    title: 'Cảm nhận thật sau liệu trình',
    items: {
      minhAnh: {
        quote: 'Buổi tư vấn rõ ràng, không bị thúc ép làm dịch vụ. Da tôi dịu hơn sau liệu trình điều trị mụn.',
        detail: 'Khách liệu trình da'
      },
      thuHa: {
        quote: 'Không gian yên và sạch. Tôi yên tâm vì bác sĩ giải thích từng bước trước khi bắt đầu.',
        detail: 'Khách trẻ hóa da'
      },
      lanPhuong: {
        quote: 'Lịch hẹn đúng giờ, chăm sóc sau điều trị chu đáo. Sẽ quay lại cho liệu trình tiếp theo.',
        detail: 'Khách chăm sóc định kỳ'
      }
    }
  },
  results: {
    eyebrow: 'MINH CHỨNG HIỆU QUẢ',
    title: 'Kết quả thực tế',
    description: 'Hành trình thay đổi của khách hàng được đo lường bằng chỉ số lâm sàng minh bạch.',
    sessions: 'Số buổi',
    duration: 'Thời gian',
    viewJourney: 'XEM HÀNH TRÌNH',
    sliderLabel: 'So sánh trước và sau. Kéo sang phải để xem before, kéo sang trái để xem after.',
    before: 'BEFORE',
    after: 'AFTER',
    cases: {
      '01': {
        label: 'Ca điều trị 01',
        title: 'Phục hồi da chuyên sâu',
        result: 'Tổn thương & kích ứng giảm mạnh 96%',
        note: 'Da kích ứng, mất nước được phục hồi trọn vẹn',
        sessions: '06 buổi',
        duration: '8 tuần',
        beforeAlt: 'Ảnh trước liệu trình phục hồi da',
        afterAlt: 'Ảnh sau liệu trình phục hồi da'
      },
      '02': {
        label: 'Ca điều trị 02',
        title: 'Liệu trình mờ thâm nám',
        result: 'Nám mảng & tàn nhang giảm 88%',
        note: 'Melanin tích tụ dày, viền màu trở nên rạng rỡ hơn',
        sessions: '08 buổi',
        duration: '10 tuần',
        beforeAlt: 'Ảnh trước liệu trình mờ thâm nám',
        afterAlt: 'Ảnh sau liệu trình mờ thâm nám'
      },
      '03': {
        label: 'Ca điều trị 03',
        title: 'Trị mụn & kháng viêm',
        result: 'Mụn viêm được kiểm soát hoàn toàn',
        note: 'Tăng tiết bã nhờn, da khít và mờ thâm',
        sessions: '05 buổi',
        duration: '6 tuần',
        beforeAlt: 'Ảnh trước liệu trình trị mụn',
        afterAlt: 'Ảnh sau liệu trình trị mụn'
      }
    }
  },
  cta: {
    title: 'Đặt lịch hẹn chữa lành',
    description:
      'Đến Tina Spa để xả stress và làm mới mình. Vẻ đẹp bắt đầu từ những điều nhỏ nhất và lan tỏa đến cả tâm hồn.',
    button: 'Đặt lịch trải nghiệm'
  },
  about: {
    imageMainAlt: 'Không gian liệu trình thư giãn tại Dr Tina Beauty',
    imageSideAlt: 'Góc chăm sóc da trong phòng trị liệu',
    badge: 'Sanctuary ritual',
    spaceTitle: 'Không Gian Thuần Khiết',
    spaceText: 'Thư giãn tâm thức · Đánh thức vẻ đẹp nội sinh',
    eyebrow: 'Giá trị cốt lõi',
    titleLead: 'Lan Tỏa Tinh Hoa',
    titleAccent: 'Nội Tại',
    intro:
      'Định hình phong cách làm đẹp xuất phát từ sự thấu hiểu sâu sắc, kết hợp tinh hoa y học chuẩn xác cùng nghệ thuật phục hồi an yên cho làn da và thần thái.',
    values: {
      '01': {
        title: 'Chân Thật',
        description:
          'Mỗi dịch vụ được thực hiện bằng sự tận tâm và tự nhiên, không phô trương, chỉ mang đến điều tinh khiết nhất cho cơ thể và tâm trí.'
      },
      '02': {
        title: 'Hài Hòa',
        description:
          'Không gian, con người và liệu trình đều hướng đến sự cân bằng — giữa hiện đại và truyền thống, giữa thể chất và tinh thần.'
      },
      '03': {
        title: 'Chữa Lành',
        description:
          'Liệu trình được thiết kế để giải tỏa căng thẳng, phục hồi năng lượng, đưa bạn về trạng thái an nhiên trọn vẹn.'
      },
      '04': {
        title: 'Tinh Tế',
        description:
          'Chú trọng từng chi tiết nhỏ, từ hương thơm, ánh sáng đến từng động tác trị liệu — tất cả đều để nâng niu trải nghiệm của bạn.'
      }
    },
    signatureEyebrow: 'Điều làm nên dấu ấn riêng',
    signatureTitle: 'Chỉ Có Tại',
    signatureIntro:
      'Ba giá trị khác biệt kiến tạo nên trải nghiệm thư thái và sự chuyển hóa thanh khiết từ tâm thức đến làn da.',
    signatures: {
      spa: {
        lead: 'Sản phẩm an toàn, ',
        accent: 'lành tính',
        description: 'Cam kết dùng nguồn sản phẩm thuần chay, không độc hại và thân thiện với môi trường.'
      },
      fingerprint: {
        lead: 'Dịch vụ ',
        accent: 'cá nhân hóa',
        description: 'Mỗi khách hàng đều được lắng nghe và thiết kế liệu trình riêng phù hợp với nhu cầu làn da.'
      },
      self_improvement: {
        lead: 'Chữa lành từ ',
        accent: 'bên trong',
        description: 'Không gian an tĩnh giúp bạn xả hết những căng thẳng và nạp lại năng lượng tích cực.'
      }
    }
  },
  servicesPage: {
    eyebrow: 'Dịch vụ của chúng tôi',
    title: 'Menu chăm sóc',
    description: 'Chọn liệu trình theo nhu cầu, bấm dấu cộng để xem chi tiết từng dịch vụ.',
    groups: 'Nhóm dịch vụ',
    all: 'TẤT CẢ',
    searchPlaceholder: 'Tìm dịch vụ...',
    empty: 'Không tìm thấy dịch vụ phù hợp với từ khóa "{{query}}"'
  },
  contact: {
    titleLead: 'Kết Nối Cùng',
    intro:
      'Chúng tôi luôn sẵn sàng đồng hành cùng bạn trên hành trình chăm sóc và yêu thương làn da — nơi giao thoa giữa khoa học da liễu chuẩn mực và nghệ thuật chữa lành tự nhiên.',
    eyebrow: 'Chỉ dẫn & vị trí',
    findUs: 'Tìm Đường Đến TinaSpa',
    chooseBranch: 'Chọn cơ sở',
    address: 'Địa chỉ',
    hotline: 'Hotline tư vấn',
    email: 'Hòm thư',
    hours: 'Giờ mở cửa',
    bookHere: 'Đặt lịch tại cơ sở này',
    directions: 'Xem Chỉ Đường Google Maps',
    branches: {
      q1: {
        tab: 'Cơ sở 01: Quận 1, TP.HCM',
        name: 'TinaSpa Bến Nghé — Quận 1',
        description:
          'Nằm giữa trung tâm Sài Gòn sôi động, không gian xanh mát với phòng trị liệu riêng tư cùng quy trình chăm sóc da y khoa chuẩn mực.',
        address: '12 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
        hours: 'Thứ 2 – Chủ Nhật: 08:00 – 20:00',
        imageAlt: 'Phòng trị liệu TinaSpa Quận 1'
      },
      hn: {
        tab: 'Cơ sở 02: Hoàn Kiếm, Hà Nội',
        name: 'TinaSpa Tràng Tiền — Hoàn Kiếm',
        description:
          'Tọa lạc tại khu phố Pháp cổ thanh lịch, kết tinh nét đẹp quý phái Đông Dương với phòng xông hơi thảo dược hoàng cung và quy trình điều trị y khoa tân tiến.',
        address: '45 Lý Thường Kiệt, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội',
        hours: 'Thứ 2 – Chủ Nhật: 09:00 – 21:00',
        imageAlt: 'Phòng trị liệu TinaSpa Hoàn Kiếm'
      }
    }
  },
  booking: {
    title: 'Đặt lịch hẹn',
    tagline: 'Dành một chút thời gian cho bản thân',
    intro: 'Thư giãn, tái tạo năng lượng và chăm sóc sắc đẹp cùng Dr Tina Beauty.',
    introMore: 'Chúng tôi luôn sẵn sàng đồng hành cùng bạn trên hành trình tự tin và rạng rỡ hơn.',
    motto: 'Đẹp hơn · Khỏe hơn · Hạnh phúc hơn',
    thanks: 'Cảm ơn {{name}}',
    confirmation:
      'Lịch {{service}} vào {{date}} ({{time}}) đã được ghi nhận. Chúng tôi sẽ gọi {{phone}} để xác nhận cùng bạn.',
    fields: {
      name: 'Họ và tên',
      namePlaceholder: 'Nhập họ và tên của bạn',
      phone: 'Số điện thoại',
      phonePlaceholder: 'Nhập số điện thoại',
      service: 'Dịch vụ quan tâm',
      servicePlaceholder: 'Chọn dịch vụ',
      date: 'Ngày mong muốn',
      time: 'Khung giờ',
      timePlaceholder: 'Chọn khung giờ',
      note: 'Ghi chú',
      notePlaceholder: 'Để lại ghi chú (nếu có)'
    },
    errors: {
      name: 'Xin hãy cho biết họ và tên.',
      phone: 'Số điện thoại chưa đúng.',
      service: 'Hãy chọn dịch vụ bạn quan tâm.',
      date: 'Hãy chọn ngày mong muốn.',
      datePast: 'Ngày hẹn cần từ hôm nay trở đi.',
      time: 'Hãy chọn khung giờ.'
    },
    submit: 'Xác nhận đặt lịch',
    contactNote: 'Chúng tôi sẽ liên hệ xác nhận lịch hẹn của bạn.'
  },
  products: {
    categories: {
      all: 'Tất cả sản phẩm',
      serum: 'Tinh chất & serum',
      cream: 'Kem dưỡng & tái tạo',
      sunscreen: 'Kem chống nắng',
      mask: 'Mặt nạ phục hồi',
      eye: 'Dưỡng mắt'
    },
    sort: {
      newest: 'Mới nhất',
      'price-asc': 'Giá tăng dần',
      'price-desc': 'Giá giảm dần',
      rating: 'Đánh giá cao'
    },
    priceFilters: {
      all: 'Mọi mức giá',
      'under-500': 'Dưới 500.000đ',
      '500-700': '500.000đ – 700.000đ',
      'over-700': 'Trên 700.000đ'
    },
    list: {
      eyebrow: 'Bộ sưu tập chăm sóc da',
      title: 'Sản phẩm Dr Tina Beauty',
      description: 'Tinh chất, kem dưỡng, chống nắng và mặt nạ phục hồi được phòng khám chọn để dùng sau liệu trình.',
      groups: 'Nhóm sản phẩm',
      search: 'Tìm sản phẩm',
      searchPlaceholder: 'Tìm tinh chất, kem dưỡng, mặt nạ...',
      sortLabel: 'Sắp xếp',
      sortAria: 'Sắp xếp sản phẩm',
      priceLabel: 'Giá',
      priceAria: 'Lọc theo khoảng giá',
      layout: 'Kiểu hiển thị',
      grid: 'Xem dạng lưới',
      listView: 'Xem dạng danh sách',
      count: '{{count}} sản phẩm',
      inCart: ' · {{count}} trong giỏ',
      saved: ' · {{count}} yêu thích',
      emptyTitle: 'Không có sản phẩm khớp bộ lọc',
      emptyText: 'Thử từ khóa khác, hoặc xem lại toàn bộ bộ sưu tập.',
      showAll: 'Xem tất cả sản phẩm',
      save: 'Yêu thích {{name}}',
      unsave: 'Bỏ yêu thích {{name}}',
      addToCart: 'Thêm {{name}} vào giỏ',
      removeFromCart: 'Bỏ {{name}} khỏi giỏ',
      added: 'Đã thêm {{name}} vào giỏ.',
      removed: 'Đã bỏ {{name}} khỏi giỏ.',
      rating: 'Đánh giá ',
      price: 'Giá ',
      adviceEyebrow: 'Tư vấn làn da',
      adviceTitle: 'Bạn băn khoăn sản phẩm nào phù hợp với làn da của mình?',
      adviceText: 'Bác sĩ lắng nghe tình trạng da và gợi ý routine đúng, thay vì để bạn đoán giữa các lọ serum.',
      viewTreatments: 'Xem liệu trình',
      bookSkinConsult: 'Đặt lịch tư vấn da'
    },
    detail: {
      breadcrumb: 'Đường dẫn',
      gallery: 'Ảnh sản phẩm',
      reviews: '{{count}} nhận xét',
      inStock: 'Còn hàng',
      volume: 'Dung tích {{volume}} · Dùng sau liệu trình tại phòng khám',
      decrease: 'Giảm số lượng',
      increase: 'Tăng số lượng',
      quantity: 'Số lượng ',
      addToCart: 'Thêm vào giỏ hàng',
      added: 'Đã thêm {{qty}} {{name}} vào giỏ.',
      info: 'Thông tin sản phẩm',
      tabs: {
        story: 'Mô tả',
        ingredients: 'Thành phần',
        usage: 'Cách dùng',
        notes: 'Lưu ý'
      },
      trust: {
        verified: 'Đã kiểm nghiệm',
        spa: 'Thành phần dịu',
        favorite: 'Da nhạy cảm'
      },
      whyTitle: 'Vì sao phòng khám chọn sản phẩm này',
      ingredientsTitle: 'Thành phần nổi bật',
      usageTitle: 'Cách dùng tại nhà',
      notesTitle: 'Lưu ý khi dùng',
      effectsTitle: 'Công dụng chính',
      relatedTitle: 'Liệu trình chăm sóc kết hợp',
      notFoundTitle: 'Không tìm thấy sản phẩm',
      notFoundText: 'Sản phẩm này không có trong bộ sưu tập hiện tại.',
      backToProducts: 'Về trang sản phẩm'
    },
    items: {
      'luminous-elixir': {
        subtitle: '24K Gold & Active Botanical Serum',
        description: 'Tinh chất vàng 24K và hoạt chất thực vật, giúp da sáng, căng và đều màu.',
        imageAlt: 'Lọ tinh chất Luminous Elixir nắp vàng của Dr Tina Beauty',
        badge: 'Bán chạy',
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
          { title: 'Sáng và đều màu', text: 'Hỗ trợ da xỉn, thiếu sức sống trông trong hơn.' },
          { title: 'Cấp ẩm nhẹ', text: 'Giữ da mềm để hoạt chất phía sau thấm đều.' },
          { title: 'Dịu sau liệu trình', text: 'Dùng được khi da đã ổn, không châm chích.' }
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
          'Lọ tinh chất Luminous Elixir trên đá',
          'Chai toner cánh hoa hồng Botanica Flora',
          'Hũ kem Botanical Rose Renewal',
          'Mặt nạ biocellulose Dr Tina Beauty'
        ]
      },
      'rose-renewal-cream': {
        subtitle: 'Kem tái tạo hoa hồng',
        description: 'Kem dưỡng với dầu tầm xuân và hoa hồng Bulgaria, khóa ẩm và làm dịu da.',
        imageAlt: 'Hũ kem Botanical Rose Renewal Cream nắp vàng',
        badge: 'Mới',
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
          { title: 'Khóa ẩm', text: 'Giữ nước trên da sau serum và toner.' },
          { title: 'Làm dịu', text: 'Hoa hồng và tầm xuân hỗ trợ da khô, kéo căng.' },
          { title: 'Da mềm hơn', text: 'Dùng đều giúp da bớt sần khi trang điểm.' }
        ],
        ingredients: ['Dầu tầm xuân', 'Dầu hoa hồng Bulgaria', 'Bơ thực vật', 'Vitamin E', 'Chất khóa ẩm nhẹ'],
        usage: [
          'Lấy một lượng bằng hạt đậu sau serum.',
          'Tán từ trong ra ngoài, cổ và xương quai xanh.',
          'Dùng sáng và tối. Ban ngày chờ kem ngồi da rồi mới bôi chống nắng.'
        ],
        notes: ['Không thay kem chống nắng.', 'Nếu da đang bong tróc sau liệu trình, dùng lượng mỏng và hỏi bác sĩ.'],
        gallery: [
          'Hũ kem Botanical Rose Renewal trên đá',
          'Tinh chất Luminous Elixir',
          'Toner cánh hoa hồng',
          'Kem chống nắng Luxury Sunscreen'
        ]
      },
      'rose-petal-toner': {
        subtitle: 'Botanica Flora',
        description: 'Toner cánh hoa hồng cấp ẩm, làm dịu và đánh thức làn da trước serum.',
        imageAlt: 'Chai toner Botanica Flora ngâm cánh hoa hồng',
        badge: 'Cấp ẩm',
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
          { title: 'Cấp ẩm tức thì', text: 'Da bớt căng khô ngay sau khi vỗ.' },
          { title: 'Làm dịu', text: 'Hợp da vừa treatment, cần bước chăm nhẹ.' },
          { title: 'Da thông thoáng', text: 'Không để lại màng nhờn trước serum.' }
        ],
        ingredients: ['Nước hoa hồng', 'Cánh hoa hồng', 'Glycerin thực vật', 'Panthenol', 'Không cồn khô'],
        usage: [
          'Sau sữa rửa mặt, đổ ra lòng bàn tay hoặc bông cotton.',
          'Vỗ nhẹ đến khi da ẩm, không chà.',
          'Tiếp serum khi da còn hơi ẩm.'
        ],
        notes: ['Đậy nắp kín để cánh hoa không oxy hóa.', 'Lắc nhẹ trước khi dùng nếu cánh hoa lắng đáy.'],
        gallery: [
          'Chai toner Botanica Flora trên bàn đá',
          'Tinh chất Luminous Elixir',
          'Kem Botanical Rose Renewal',
          'Mặt nạ biocellulose'
        ]
      },
      'biocellulose-mask': {
        subtitle: 'Mặt nạ phục hồi',
        description: 'Mặt nạ biocellulose ôm sát da, cấp ẩm tức thì sau liệu trình tại phòng khám.',
        imageAlt: 'Hộp và gói mặt nạ Deluxe Spa Facial Biocellulose Mask',
        badge: 'Phục hồi',
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
          { title: 'Phục hồi', text: 'Xoa dịu da khô, căng sau treatment.' },
          { title: 'Cấp ẩm đậm', text: 'Một lần đắp đủ cho da thiếu nước.' },
          { title: 'Da mịn hơn', text: 'Bề mặt mềm, dễ nhận kem dưỡng sau đó.' }
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
          'Hộp và gói mặt nạ Deluxe Spa Facial',
          'Toner cánh hoa hồng',
          'Kem tái tạo hoa hồng',
          'Tinh chất Luminous Elixir'
        ]
      },
      'luxury-sunscreen': {
        subtitle: 'Radiance Defense',
        description: 'Kem chống nắng phổ rộng SPF 50+ PA++++, finish sáng, nhẹ và không bết.',
        imageAlt: 'Tuýp kem chống nắng Luxury Sunscreen SPF 50+ của Dr Tina Beauty',
        badge: 'SPF 50+',
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
          { title: 'Chống nắng phổ rộng', text: 'Che UVA và UVB trong sinh hoạt hàng ngày.' },
          { title: 'Đã kiểm nghiệm', text: 'Công thức lâm sàng, kiểm tra trên da.' },
          { title: 'Finish sáng', text: 'Da trông tươi, không bóng dầu gắt.' }
        ],
        ingredients: ['Màng lọc phổ rộng', 'Chất dưỡng ẩm nhẹ', 'Vitamin E', 'Không oxybenzone'],
        usage: [
          'Dùng sau kem dưỡng, trước trang điểm.',
          'Lấy hai ngón tay cho mặt và cổ, tán đều.',
          'Dặm lại sau 2 giờ nếu ra nắng hoặc ra nhiều mồ hôi.'
        ],
        notes: ['Chống nắng không thay mũ và kính khi đứng nắng gắt.', 'Tẩy trang kỹ vào buổi tối.'],
        gallery: [
          'Tuýp kem chống nắng Luxury Sunscreen trên vải lanh',
          'Kem dưỡng Botanical Rose Renewal',
          'Kem mắt Peptide Firming Eye',
          'Tinh chất Luminous Elixir'
        ]
      },
      'peptide-firming-eye': {
        subtitle: 'Kem mắt săn chắc',
        description: 'Kem mắt peptide giảm quầng thâm và nếp nhăn, đầu massage mát dịu.',
        imageAlt: 'Tuýp kem mắt Peptide Firming Eye màu vàng hồng',
        badge: 'Dưỡng mắt',
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
          { title: 'Vùng mắt mềm hơn', text: 'Giảm cảm giác khô, kéo ở đuôi mắt.' },
          { title: 'Peptide', text: 'Hỗ trợ da mỏng trông săn và đủ ẩm.' },
          { title: 'Dịu, không hương', text: 'Hợp da dễ phản ứng quanh mắt.' }
        ],
        ingredients: ['Peptide', 'Chất dưỡng ẩm', 'Vitamin E', 'Không hương liệu'],
        usage: [
          'Lấy một chấm nhỏ ra đầu applicator hoặc ngón áp út.',
          'Chấm quanh xương hốc mắt, không miết vào mí.',
          'Vỗ nhẹ đến khi thấm. Dùng trước kem dưỡng mặt.'
        ],
        notes: ['Không dùng lên mí mắt đang viêm.', 'Nếu bị rát, ngưng và hỏi bác sĩ trước lần dùng tiếp.'],
        gallery: [
          'Tuýp kem mắt Peptide Firming Eye trên đá',
          'Tinh chất Luminous Elixir',
          'Kem chống nắng Luxury Sunscreen',
          'Kem Botanical Rose Renewal'
        ]
      }
    }
  },
  login: {
    imageAlt: 'Không gian trị liệu Dr Tina Beauty',
    energySpace: 'Không gian phục hồi năng lượng',
    heroLead: 'Nơi tái sinh ',
    heroAccent: 'vẻ đẹp tự nhiên',
    heroTail: ' & sự tĩnh tại.',
    heroText:
      'Điểm nhấn trong không gian kiến trúc trị liệu tối giản, nâng niu làn da bằng công nghệ thẩm mỹ chuyên sâu cùng các nghi thức dưỡng tâm an hòa.',
    expertsTitle: '100% Chuyên gia Y khoa',
    expertsText: 'Quy chuẩn vô khuẩn và liệu trình cá nhân hóa',
    location: 'Quận 1, Thành phố Hồ Chí Minh',
    backHome: 'Quay lại trang chủ',
    support: 'Hỗ trợ đặt hẹn: 1900 1234',
    welcomeBack: 'Chào mừng bạn trở lại',
    createAccount: 'Tạo tài khoản hội viên',
    loginIntro: 'Đăng nhập để quản lý lịch hẹn, theo dõi phác đồ trị liệu và các đặc quyền hội viên của bạn.',
    registerIntro: 'Đăng ký bằng số điện thoại để đặt lịch và theo dõi liệu trình tại Dr Tina Beauty.',
    accountType: 'Hình thức tài khoản',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    processing: 'Đang xử lý...',
    fullName: 'Họ và tên',
    fullNamePlaceholder: 'Nhập họ và tên',
    phone: 'Số điện thoại',
    phoneHint: '9–15 chữ số',
    phonePlaceholder: 'Nhập số điện thoại (ví dụ: 0901 234 567)',
    password: 'Mật khẩu',
    passwordHintLogin: 'Mật khẩu tài khoản',
    passwordHintRegister: 'Tối thiểu 8 ký tự',
    passwordPlaceholder: 'Nhập mật khẩu',
    showPassword: 'Hiện mật khẩu',
    hidePassword: 'Ẩn mật khẩu',
    errors: {
      phone: 'Số điện thoại không hợp lệ.',
      fullName: 'Họ tên cần ít nhất 2 ký tự.',
      password: 'Mật khẩu cần ít nhất 8 ký tự.',
      network: 'Không thể kết nối máy chủ. Vui lòng thử lại.'
    },
    legal: {
      terms: 'Điều khoản dịch vụ',
      privacy: 'Bảo mật thông tin',
      process: 'Quy trình trị liệu'
    }
  }
}

export default vi
