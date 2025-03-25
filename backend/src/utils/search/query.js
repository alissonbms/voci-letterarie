const searchQuery = (query) => {
  return query
    .split("")
    .join(".*")
    .replace(/\.\*\s+\.\*/g, ".*");
};

export default searchQuery;
