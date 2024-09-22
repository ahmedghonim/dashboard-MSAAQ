export const convertBooleans = (obj: any): any => {
  if (typeof obj !== "object") {
    return obj;
  }

  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "boolean") {
        obj[key] = obj[key] ? 1 : 0;
      } else {
        obj[key] = convertBooleans(obj[key]);
      }
    }
  }

  return obj;
};
