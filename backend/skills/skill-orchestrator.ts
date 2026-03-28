import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ElegantSkillInvoker } from "./skill-invoker.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * SkillOrchestrator: The Brain of the Nexus Center.
 * Decides 'When to use what' to maximize efficiency.
 */
export class SkillOrchestrator {
    private manifest: Record<string, unknown> | null = null;

    private manifestPromise: Promise<void>;

    constructor() {
        this.manifestPromise = this.init();
    }

    private async init() {
        const manifestPath = path.join(__dirname, "skills-manifest.json");
        try {
            const data = await fs.promises.readFile(manifestPath, "utf-8");
            this.manifest = JSON.parse(data);
        } catch (err) {
            console.error("ORCHESTRATOR: Manifest load failed", err);
        }
    }

    private async ensureReady() {
        await this.manifestPromise;
    }

    /**
     * Intelligent Routing Logic (Industrial Grade)
     */
    async route(query: string, context: { apiKey: string, docs: string[], repo?: string, token?: string }) {
        await this.ensureReady();
        const q = query.toLowerCase();
        
        // 1. Logic: Relationship / Influence -> GalaxyGraph
        if (q.includes("related to") || q.includes("impact") || q.includes("connection")) {
            console.log("ORCHESTRATOR: DISPATCHING GALAXY_GRAPH [RELATION_MAPPING]");
            return ElegantSkillInvoker.invokeWordExpert("dummy.docx", "output.docx", []); // Placeholder
        }
        
        // 2. Logic: Vision / Diagram -> VisionExpert
        if (q.includes("diagram") || q.includes("image") || q.includes("chart")) {
            console.log("ORCHESTRATOR: DISPATCHING VISION_EXPERT [MULTIMODAL_DECODE]");
            return { status: "vision_initiated" };
        }

        // 3. Logic: GitHub / Progress -> DevSync
        if (q.includes("github") || q.includes("issue") || q.includes("pr") || q.includes("progress")) {
            console.log("ORCHESTRATOR: DISPATCHING DEV_SYNC [GITHUB_REALTIME]");
            return { status: "github_sync_requested" };
        }

        // Dynamic Master Prompt Loading Layer
        const promptDir = path.join(__dirname, "prompts");
        let expertPrompt = "";

        // 4. Logic: PPT / Design -> Inject [ppt-master.md]
        if (q.includes("ppt") || q.includes("slide") || q.includes("presentation") || q.includes("deck")) {
            console.log("ORCHESTRATOR: INJECTING [PPT_MASTER_VISION]");
            const promptPath = path.join(promptDir, "ppt-master.md");
            try { expertPrompt = await fs.promises.readFile(promptPath, "utf-8"); } catch {}
            return { status: "prompt_augmented", category: "ppt_design", prompt: expertPrompt };
        }

        // 5. Logic: Excel / Data -> Inject [excel-expert.md]
        if (q.includes("excel") || q.includes("sheet") || q.includes("data") || q.includes("report") || q.includes("spreadsheet")) {
            console.log("ORCHESTRATOR: INJECTING [EXCEL_EXPERT_VISION]");
            const promptPath = path.join(promptDir, "excel-expert.md");
            try { expertPrompt = await fs.promises.readFile(promptPath, "utf-8"); } catch {}
            return { status: "prompt_augmented", category: "excel_data", prompt: expertPrompt };
        }

        // 6. Logic: Word / General Creative -> Inject [word-expert.md]
        if (q.includes("word") || q.includes("write") || q.includes("document") || q.includes("content")) {
            console.log("ORCHESTRATOR: INJECTING [WORD_EXPERT_VISION]");
            const promptPath = path.join(promptDir, "word-expert.md");
            try { expertPrompt = await fs.promises.readFile(promptPath, "utf-8"); } catch {}
            return { status: "prompt_augmented", category: "word_creative", prompt: expertPrompt };
        }

        // 7. Logic: Cross-App / Sync -> Inject [omni-bridge.md]
        const syncKeywords = ["sync", "export", "from excel", "to ppt", "to word", "bridge", "cross-app", "transfer"];
        if (syncKeywords.some(keyword => q.includes(keyword))) {
            console.log("ORCHESTRATOR: INJECTING [OMNI_BRIDGE_VISION]");
            const promptPath = path.join(promptDir, "omni-bridge.md");
            try { expertPrompt = await fs.promises.readFile(promptPath, "utf-8"); } catch {}
            return { status: "prompt_augmented", category: "omni_bridge", prompt: expertPrompt };
        }

        // DEFAULT: Just High-Precision Vector Search
        console.log("ORCHESTRATOR: EXECUTING_STANDARD_UPLINK");
        return ElegantSkillInvoker.invokeVectorSearch(context.apiKey, query, context.docs);
    }
}
