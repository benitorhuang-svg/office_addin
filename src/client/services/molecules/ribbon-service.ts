/**
 * Molecule: Ribbon Service
 * Encapsulates Office Ribbon updates with type safety.
 * Bypasses Office.js typing gaps internally while providing a clean API.
 */
export const RibbonService = {
    /**
     * Updates the visibility of the Nexus command nexus-group.
     */
    async setGroupVisible(tabId: string, groupId: string, visible: boolean): Promise<void> {
        if (typeof Office === "undefined" || !Office.ribbon?.requestUpdate) {
            return;
        }

        try {
            // Explicitly handling Office.js typing gap for 'visible' property updates
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const ribbon = Office.ribbon as any;
            await ribbon.requestUpdate({
                tabs: [{
                    id: tabId,
                    groups: [{
                        id: groupId,
                        visible: visible
                    }]
                }]
            });
        } catch (error) {
            console.warn(`[RibbonService] Failed to update nexus-group ${groupId}:`, error);
        }
    }
};
