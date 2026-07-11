export function isProfileComplete(user: {
  phone?: string | null;
  email?: string | null;
  password?: string | null;
  authProvider?: string;
}) {
  if (user.authProvider === "google") {
    return Boolean(user.email);
  }
  return Boolean(user.email && user.password);
}
