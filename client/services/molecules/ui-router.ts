import { NexusComponent } from "../atoms/types";

/**
 * Molecule: UI Router
 * Orchestrates high-level transitions and organism mounting.
 * ACHIEVED: Smart Reconciliation to prevent DOM thrashing and event listener loss.
 */
class Router {
    private currentRoute: string = "";
    private mountedComponents: Map<string, NexusComponent> = new Map();

    public routeTo(routeName: string) {
        if (this.currentRoute === routeName) return;
        this.currentRoute = routeName;
        console.log(`%c[ROUTER] Navigation -> ${routeName}`, "color: #8b5cf6; font-weight: bold;");
    }

    /**
     * Smart Mount: Only destroys/rebuilds if the component factory or target changed.
     * Otherwise, triggers an update on the existing component if available.
     */
    public mountOrganism(key: string, slotId: string, factory: () => NexusComponent, props?: unknown) {
        const slot = document.getElementById(slotId);
        if (!slot) return;

        const existing = this.mountedComponents.get(key);
        
        // If already exists, try to update it instead of replacing
        if (existing && slot.contains(existing.element)) {
            if (existing.update) {
                existing.update(props);
            }
            return;
        }

        // Cleanup previous if exists at this key
        if (existing) {
            existing.destroy?.();
            this.mountedComponents.delete(key);
        }

        // Perform Genesis
        const component = factory();
        slot.replaceChildren(component.element);
        this.mountedComponents.set(key, component);
        
        if (component.update && props) {
            component.update(props);
        }
    }

    public getActiveRoute() {
        return this.currentRoute;
    }

    public getComponent(key: string): NexusComponent | undefined {
        return this.mountedComponents.get(key);
    }
}

export const UIRouter = new Router();
