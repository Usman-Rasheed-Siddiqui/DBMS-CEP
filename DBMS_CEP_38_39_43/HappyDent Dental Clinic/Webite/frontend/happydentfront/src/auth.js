export const login = (accessToken, refreshToken, user, staff_role) => {
  localStorage.setItem("token", accessToken);
  localStorage.setItem("refresh", refreshToken);
  localStorage.setItem("user", user);

  localStorage.setItem(
    "staff_role",
    staff_role || ""
  );

};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("user");
  localStorage.removeItem("staff_role");
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};