export const asyncHandler = (controller) => (request, response, next) => {
  Promise.resolve(controller(request, response, next)).catch(next);
};
