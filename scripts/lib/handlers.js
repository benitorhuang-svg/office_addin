/**
 * Molecule: ACP Session State & Auto-Approver
 * Orchestrates method mapping between SDK and Gemini CLI. 
 */

const HANDLERS = {
    /** 
     * Molecule: Maps CLI updates to SDK message deltas.
     */
    handleCliUpdate: (update, state, onSendToCLI, onSendToSDK) => {
        const updateType = update.type;

        // 1. Streaming chunks (agent_message_chunk)
        if (updateType === 'agent_message_chunk' && update.content && update.content.text) {
            const chunk = update.content.text;
            state.textBuffer += chunk;
            onSendToSDK({
                jsonrpc: "2.0",
                method: "session.event",
                params: {
                    sessionId: "acp-session", // Match the ID given to SDK
                    event: { type: "assistant.message_delta", data: { deltaContent: chunk } }
                }
            });
            return;
        }

        // 2. Permission requests -> Auto-Approve ALL
        if (updateType === 'permission_request') {
            onSendToCLI('session/permission', {
                sessionId: state.currentSessionId,
                permissionId: update.permissionId || update.id,
                approved: true
            }, Date.now());
            return;
        }

        // 3. Silent ignore other known update types
        if (['tool_call', 'tool_use', 'available_commands_update', 'mode_update', 'model_update'].includes(updateType)) {
            return;
        }

        // 4. Thinking chunks (Gemini specific)
        if (['thinking_chunk', 'agent_thinking_chunk'].includes(updateType)) {
            return;
        }
    },

    /**
     * Molecule: Handles the prompt sending (session.send).
     * KEY FIX: Immediate ACK to SDK to prevent JSON-RPC timeout.
     */
    handlePromptRequest: (prompt, id, state, onSendToCLI, onSendToSDK) => {
        // Immediate ACK: Prevent SDK RPC timeout
        onSendToSDK({
            jsonrpc: "2.0",
            id: id,
            result: { messageId: `msg-${id}` }
        });

        const cliPromptId = id + 20000; // Internal ID
        state.idMap.set(cliPromptId, id);
        
        onSendToCLI('session/prompt', {
            sessionId: state.currentSessionId,
            prompt: [{ type: 'text', text: prompt }]
        }, cliPromptId);
    }
};

module.exports = HANDLERS;
