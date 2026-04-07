export const isDatabaseConnectionError = (error) => {
  const message = String(error?.message || '').toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('connection terminated') ||
    message.includes('econnrefused') ||
    message.includes('enotfound')
  );
};

export const sendControllerError = (res, context, error) => {
  console.error(`[${context}]`, error);

  if (isDatabaseConnectionError(error)) {
    return res.status(503).json({
      message: 'Database unavailable',
      error: error.message,
    });
  }

  return res.status(500).json({
    message: 'Internal server error',
    error: error.message,
  });
};
