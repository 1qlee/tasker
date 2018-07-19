// Function that parses FormData to be readable by backend
export const convertFormData = (formData) => {
  let jsonObject = {};

  for (const [key, value] of formData.entries()) {
    jsonObject[key] = value;
  }

  return JSON.stringify(jsonObject);
}
