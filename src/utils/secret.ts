import CryptoJS from 'crypto-js';
const key = CryptoJS.enc.Utf8.parse(__APP_AES_KEY__);
const ivs = CryptoJS.enc.Utf8.parse(__APP_AES_IV__);

//加密
export function encrypt(data: string): string {
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: ivs,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

//解密
export function decrypt(data: string): string {
  const decrypted = CryptoJS.AES.decrypt(data, key, {
    iv: ivs,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  return CryptoJS.enc.Utf8.stringify(decrypted);
}

export default {
  encrypt,
  decrypt,
};
