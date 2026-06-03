export function getTimeGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function getDisplayName(name?: string | null, email?: string | null) {
  if (name?.trim()) return name.trim().split(" ")[0];
  if (email?.trim()) return email.split("@")[0];
  return null;
}