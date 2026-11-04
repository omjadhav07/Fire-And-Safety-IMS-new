import api from "../../services/api";

const unwrap = (data) => data?.data ?? data;

const unwrapList = (data, keys = []) => {
  const payload = unwrap(data);
  if (Array.isArray(payload)) return payload;
  for (const k of [...keys, "items", "rows"]) if (Array.isArray(payload?.[k])) return payload[k];
  return [];
};

/* ───────────── Categories ───────────── */

// GET /library/categories
export const getCategories = async (params = {}) => {
  const { data } = await api.get("/library/categories", { params });
  return unwrapList(data, ["categories"]);
};

// POST /library/categories  { name, description }
export const createCategory = async (body) => {
  const { data } = await api.post("/library/categories", body);
  return unwrap(data);
};

// PUT /library/categories/:id  { name, description }
export const updateCategory = async (id, body) => {
  const { data } = await api.put(`/library/categories/${id}`, body);
  return unwrap(data);
};

/* ───────────── Books ───────────── */

// GET /library/books
export const getBooks = async (params = {}) => {
  const { data } = await api.get("/library/books", { params });
  return unwrapList(data, ["books"]);
};

// GET /library/books/:id
export const getBookById = async (id) => {
  const { data } = await api.get(`/library/books/${id}`);
  return unwrap(data)?.book ?? unwrap(data);
};

// POST /library/books  { category, title, author, bookCode, totalQty }
export const createBook = async (body) => {
  const { data } = await api.post("/library/books", body);
  return unwrap(data);
};

// PUT /library/books/:id  (send only the fields that changed, e.g. { totalQty: 15 })
export const updateBook = async (id, body) => {
  const { data } = await api.put(`/library/books/${id}`, body);
  return unwrap(data);
};

// PUT /library/books/:id/status  { status: "retired" }
export const setBookStatus = async (id, status) => {
  const { data } = await api.put(`/library/books/${id}/status`, { status });
  return unwrap(data);
};

// DELETE /library/books/:id
export const deleteBook = async (id) => {
  const { data } = await api.delete(`/library/books/${id}`);
  return unwrap(data);
};

/* ───────────── Issues ───────────── */

// POST /library/issues  { bookId, studentId, dueDate }
export const issueBook = async (body) => {
  const { data } = await api.post("/library/issues", body);
  return unwrap(data);
};

// GET /library/issues
export const getIssues = async (params = {}) => {
  const { data } = await api.get("/library/issues", { params });
  return unwrapList(data, ["issues"]);
};

// GET /library/overdue
export const getOverdueBooks = async () => {
  const { data } = await api.get("/library/overdue");
  return unwrapList(data, ["overdue", "issues"]);
};

// GET /library/students/:studentId/history
export const getStudentHistory = async (studentId) => {
  const { data } = await api.get(`/library/students/${studentId}/history`);
  return unwrapList(data, ["history", "issues"]);
};
