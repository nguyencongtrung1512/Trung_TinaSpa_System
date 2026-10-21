export const SettingKey = {
  POPUP_BANNER: 'popupBanner',
  HOME_TEAM: 'homeTeam',
  HOME_PROCESS: 'homeProcess',
} as const;

/** Popup image shown once per visit when a customer opens the website. */
export interface PopupBannerSetting {
  enabled: boolean;
  image: string | null;
  imageAlt: string | null;
  /** Optional link opened when the image is clicked. */
  link: string | null;
}

export const DEFAULT_POPUP_BANNER: PopupBannerSetting = {
  enabled: false,
  image: null,
  imageAlt: null,
  link: null,
};

/** One card in the homepage "Người đồng hành cùng bạn" section. */
export interface HomeTeamMember {
  nameVietnamese: string;
  nameEnglish: string | null;
  roleVietnamese: string;
  roleEnglish: string | null;
  image: string;
}

export interface HomeTeamSetting {
  members: HomeTeamMember[];
}

export const HOME_TEAM_MAX_MEMBERS = 6;

/** Content the website shipped with before the section became editable. */
export const DEFAULT_HOME_TEAM: HomeTeamSetting = {
  members: [
    {
      nameVietnamese: 'BS. Nguyễn Lan',
      nameEnglish: 'Dr. Nguyen Lan',
      roleVietnamese: 'Bác sĩ thẩm mỹ',
      roleEnglish: 'Aesthetic doctor',
      image: '/images/image 1.png',
    },
    {
      nameVietnamese: 'Chuyên gia chăm sóc da',
      nameEnglish: 'Skin care specialist',
      roleVietnamese: 'Liệu trình chuyên sâu',
      roleEnglish: 'Advanced treatments',
      image: '/images/imageLoan.jpg',
    },
    {
      nameVietnamese: 'Kỹ thuật viên spa',
      nameEnglish: 'Spa technician',
      roleVietnamese: 'Trải nghiệm thư giãn',
      roleEnglish: 'Relaxing experiences',
      image: '/images/screen.png',
    },
  ],
};

/** Material Symbols the admin can pick for a process step. */
export const HOME_PROCESS_ICONS = [
  'calendar_month',
  'event_available',
  'support_agent',
  'chat',
  'stethoscope',
  'medical_services',
  'science',
  'healing',
  'spa',
  'face',
  'self_care',
  'clean_hands',
  'water_drop',
  'auto_awesome',
  'favorite',
  'verified',
  'monitoring',
  'home_health',
] as const;

/** One step in the homepage "Quy trình làm việc" section; the step number comes from its position. */
export interface HomeProcessStep {
  icon: (typeof HOME_PROCESS_ICONS)[number];
  titleVietnamese: string;
  titleEnglish: string | null;
  descriptionVietnamese: string;
  descriptionEnglish: string | null;
}

export interface HomeProcessSetting {
  steps: HomeProcessStep[];
}

export const HOME_PROCESS_MAX_STEPS = 8;

export const DEFAULT_HOME_PROCESS: HomeProcessSetting = {
  steps: [
    {
      icon: 'calendar_month',
      titleVietnamese: 'Đặt lịch hẹn',
      titleEnglish: 'Book an appointment',
      descriptionVietnamese:
        'Chọn khung giờ phù hợp. Phòng khám xác nhận và nhắc lịch trước buổi tư vấn.',
      descriptionEnglish:
        'Choose a convenient time. The clinic confirms and reminds you before the consultation.',
    },
    {
      icon: 'stethoscope',
      titleVietnamese: 'Tư vấn bác sĩ',
      titleEnglish: 'Doctor consultation',
      descriptionVietnamese:
        'Khám da, nghe mong muốn và nhận đề xuất liệu trình kèm lưu ý chăm sóc.',
      descriptionEnglish:
        'Skin exam, listening to your goals and a treatment proposal with care notes.',
    },
    {
      icon: 'healing',
      titleVietnamese: 'Thực hiện liệu trình',
      titleEnglish: 'Treatment',
      descriptionVietnamese:
        'Kỹ thuật viên và bác sĩ phối hợp trong không gian riêng, đúng phác đồ đã thống nhất.',
      descriptionEnglish:
        'Technicians and doctors work together in a private room, following the agreed plan.',
    },
    {
      icon: 'monitoring',
      titleVietnamese: 'Chăm sóc sau điều trị',
      titleEnglish: 'Aftercare',
      descriptionVietnamese:
        'Theo dõi phản ứng da, hướng dẫn dưỡng tại nhà và hẹn tái khám khi cần.',
      descriptionEnglish:
        'Monitoring skin response, at-home care guidance and follow-up visits when needed.',
    },
  ],
};
