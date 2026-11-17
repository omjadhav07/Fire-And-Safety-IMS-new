// Groups { module: [permission] } into rows (resource) and columns (action) for the permission matrix
const ACTION_ORDER = ["view", "manage"];
export const buildMatrix = (permMap) => {
  const actions = new Set();
  const modules = Object.keys(permMap)
    .sort()
    .map((name) => {
      const rows = {};
      permMap[name].forEach((p) => {
        const [resource, ...rest] = String(p.code).split(".");
        const action = rest.join(".") || "access";
        actions.add(action);
        (rows[resource] ||= { resource, perms: {} }).perms[action] = p;
      });
      return { name, rows: Object.values(rows) };
    });
  const rank = (a) => (ACTION_ORDER.includes(a) ? ACTION_ORDER.indexOf(a) : 99);
  return { actions: [...actions].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b)), modules };
};

