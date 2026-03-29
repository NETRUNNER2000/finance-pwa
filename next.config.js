/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV === 'development'
const forcePwaInDev = process.env.NEXT_PUBLIC_PWA_DEV === 'true'

const runtimeCaching = [
	{
		urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|otf|mp4|webm|mp3|wav)$/i,
		handler: 'CacheFirst',
		method: 'GET',
		options: {
			cacheName: 'static-assets',
			expiration: {
				maxEntries: 300,
				maxAgeSeconds: 60 * 60 * 24 * 30,
			},
			cacheableResponse: {
				statuses: [0, 200],
			},
		},
	},
	{
		urlPattern: /^https:\/\/.*\.supabase\.co\/.*$/i,
		handler: 'NetworkFirst',
		method: 'GET',
		options: {
			cacheName: 'supabase-get-5m',
			networkTimeoutSeconds: 5,
			expiration: {
				maxEntries: 200,
				maxAgeSeconds: 60 * 5,
			},
			cacheableResponse: {
				statuses: [0, 200],
			},
		},
	},
]

const withPWA = require('next-pwa')({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: isDev && !forcePwaInDev,
	mode: forcePwaInDev ? 'production' : undefined,
	runtimeCaching,
})

module.exports = withPWA({
	reactStrictMode: true,
})
