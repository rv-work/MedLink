import crypto from 'crypto';
import dotenv from "dotenv"
dotenv.config()

const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPT_SECRET_KEY;

if (!secretKey || secretKey.length !== 32) {
  throw new Error('ENCRYPT_SECRET_KEY must be exactly 32 characters long.');
}






export const EncryptField = (field) => {
  if (!field || typeof field !== 'string') return '';

  const iv = crypto.randomBytes(16); 
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
  let encrypted = cipher.update(field, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};





export const DecryptField = (encryptedField) => {
  if (!encryptedField || typeof encryptedField !== 'string') return '';

  const [ivHex, encrypted] = encryptedField.split(':');
  const ivBuffer = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), ivBuffer);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};





export const EncryptArrayField = (arr) => EncryptField(JSON.stringify(arr));
export const DecryptArrayField = (str) => JSON.parse(DecryptField(str));



// export const DecryptArrayField = (str) => {
//   try {
//     const decrypted = DecryptField(str);
//     return JSON.parse(decrypted);
//   } catch (error) {
//     console.error('DecryptArrayField error:', error.message, '| Input:', str);
//     return []; 
//   }
// };

