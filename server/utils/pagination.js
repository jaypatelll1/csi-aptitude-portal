exports.paginate = (query, page, limit) => {
    const offset = (page - 1) * limit;
    const paginatedQuery = `${query} LIMIT ${limit} OFFSET ${offset};`;
    return paginatedQuery;
};