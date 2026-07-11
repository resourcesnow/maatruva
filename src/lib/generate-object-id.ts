// Generates a 24-hex-char string in valid MongoDB ObjectId format, usable client-side (no
// Node "crypto" dependency) so a product's Cloudinary folder and its eventual Mongo _id can be
// decided together before the document exists, avoiding any upload-then-relink race condition.
export function generateObjectId() {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, "0");
  let random = "";
  for (let i = 0; i < 16; i++) {
    random += Math.floor(Math.random() * 16).toString(16);
  }
  return timestamp + random;
}
