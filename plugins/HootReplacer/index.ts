import { findByProps, findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const TARGET = "hootspotter";
const REPLACEMENT = "okay";

let unpatchers: (() => void)[] = [];

function replaceInElement(el: any): void {
    if (!el || typeof el !== "object" || !el.props) return;
    const children = el.props.children;
    if (children === null || children === undefined) return;
    if (typeof children === "string") {
        if (children.toLowerCase().includes(TARGET.toLowerCase())) {
            el.props.children = children.replace(new RegExp(TARGET, "gi"), REPLACEMENT);
        }
    } else if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (typeof child === "string") {
                if (child.toLowerCase().includes(TARGET.toLowerCase())) {
                    children[i] = child.replace(new RegExp(TARGET, "gi"), REPLACEMENT);
                }
            } else {
                replaceInElement(child);
            }
        }
    } else {
        replaceInElement(children);
    }
}

export default {
    onLoad() {
        const jsxRuntime = findByProps("jsx", "jsxs");
        if (!jsxRuntime) {
            console.warn("[HootspotterReplace] Could not find JSX runtime.");
            return;
        }

        unpatchers.push(
            after("jsx", jsxRuntime, (args: any, ret: any) => {
                replaceInElement(ret);
                return ret;
            })
        );
        unpatchers.push(
            after("jsxs", jsxRuntime, (args: any, ret: any) => {
                replaceInElement(ret);
                return ret;
            })
        );

        const profileBadges = findByName("useBadges", false);
        let loggedShape = false;
        if (profileBadges) {
            unpatchers.push(
                after("default", profileBadges, (args: any, ret: any) => {
                    if (!loggedShape) {
                        loggedShape = true;
                        try {
                            console.log("[HootspotterReplace] badges ret:", JSON.stringify(ret));
                        } catch (e) {
                            console.log("[HootspotterReplace] ret type:", typeof ret, "isArray:", Array.isArray(ret), "keys:", ret && Object.keys(ret));
                        }
                    }
                    return ret;
                })
            );
        } else {
            console.warn("[HootspotterReplace] Could not find useBadges hook.");
        }
    },
    onUnload() {
        unpatchers.forEach((u) => u());
        unpatchers = [];
    },
};