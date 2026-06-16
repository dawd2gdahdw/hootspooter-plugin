import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatch: (() => void)[] = [];

export default {
    onLoad() {
        const DCDText = findByProps("TextStyleSheet");
        if (!DCDText) return;
        unpatch.push(after("render", DCDText, (_, res) => {
            if (typeof res?.props?.children === "string") {
                res.props.children = res.props.children.replace(/hootspotter/gi, "okay");
            }
            return res;
        }));
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    }
};
