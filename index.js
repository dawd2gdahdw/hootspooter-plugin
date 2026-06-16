import { findByName } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatch: (() => void)[] = [];

export default {
    onLoad() {
        const ProfileSheet = findByName("UserProfileSheet", false);
        if (!ProfileSheet) return;
        unpatch.push(after("default", ProfileSheet, (_, res) => {
            if (!res?.props) return res;
            const walk = (obj: any) => {
                if (!obj) return;
                if (typeof obj === "string") return;
                if (obj.props?.children) {
                    if (typeof obj.props.children === "string") {
                        obj.props.children = obj.props.children.replace(/hootspotter/gi, "okay");
                    } else if (Array.isArray(obj.props.children)) {
                        obj.props.children.forEach(walk);
                    } else {
                        walk(obj.props.children);
                    }
                }
            };
            walk(res);
            return res;
        }));
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    }
};
