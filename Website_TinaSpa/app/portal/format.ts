export function formatPortalDate(date: Date) {
  const weekday = new Intl.DateTimeFormat('vi-VN', { weekday: 'long' }).format(date)
  const label = weekday.charAt(0).toUpperCase() + weekday.slice(1)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${label}, ${day} Tháng ${month}, ${date.getFullYear()}`
}
