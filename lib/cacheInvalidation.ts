const SUPABASE_CACHE_NAME = 'supabase-get-5m'

export const invalidateSupabaseCache = async (): Promise<void> => {
	if (typeof window === 'undefined') return
	if (!('caches' in window)) return

	try {
		await caches.delete(SUPABASE_CACHE_NAME)
	} catch (error) {
		console.warn('Failed to invalidate Supabase cache', error)
	}
    console.log('Supabase cache invalidated')
}
