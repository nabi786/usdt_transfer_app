/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    TRON_NETWORK: process.env.TRON_NETWORK,
    TRON_PRIVATE_KEY: process.env.TRON_PRIVATE_KEY,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || 'TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo',
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS || 'TAYVYDTXA11rpRzqu8jQb5aGmbJAr1RnQo',
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3004',
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
  },
}

module.exports = nextConfig