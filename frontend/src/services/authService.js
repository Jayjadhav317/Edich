import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/users/login", { email, password });
  return response.data;
};

const register = async (name, email, password) => {
  const response = await api.post("/users/signup", { name, email, password });
  return response.data;
};

const getProfile = async () => {
  const response = await api.get("/users/profile");
  return response.data;
};

export const authService = {
  login,
  register,
  getProfile,
};
