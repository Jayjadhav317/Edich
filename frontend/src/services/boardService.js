import api from "./api";

const createBoard = async (title) => {
  const response = await api.post("/drawings", { title });
  return response.data;
};

const getBoards = async () => {
  const response = await api.get("/drawings");
  return response.data;
};

const getBoardById = async (id) => {
  const response = await api.get(`/drawings/${id}`);
  return response.data;
};

const updateBoard = async (id, title, elements) => {
  const response = await api.put(`/drawings/${id}`, { title, elements });
  return response.data;
};

const deleteBoard = async (id) => {
  const response = await api.delete(`/drawings/${id}`);
  return response.data;
};

const shareBoard = async (id, email) => {
  const response = await api.post(`/drawings/${id}/share`, { email });
  return response.data;
};

const leaveBoard = async (id) => {
  const response = await api.post(`/drawings/${id}/leave`);
  return response.data;
};

export const boardService = {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  shareBoard,
  leaveBoard,
};
