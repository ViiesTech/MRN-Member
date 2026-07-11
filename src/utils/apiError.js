export const getApiErrorMessage = error => {
  return (
    error?.data?.message ||
    error?.error ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
};
