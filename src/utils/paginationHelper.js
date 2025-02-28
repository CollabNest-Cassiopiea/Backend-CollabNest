const getPaginationParams = (req) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
  
    return { page, limit, skip };
  };
  
  const getPaginatedResponse = (data, total, page, limit) => {
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
  
    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    };
  };
  
  module.exports = {
    getPaginationParams,
    getPaginatedResponse
  };
  