// project settings, you can change only PROJECT_NAME, BASE_URL and WEBSITE_URL otherwise it can break the app
export const PROJECT_NAME = 'Jmex';
export const BASE_URL =
  process.env.REACT_APP_BASE_URL || 'https://api.jmex.store';
export const WEBSITE_URL = 'jmex.store';
export const api_url = BASE_URL + '/api/v1/';
export const api_url_admin = BASE_URL + '/api/v1/dashboard/admin/';
export const api_url_admin_dashboard = BASE_URL + '/api/v1/dashboard/';
export const IMG_URL = '';
export const export_url = BASE_URL + '/storage/';
export const example = BASE_URL + '/';

// map api key, ypu can get it from https://console.cloud.google.com/apis/library
export const MAP_API_KEY = 'AIzaSyBUqmuiMZq8fIF3WJo4Ruzd8ppJ1rEu_7M';

// firebase keys, remember to change to your own keys here and in file public/firebase-messaging-sw.js
export const VAPID_KEY = 'VAPID_KEY';
export const API_KEY = 'AIzaSyBMuxqBf7A3rmb-UVEguCgnRvBEED7G8G8';
export const AUTH_DOMAIN = "jmex-e3b6b.firebaseapp.com";
export const PROJECT_ID = 'jmex-e3b6b';
export const STORAGE_BUCKET = 'jmex-e3b6b.firebasestorage.app';
export const MESSAGING_SENDER_ID = '337727804918';
export const APP_ID = '1:337727804918:web:e8f94fded602473d0ee3d7';
export const MEASUREMENT_ID = 'G-L6Z548FGKX"';

// recaptcha key, you can get it from https://www.google.com/recaptcha/admin/create
export const RECAPTCHASITEKEY = '6LeMQEosAAAAAKlIHZjFb-rNCAgdAvj7Ghbv9zxb';

// demo data, no need to change
export const LAT = 47.4143302506288;
export const LNG = 8.532059477976883;
export const DEMO_SELLER = 334; // seller_id
export const DEMO_SELLER_UUID = '3566bdf6-3a09-4488-8269-70a19f871bd0'; // seller_id
export const DEMO_SHOP = 599; // seller_id
export const DEMO_DELIVERYMAN = 375; // deliveryman_id
export const DEMO_MANEGER = 114; // deliveryman_id
export const DEMO_MODERATOR = 297; // deliveryman_id
export const DEMO_ADMIN = 107; // deliveryman_id
export const SUPPORTED_FORMATS = [
  'image/jpg',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/svg',
];
