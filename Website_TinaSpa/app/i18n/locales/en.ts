import type vi from './vi'

const en: typeof vi = {
  common: {
    bookNow: 'Book now',
    login: 'Sign in',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    mainNav: 'Main navigation',
    mobileNav: 'Mobile menu',
    language: 'Language',
    viewAll: 'View all',
    close: 'Close',
    promotion: 'Promotion'
  },
  meta: {
    home: {
      title: 'Dr Tina Beauty — Professional beauty care',
      description:
        'Dr Tina Beauty aesthetic clinic. Dr. Nguyen Lann advises on skin treatments, rejuvenation and medical spa care.'
    },
    about: {
      title: 'About — Dr Tina Beauty',
      description: 'The core values of Dr Tina Beauty: authenticity, harmony, healing and refinement.'
    },
    services: {
      title: 'Services — Dr Tina Beauty',
      description: 'The Dr Tina Beauty care menu: combo packages, manicure and pedicure with detailed pricing.'
    },
    contact: {
      title: 'Contact — Dr Tina Beauty',
      description:
        'Addresses, hotlines, opening hours and directions to TinaSpa locations in Ho Chi Minh City and Hanoi.'
    },
    products: {
      title: 'Products — Dr Tina Beauty',
      description:
        'Serums, moisturizers, sunscreens and recovery masks selected by Dr Tina Beauty for post-treatment skin.'
    },
    productNotFound: 'Product not found — Dr Tina Beauty',
    booking: {
      title: 'Book an appointment — Dr Tina Beauty',
      description: 'Take a moment for yourself. Book a beauty care appointment with Dr Tina Beauty.'
    },
    login: {
      title: 'Sign in — Dr Tina Beauty',
      description:
        'Sign in or register for the Dr Tina Beauty client portal to manage appointments and treatment plans.'
    },
    account: {
      title: 'My profile — Dr Tina Beauty',
      description: 'Update the personal details in your Dr Tina Beauty account.'
    }
  },
  account: {
    eyebrow: 'My account',
    title: 'Personal profile',
    intro:
      'Keep your details up to date so Dr Tina can care for you better and follow every medical-grade beauty treatment in detail.',
    portalLink: 'Open work portal',
    logout: 'Sign out',
    phone: 'Phone number',
    phoneHint: 'Contact the clinic if you need to change your phone number.',
    fullName: 'Full name',
    gender: 'Gender',
    genderNone: 'Not specified',
    genders: { FEMALE: 'Female', MALE: 'Male', OTHER: 'Other' },
    dateOfBirth: 'Date of birth',
    age: '{{count}} years old',
    address: 'Address for care materials',
    addressPlaceholder: 'Street, ward, district, city',
    avatar: 'Profile photo',
    avatarUpload: {
      choose: 'Choose photo',
      replace: 'Change photo',
      uploading: 'Uploading',
      hint: 'JPG, PNG, WEBP, GIF · up to {{size}} MB. Press "Save profile" to apply.',
      preview: 'View profile photo',
      pending: 'New photo uploaded. Press "Save profile" to update your profile photo.',
      failed: 'Upload failed. Please try again.'
    },
    save: 'Save profile',
    saving: 'Saving...',
    saved: 'Profile updated.',
    retry: 'Try again',
    memberSince: 'Member since {{date}}',
    roles: { CUSTOMER: 'Loyal client', STAFF: 'Staff', MANAGER: 'Manager', ADMIN: 'Administrator' },
    usedServices: {
      title: 'Services used',
      intro: 'Services our team has recorded for you after each visit.',
      empty: 'No services have been recorded for you yet.',
      quantity: 'Quantity: {{count}}',
      staffNote: 'Note from our team',
      total: '{{count}} services',
      prev: 'Previous',
      next: 'Next',
      page: 'Page {{page}}/{{pages}}',
      loading: 'Loading...',
      error: 'Could not load your services. Please try again.'
    },
    password: {
      title: 'Change password',
      open: 'Change password',
      description: 'Enter your current password and a new one to keep your account secure.',
      lengthHint: 'At least 8 characters.',
      cancel: 'Cancel',
      show: 'Show password',
      hide: 'Hide password',
      notice:
        'Your account still uses the default password (your phone number). Please change it to keep your account secure.',
      current: 'Current password',
      next: 'New password',
      confirm: 'Repeat new password',
      submit: 'Change password',
      submitting: 'Changing...',
      success: 'Password changed.',
      errors: {
        current: 'Please enter your current password.',
        length: 'New password needs at least 8 characters.',
        match: 'The passwords do not match.',
        failed: 'Could not change your password. Please try again.'
      }
    },
    errors: {
      fullName: 'Full name needs at least 2 characters.',
      dateOfBirth: 'Date of birth cannot be in the future.',
      load: 'Could not load your profile. Please try again.',
      save: 'Could not save your profile. Please try again.'
    }
  },
  staffServices: {
    title: 'Client services',
    intro:
      'Enter a phone number to find or create a client account, then record the services the client used. Clients can review them on their Profile page.',
    phoneLabel: 'Client name or phone number',
    phonePlaceholder: 'Type a name to pick a client, or enter a phone (e.g. 0901 234 567)',
    search: 'Find client',
    searching: 'Searching...',
    noAccount: 'No account for {{phone}} yet',
    noAccountHint:
      'Create an account to record services. The initial password is the phone number and the client must change it at first sign-in.',
    appointmentLine: 'Booking {{date}} {{time}} — {{name}}',
    fullName: 'Client full name',
    createAccount: 'Create account',
    creating: 'Creating...',
    created:
      'Account created. The initial password is the client phone number; the client will be asked to change it on sign-in.',
    customerMeta: '{{phone}} · ID {{id}}',
    defaultPassword: 'Default password not changed',
    addTitle: 'Add services used',
    serviceN: 'Service {{n}}',
    chooseService: 'Choose a service',
    searchService: 'Search services...',
    otherCategory: 'Other',
    quantity: 'Quantity',
    removeLine: 'Remove row {{n}}',
    noteLabel: 'Note for the client (optional)',
    notePlaceholder: 'Advice, results, aftercare tips...',
    addLine: 'Add row',
    usedDate: 'Date used',
    estimate: 'Estimate:',
    save: 'Save services',
    saving: 'Saving...',
    saved: 'Recorded {{count}} services for {{name}}.',
    historyTitle: 'Services used',
    loading: 'Loading...',
    historyEmpty: 'No services have been recorded for this client yet.',
    remove: 'Delete',
    removeTitle: 'Remove service from profile',
    removeMessage: 'Remove {{name}} from the client profile? The client will no longer see it.',
    removed: 'Service removed from the client profile.',
    errors: {
      phone: 'Pick a client from the suggestions, or enter a full phone number (starts with 0 or +84, 9–11 digits).',
      fullName: 'Enter the client full name (at least 2 characters).',
      pickService: 'Pick a service on every row or remove empty rows.',
      futureDate: 'The date used cannot be in the future.',
      catalog: 'Could not load the service catalog.',
      history: 'Could not load the service history.',
      lookup: 'Could not look up the client.',
      create: 'Could not create the account.',
      save: 'Could not save the services.',
      remove: 'Could not remove the service.'
    }
  },
  error: {
    title: 'Something went wrong',
    details: 'An unexpected error occurred.',
    generic: 'Error',
    notFound: 'The page you are looking for could not be found.'
  },
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    products: 'Products',
    contact: 'Contact',
    booking: 'Booking'
  },
  brand: {
    address: 'Ho Chi Minh City'
  },
  footer: {
    tagline: 'A warm aesthetic clinic where doctors and spa rituals come together for lasting skin care.',
    explore: 'Explore',
    services: 'Services',
    contact: 'Contact',
    copyright: 'Preserving your natural beauty.'
  },
  hero: {
    eyebrow: 'Welcome to Dr Tina Beauty',
    title: 'Professional, caring beauty treatments',
    description:
      'A clinic that blends medical aesthetics with a calm spa atmosphere. Dr. Nguyen Lann guides you from skin consultation to a personalized treatment plan.',
    primaryCta: 'Book now',
    secondaryCta: 'Learn more',
    portraitAlt: 'Dr. Nguyen Loan - aesthetic doctor at Dr Tina Beauty',
    videoLabel: 'Dr Tina Beauty introduction video',
    playVideo: 'Play video',
    pauseVideo: 'Pause video',
    unmuteVideo: 'Turn sound on',
    muteVideo: 'Turn sound off'
  },
  stats: {
    experience: 'Years of experience',
    customers: 'Trusted clients',
    treatments: 'Advanced treatments',
    groups: 'Aesthetic service groups'
  },
  services: {
    skinExam: {
      title: 'Comprehensive skin exam',
      description: 'Assess your skin, identify root causes and set the right plan before any treatment.'
    },
    acne: {
      title: 'Acne treatment',
      description: 'Medical treatments that calm inflammation, control oil and restore the skin barrier.'
    },
    rejuvenation: {
      title: 'Skin rejuvenation',
      description: 'Rejuvenation technology for firmer, smoother, more even and healthier skin over time.'
    },
    laser: {
      title: 'Aesthetic laser',
      description: 'Helps with melasma, scars, pores and pigmentation under a doctor’s supervision.'
    },
    body: {
      title: 'Body care',
      description: 'Relaxing rituals combined with in-depth body care after a long day.'
    },
    consult: {
      title: 'Treatment consultation',
      description: 'A personalized plan built around your beauty goals, budget and daily schedule.'
    }
  },
  serviceMenus: {
    combo: {
      title: 'Combo Packages',
      imageAlt: 'Combo care package at Dr Tina Beauty',
      items: {
        perfectlyPolished: {
          summary: 'Manicure or pedicure with intensive hand care',
          description:
            'Cuticle care, shaping and polish for hands or feet, finished with a hydrating mask and a 10-minute hand massage for soft skin.'
        },
        glowRelax: {
          summary: 'Basic facial combined with a neck and shoulder massage',
          description:
            'Deep cleansing, gentle exfoliation, a hydrating mask and a 20-minute neck and shoulder massage to release tension.'
        },
        handFootRitual: {
          summary: 'Gel mani + pedi combo with a relaxing herbal soak',
          description:
            'Warm herbal foot soak, hand and toenail care, long-lasting gel polish for 3–4 weeks plus heel care.'
        },
        bridalBeautyDay: {
          summary: 'A full beauty day for brides before the wedding',
          description:
            'Restorative facial, nails with light crystal accents, a relaxing body massage and skin care advice before the big day.'
        }
      }
    },
    manicure: {
      title: 'Manicure',
      imageAlt: 'Manicure services at Dr Tina Beauty',
      items: {
        classicManicure: {
          summary: 'Fresh color (mani or pedi), cuticle care and nail shaping',
          description: 'Hand soak, cuticle care, shaping and regular polish from the Dr Tina Beauty seasonal palette.'
        },
        gelPolish: {
          summary: 'Long-lasting, glossy gel polish for up to 4 weeks',
          description: 'Premium odorless gel polish, quick LED curing, keeping a glossy finish for 3 to 4 weeks.'
        },
        frenchTip: {
          summary: 'Elegant French tips with an optional gold shimmer line',
          description: 'White or nude French tips, with an optional fine gold shimmer line for special occasions.'
        },
        nailArt: {
          summary: 'Artistic nail designs from our samples or your own ideas',
          description: 'Hand-painted florals, ombre or light crystals, based on our designs or your own ideas.'
        },
        nailRepair: {
          summary: 'Restores weak, broken nails or nails after gel removal',
          description: 'A keratin repair layer, cuticle oil treatment and at-home nail care guidance.'
        },
        paraffinHandCare: {
          summary: 'Warm paraffin wax for instantly soft hands',
          description: 'Hand exfoliation, a 15-minute warm paraffin wrap and moisturizer for softer, brighter hands.'
        }
      }
    },
    pedicure: {
      title: 'Pedicure',
      imageAlt: 'Pedicure services at Dr Tina Beauty',
      items: {
        spaPedicure: {
          summary: 'Herbal foot soak, heel scrub and polish',
          description:
            'Warm herbal foot soak, heel scrub, cuticle care and polish, finished with a 10-minute foot massage.'
        },
        gelPedicure: {
          summary: 'Toenail care with long-lasting gel polish',
          description: 'The Spa Pedicure routine with durable gel polish, perfect for beach trips or holidays.'
        },
        callusTreatment: {
          summary: 'Softens and removes heel calluses',
          description: 'Calluses are softened with a professional solution, gently buffed and deeply moisturized.'
        },
        detoxFootRitual: {
          summary: 'Mineral salt soak, mud wrap and acupressure massage',
          description:
            'Mineral salt soak, detoxifying mineral mud and acupressure foot massage for better sleep and less tired feet.'
        }
      }
    }
  },
  homeServices: {
    eyebrow: 'Featured services',
    title: 'Complete care, elevated value',
    viewMenu: 'View the full menu',
    summary: '{{count}} services · from {{price}}'
  },
  process: {
    eyebrow: 'How we work',
    title: '{{count}} steps together',
    description: 'Every step is clear, with someone by your side from the first visit to the very end.',
    steps: {
      book: {
        title: 'Book an appointment',
        description: 'Choose a convenient time. The clinic confirms and reminds you before the consultation.'
      },
      consult: {
        title: 'Doctor consultation',
        description: 'Skin exam, listening to your goals and a treatment proposal with care notes.'
      },
      treat: {
        title: 'Treatment',
        description: 'Technicians and doctors work together in a private room, following the agreed plan.'
      },
      aftercare: {
        title: 'Aftercare',
        description: 'Monitoring skin response, at-home care guidance and follow-up visits when needed.'
      }
    }
  },
  team: {
    eyebrow: 'Our specialists',
    title: 'The people by your side',
    members: {
      doctor: {
        name: 'Dr. Nguyen Lann',
        role: 'Aesthetic doctor',
        imageAlt: 'Portrait of Dr. Nguyen Lann'
      },
      skinExpert: {
        name: 'Skin care specialist',
        role: 'Advanced treatments',
        imageAlt: 'Skin care treatment room'
      },
      spaTechnician: {
        name: 'Spa technician',
        role: 'Relaxing experiences',
        imageAlt: 'Dr Tina Beauty spa space'
      }
    }
  },
  testimonials: {
    eyebrow: 'What clients say',
    title: 'Real feedback after treatment',
    items: {
      minhAnh: {
        quote: 'A clear consultation with no pressure to buy. My skin is calmer after the acne treatment.',
        detail: 'Skin treatment client'
      },
      thuHa: {
        quote: 'Quiet and clean. I felt at ease because the doctor explained every step before starting.',
        detail: 'Rejuvenation client'
      },
      lanPhuong: {
        quote: 'Appointments on time and thoughtful aftercare. I will be back for my next treatment.',
        detail: 'Regular care client'
      }
    }
  },
  results: {
    eyebrow: 'PROVEN RESULTS',
    title: 'Real results',
    description: 'Each client’s transformation is measured with transparent clinical indicators.',
    sessions: 'Sessions',
    duration: 'Duration',
    viewJourney: 'VIEW THE JOURNEY',
    sliderLabel: 'Before and after comparison. Drag right to see before, drag left to see after.',
    before: 'BEFORE',
    after: 'AFTER',
    caseLabel: 'Case {{n}}',
    sessionsValue: '{{value}} sessions',
    durationValue: '{{count}} weeks',
    beforeAlt: 'Before the treatment: {{title}}',
    afterAlt: 'After the treatment: {{title}}'
  },
  cta: {
    title: 'Book a healing appointment',
    description:
      'Come to Tina Spa to unwind and refresh yourself. Beauty starts with the smallest things and reaches all the way to the soul.',
    button: 'Book an experience'
  },
  about: {
    imageMainAlt: 'Relaxing treatment space at Dr Tina Beauty',
    imageSideAlt: 'Skin care corner in the treatment room',
    badge: 'Sanctuary ritual',
    spaceTitle: 'A Pure Space',
    spaceText: 'Relax the mind · Awaken your inner beauty',
    eyebrow: 'Core values',
    titleLead: 'Radiating Inner',
    titleAccent: 'Essence',
    intro:
      'A beauty philosophy rooted in deep understanding, combining precise medical expertise with the gentle art of restoring your skin and presence.',
    values: {
      '01': {
        title: 'Authenticity',
        description:
          'Every service is delivered with care and sincerity, never ostentatious, bringing only the purest for body and mind.'
      },
      '02': {
        title: 'Harmony',
        description:
          'Our space, people and treatments all seek balance — between modern and traditional, body and spirit.'
      },
      '03': {
        title: 'Healing',
        description:
          'Treatments are designed to release stress, restore energy and bring you back to a state of complete calm.'
      },
      '04': {
        title: 'Refinement',
        description:
          'Attention to every detail, from scent and lighting to each therapeutic movement — all to cherish your experience.'
      }
    },
    signatureEyebrow: 'What makes us unique',
    signatureTitle: 'Only At',
    signatureIntro:
      'Three distinctive values create a serene experience and a pure transformation from the mind to the skin.',
    signatures: {
      spa: {
        lead: 'Safe, ',
        accent: 'gentle products',
        description: 'We are committed to vegan, non-toxic and eco-friendly products.'
      },
      fingerprint: {
        lead: '',
        accent: 'Personalized service',
        description: 'Every client is heard and receives a treatment plan tailored to their skin’s needs.'
      },
      self_improvement: {
        lead: 'Healing from ',
        accent: 'within',
        description: 'A tranquil space that helps you let go of stress and recharge with positive energy.'
      }
    }
  },
  servicesPage: {
    eyebrow: 'Our services',
    title: 'Care menu',
    description: 'Choose a treatment that fits your needs and tap the plus sign to see each service in detail.',
    groups: 'Service groups',
    all: 'ALL',
    searchPlaceholder: 'Search services...',
    empty: 'No services match "{{query}}"',
    loading: 'Loading services',
    loadError: 'Could not load the services. Please try again.',
    retry: 'Try again',
    noServices: 'No services are available yet. Please check back later.'
  },
  contact: {
    titleLead: 'Connect With',
    intro:
      'We are always ready to accompany you on your journey of caring for and loving your skin — where rigorous dermatology meets the art of natural healing.',
    eyebrow: 'Directions & location',
    findUs: 'Find Your Way to TinaSpa',
    chooseBranch: 'Choose a location',
    address: 'Address',
    hotline: 'Advice hotline',
    email: 'Email',
    hours: 'Opening hours',
    bookHere: 'Book at this location',
    directions: 'Get Directions on Google Maps',
    branches: {
      q1: {
        tab: 'Location 01: District 1, HCMC',
        name: 'TinaSpa Ben Nghe — District 1',
        address: '12 Nguyen Hue, Ben Nghe Ward, District 1, Ho Chi Minh City',
        hours: 'Monday – Sunday: 08:00 – 20:00',
        imageAlt: 'TinaSpa District 1 treatment room'
      },
      hn: {
        tab: 'Location 02: Hoan Kiem, Hanoi',
        name: 'TinaSpa Trang Tien — Hoan Kiem',
        address: '45 Ly Thuong Kiet, Hang Bai Ward, Hoan Kiem District, Hanoi',
        hours: 'Monday – Sunday: 09:00 – 21:00',
        imageAlt: 'TinaSpa Hoan Kiem treatment room'
      }
    }
  },
  booking: {
    title: 'Book an appointment',
    tagline: 'Take a little time for yourself',
    intro: 'Relax, recharge and care for your beauty with Dr Tina Beauty.',
    introMore: 'We are always here to support you on your journey to a more confident, radiant you.',
    motto: 'More beautiful · Healthier · Happier',
    thanks: 'Thank you, {{name}}',
    confirmation:
      'Your appointment at {{branch}} on {{date}} at {{time}} has been received. We will call {{phone}} to confirm with you.',
    code: 'Booking code: {{code}}',
    openHours: 'Opening hours: {{open}} – {{close}}',
    fields: {
      name: 'Full name',
      namePlaceholder: 'Enter your full name',
      phone: 'Phone number',
      phonePlaceholder: 'Enter your phone number',
      branch: 'Location',
      branchPlaceholder: 'Choose a location',
      date: 'Preferred date',
      time: 'Time',
      timePlaceholder: 'Choose a time',
      timeNeedBranch: 'Choose a location first',
      timeNone: 'No more times available today',
      note: 'Notes',
      notePlaceholder: 'Leave a note (optional)'
    },
    errors: {
      name: 'Please tell us your full name.',
      phone: 'The phone number is not valid.',
      branch: 'Please choose the location you want to visit.',
      branchesLoad: 'Could not load locations. Please reload the page.',
      date: 'Please choose a preferred date.',
      datePast: 'The appointment date must be today or later.',
      time: 'Please choose a time.',
      submit: 'Could not send your booking. Please try again.'
    },
    submit: 'Confirm booking',
    submitting: 'Sending...',
    toast: {
      sending: 'Sending your booking...',
      success: 'Booking received',
      successMessage: '{{time}} on {{date}}. We will call you to confirm soon.',
      error: 'Booking not sent'
    },
    contactNote: 'We will contact you to confirm your appointment.'
  },
  products: {
    categories: {
      all: 'All products',
      serum: 'Essences & serums',
      cream: 'Moisturizers & renewal',
      sunscreen: 'Sunscreen',
      mask: 'Recovery masks',
      eye: 'Eye care'
    },
    sort: {
      newest: 'Newest',
      'price-asc': 'Price: low to high',
      'price-desc': 'Price: high to low',
      rating: 'Top rated'
    },
    priceFilters: {
      all: 'All prices',
      'under-500': 'Under 500,000đ',
      '500-700': '500,000đ – 700,000đ',
      'over-700': 'Over 700,000đ'
    },
    list: {
      eyebrow: 'Skin care collection',
      title: 'Dr Tina Beauty Products',
      description: 'Serums, moisturizers, sunscreens and recovery masks chosen by the clinic for post-treatment care.',
      groups: 'Product groups',
      search: 'Search products',
      searchPlaceholder: 'Search serums, moisturizers, masks...',
      sortLabel: 'Sort',
      sortAria: 'Sort products',
      priceLabel: 'Price',
      priceAria: 'Filter by price range',
      layout: 'Display mode',
      grid: 'Grid view',
      listView: 'List view',
      count: '{{count}} products',
      inCart: ' · {{count}} in cart',
      saved: ' · {{count}} saved',
      from: 'From',
      loading: 'Loading products...',
      loadError: 'Could not load products. Please try again.',
      retry: 'Try again',
      pagination: {
        navigation: 'Product pagination',
        previous: 'Previous page',
        next: 'Next page',
        page: 'Page {{page}}',
        summary: 'Showing {{from}}–{{to}} of {{total}} products'
      },
      emptyTitle: 'No products match your filters',
      emptyText: 'Try another keyword or browse the whole collection.',
      showAll: 'View all products',
      save: 'Save {{name}}',
      unsave: 'Remove {{name}} from favorites',
      addToCart: 'Add {{name}} to cart',
      removeFromCart: 'Remove {{name}} from cart',
      added: '{{name}} added to cart.',
      removed: '{{name}} removed from cart.',
      rating: 'Rating ',
      price: 'Price ',
      adviceEyebrow: 'Skin advice',
      adviceTitle: 'Not sure which product suits your skin?',
      adviceText: 'Our doctors listen to your skin concerns and suggest the right routine, so you don’t have to guess.',
      viewTreatments: 'View treatments',
      bookSkinConsult: 'Book a skin consultation'
    },
    detail: {
      breadcrumb: 'Breadcrumb',
      gallery: 'Product images',
      reviews: '{{count}} reviews',
      inStock: 'In stock',
      variants: 'Options',
      decrease: 'Decrease quantity',
      increase: 'Increase quantity',
      quantity: 'Quantity ',
      addToCart: 'Add to cart',
      added: 'Added {{qty}} × {{name}} to cart.',
      info: 'Product information',
      tabs: {
        story: 'Description',
        ingredients: 'Ingredients',
        usage: 'How to use',
        notes: 'Precautions'
      },
      trust: {
        verified: 'Clinically tested',
        spa: 'Gentle ingredients',
        favorite: 'Sensitive skin'
      },
      whyTitle: 'Why the clinic chose this product',
      ingredientsTitle: 'Key ingredients',
      usageTitle: 'How to use at home',
      notesTitle: 'Precautions',
      effectsTitle: 'Key benefits',
      relatedTitle: 'Pairs well with',
      notFoundTitle: 'Product not found',
      notFoundText: 'This product is not in the current collection.',
      backToProducts: 'Back to products'
    },
    items: {
      'luminous-elixir': {
        subtitle: '24K Gold & Active Botanical Serum',
        description: 'A 24K gold and botanical serum for brighter, firmer and more even skin.',
        imageAlt: 'Luminous Elixir serum bottle with a gold cap by Dr Tina Beauty',
        badge: 'Best seller',
        story: [
          'A 24K gold and botanical serum, used after treatments for brighter, firmer and more even-toned skin.',
          'Light, fast-absorbing texture, ideal in the evening or right after toner while skin is still damp.'
        ],
        highlights: [
          'Suspended gold flakes make skin look more radiant after a few weeks of regular use',
          'A light, non-greasy serum that layers easily under moisturizer',
          'Used by the clinic in brightening routines after laser and rejuvenation'
        ],
        effects: [
          { title: 'Bright and even', text: 'Helps dull, tired skin look clearer.' },
          { title: 'Light hydration', text: 'Keeps skin soft so the next actives absorb evenly.' },
          { title: 'Soothing after treatment', text: 'Suitable once skin has settled, with no stinging.' }
        ],
        ingredients: ['24K gold', 'Niacinamide', 'Botanical extracts', 'Hyaluronic acid', 'No harsh fragrance'],
        usage: [
          'Cleanse, apply toner and leave skin slightly damp.',
          'Dispense 3–4 drops into your palm and press gently over face and neck.',
          'Seal with moisturizer. Always use sunscreen during the day.'
        ],
        notes: [
          'Avoid direct contact with eyes. If it gets in the eyes, rinse with clean water.',
          'Stop using and contact the clinic if redness or burning persists.',
          'Store in a dry place away from strong sunlight. Close the cap after each use.'
        ],
        gallery: [
          'Luminous Elixir serum bottle on stone',
          'Botanica Flora rose petal toner bottle',
          'Botanical Rose Renewal cream jar',
          'Dr Tina Beauty biocellulose mask'
        ]
      },
      'rose-renewal-cream': {
        subtitle: 'Rose renewal cream',
        description: 'A moisturizer with rosehip oil and Bulgarian rose that locks in moisture and soothes skin.',
        imageAlt: 'Botanical Rose Renewal Cream jar with a gold lid',
        badge: 'New',
        story: [
          'A renewal cream with rosehip oil and Bulgarian rose that seals in moisture after serum and soothes dehydrated skin.',
          'A light cream that spreads evenly, suitable for normal and dry-leaning combination skin.'
        ],
        highlights: [
          'A light moisture veil that is not sticky at night',
          'A soft rose scent that never overpowers the treatment room',
          'Best paired with toner and serum in the same routine'
        ],
        effects: [
          { title: 'Locks in moisture', text: 'Holds water in the skin after serum and toner.' },
          { title: 'Soothing', text: 'Rose and rosehip help dry, tight skin.' },
          { title: 'Softer skin', text: 'Regular use helps skin feel smoother under makeup.' }
        ],
        ingredients: ['Rosehip oil', 'Bulgarian rose oil', 'Plant butter', 'Vitamin E', 'Light humectants'],
        usage: [
          'Take a pea-sized amount after serum.',
          'Spread from the center outwards, including neck and collarbone.',
          'Use morning and evening. In the day, let it set before applying sunscreen.'
        ],
        notes: [
          'Does not replace sunscreen.',
          'If your skin is peeling after a treatment, apply a thin layer and ask your doctor.'
        ],
        gallery: [
          'Botanical Rose Renewal cream jar on stone',
          'Luminous Elixir serum',
          'Rose petal toner',
          'Luxury Sunscreen'
        ]
      },
      'rose-petal-toner': {
        subtitle: 'Botanica Flora',
        description: 'A rose petal toner that hydrates, soothes and awakens skin before serum.',
        imageAlt: 'Botanica Flora toner bottle with rose petals',
        badge: 'Hydrating',
        story: [
          'A rose petal toner that prepares skin for serum: it hydrates, soothes and lifts away surface dryness.',
          'Pat in with your hands or apply with a cotton pad, depending on whether your skin is sensitive or stable.'
        ],
        highlights: [
          'Rose water infused with real petals, clear and light',
          'Use morning and evening, even on makeup-free days',
          'Prepares skin so serums absorb more evenly'
        ],
        effects: [
          { title: 'Instant hydration', text: 'Skin feels less tight and dry right after patting.' },
          { title: 'Soothing', text: 'Suits freshly treated skin that needs gentle care.' },
          { title: 'Breathable skin', text: 'Leaves no greasy film before serum.' }
        ],
        ingredients: ['Rose water', 'Rose petals', 'Plant glycerin', 'Panthenol', 'No drying alcohol'],
        usage: [
          'After cleansing, pour into your palm or onto a cotton pad.',
          'Pat gently until skin feels damp, without rubbing.',
          'Follow with serum while skin is still slightly damp.'
        ],
        notes: [
          'Close the cap tightly so the petals do not oxidize.',
          'Shake gently before use if the petals settle at the bottom.'
        ],
        gallery: [
          'Botanica Flora toner bottle on a stone table',
          'Luminous Elixir serum',
          'Botanical Rose Renewal cream',
          'Biocellulose mask'
        ]
      },
      'biocellulose-mask': {
        subtitle: 'Recovery mask',
        description: 'A close-fitting biocellulose mask for instant hydration after clinic treatments.',
        imageAlt: 'Box and sachets of the Deluxe Spa Facial Biocellulose Mask',
        badge: 'Recovery',
        story: [
          'A close-fitting biocellulose mask for instant hydration after treatment, once your doctor approves at-home use.',
          'Five sachets per box, used every other day or on the schedule given by the clinic.'
        ],
        highlights: [
          'A thin sheet that follows your face with little dripping',
          'A cool, pleasant feeling after 15 minutes',
          'Best in the evening, when you do not need to go out right away'
        ],
        effects: [
          { title: 'Recovery', text: 'Soothes dry, tight skin after treatment.' },
          { title: 'Deep hydration', text: 'One application is enough for thirsty skin.' },
          { title: 'Smoother skin', text: 'A softer surface that takes moisturizer well.' }
        ],
        ingredients: ['Biocellulose sheet', 'Moisturizing extracts', 'Panthenol', 'Fragrance-free'],
        usage: [
          'Cleanse your face and let it dry.',
          'Open the sachet, unfold the mask and align the eye, nose and mouth openings.',
          'Leave on for 15 minutes, remove and pat in the remaining essence. No need to rinse.'
        ],
        notes: [
          'Single use per sachet.',
          'Do not apply on broken, weeping skin or before your doctor approves actives.'
        ],
        gallery: [
          'Box and sachets of the Deluxe Spa Facial mask',
          'Rose petal toner',
          'Rose renewal cream',
          'Luminous Elixir serum'
        ]
      },
      'luxury-sunscreen': {
        subtitle: 'Radiance Defense',
        description: 'Broad-spectrum SPF 50+ PA++++ sunscreen with a radiant, light, non-sticky finish.',
        imageAlt: 'Dr Tina Beauty Luxury Sunscreen SPF 50+ tube',
        badge: 'SPF 50+',
        story: [
          'Broad-spectrum SPF 50+ PA++++ sunscreen with a radiant finish, a thin layer and no heavy white cast.',
          'The last step every morning, even on days indoors near a window.'
        ],
        highlights: [
          'SPF 50+ PA++++, broad spectrum',
          'A softly radiant finish that works under makeup',
          'A small tube that is easy to carry for reapplication'
        ],
        effects: [
          { title: 'Broad-spectrum protection', text: 'Shields against UVA and UVB in daily life.' },
          { title: 'Clinically tested', text: 'A clinical formula, tested on skin.' },
          { title: 'Radiant finish', text: 'Skin looks fresh without harsh shine.' }
        ],
        ingredients: ['Broad-spectrum filters', 'Light moisturizers', 'Vitamin E', 'Oxybenzone-free'],
        usage: [
          'Apply after moisturizer and before makeup.',
          'Use two finger-lengths for face and neck and spread evenly.',
          'Reapply every 2 hours in the sun or when sweating heavily.'
        ],
        notes: ['Sunscreen does not replace a hat and sunglasses in strong sun.', 'Remove thoroughly in the evening.'],
        gallery: [
          'Luxury Sunscreen tube on linen',
          'Botanical Rose Renewal moisturizer',
          'Peptide Firming Eye cream',
          'Luminous Elixir serum'
        ]
      },
      'peptide-firming-eye': {
        subtitle: 'Firming eye cream',
        description: 'A peptide eye cream that reduces dark circles and fine lines, with a cooling massage tip.',
        imageAlt: 'Rose-gold Peptide Firming Eye cream tube',
        badge: 'Eye care',
        story: [
          'A peptide eye cream that eases dryness around the eyes and helps with dark circles and fine lines with regular use.',
          'The cool tip spreads a tiny amount without tugging the skin.'
        ],
        highlights: [
          'A rice-grain amount is enough for both eyes',
          'Use morning and evening, after serum and before face cream',
          'The applicator tip limits contamination from fingers'
        ],
        effects: [
          { title: 'Softer eye area', text: 'Reduces dryness and tightness at the outer corners.' },
          { title: 'Peptides', text: 'Helps thin skin look firmer and well hydrated.' },
          { title: 'Gentle, fragrance-free', text: 'Suits reactive skin around the eyes.' }
        ],
        ingredients: ['Peptides', 'Moisturizers', 'Vitamin E', 'Fragrance-free'],
        usage: [
          'Place a small dot on the applicator tip or your ring finger.',
          'Dab around the orbital bone without rubbing the eyelids.',
          'Pat gently until absorbed. Use before face moisturizer.'
        ],
        notes: ['Do not use on inflamed eyelids.', 'If it stings, stop and ask your doctor before using it again.'],
        gallery: [
          'Peptide Firming Eye cream tube on stone',
          'Luminous Elixir serum',
          'Luxury Sunscreen',
          'Botanical Rose Renewal cream'
        ]
      }
    }
  },
  login: {
    imageAlt: 'Dr Tina Beauty treatment space',
    energySpace: 'A space to restore your energy',
    heroLead: 'Where ',
    heroAccent: 'natural beauty',
    heroTail: ' & stillness are reborn.',
    heroText:
      'A minimalist therapeutic space that cherishes your skin with advanced aesthetic technology and calming mindful rituals.',
    expertsTitle: '100% Medical Experts',
    expertsText: 'Sterile standards and personalized treatments',
    location: 'District 1, Ho Chi Minh City',
    backHome: 'Back to home',
    support: 'Booking support: 1900 1234',
    welcomeBack: 'Welcome back',
    createAccount: 'Create a member account',
    loginIntro: 'Sign in to manage appointments, follow your treatment plan and enjoy your member benefits.',
    registerIntro: 'Register with your phone number to book and track your treatments at Dr Tina Beauty.',
    accountType: 'Account type',
    login: 'Sign in',
    register: 'Register',
    processing: 'Processing...',
    fullName: 'Full name',
    fullNamePlaceholder: 'Enter your full name',
    phone: 'Phone number',
    phoneHint: '9–15 digits',
    phonePlaceholder: 'Enter your phone number (e.g. 0901 234 567)',
    password: 'Password',
    passwordHintLogin: 'Account password',
    passwordHintRegister: 'At least 8 characters',
    passwordPlaceholder: 'Enter your password',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    errors: {
      phone: 'Invalid phone number.',
      fullName: 'Full name must be at least 2 characters.',
      password: 'Password must be at least 8 characters.',
      network: 'Cannot connect to the server. Please try again.'
    },
    legal: {
      terms: 'Terms of service',
      privacy: 'Privacy policy',
      process: 'Treatment process'
    }
  }
}

export default en
