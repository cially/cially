// Deletes data older than 4 weeks
cronAdd("dataCleaner", "0 0 * * *", () => {

    try {
        console.log('[dataCleaner CJ] Starting data cleaning process... ')
        
        function clearOldData(collection) {
            const cutoffDate = new Date()
            cutoffDate.setDate(cutoffDate.getDate() - 28)
            const cutoffStr = cutoffDate.toISOString().replace('T', ' ').substring(0, 19)
            
            console.log(`[dataCleaner CJ] Deleting ${collection} records older than: ${cutoffStr}`)
            
            $app.db()
                .newQuery(`DELETE FROM ${collection} WHERE created < {:cutoff}`)
                .bind({ cutoff: cutoffStr })
                .execute()
        }
        
        clearOldData('channel_stats')
        clearOldData('hourly_stats')
        clearOldData('member_joins')
        clearOldData('member_leaves')
        
} catch (err) {
    console.log(err)
}
})