export const generateOTP = (length = 6) => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


function generateBaseUsername(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10);
}

// convert number → base36 (0-9 + a-z)
function encode(num) {
  return num.toString(36);
}

export const generateUniqueUsername = (name) => {
  const base = generateBaseUsername(name);

  const timePart = encode(Date.now()); // hidden timestamp
  const randomPart = encode(Math.floor(Math.random() * 1e6));

  // take small chunks to keep it clean
  const suffix = (timePart + randomPart).slice(-6);

  return `${base}_${suffix}`;
}