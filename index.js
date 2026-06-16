import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatch: (() => void)[] = [];

function replaceText(val: any): any {
    if (typeof val === "string") return val.replace(/hootspotter/gi, "okay");
    if (Array.isArray(val)) return val.map(replaceText);
    return val;
}

export default {
    onLoad() {
        const React = findByProps("createElement");
        unpatch.push(after("createElement", React, (args, res) => {
            if (res?.props?.children) {
                res.props.children = replaceText(res.props.children);
            }
            return res;
        }));
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    }
};
