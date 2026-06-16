import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatch: (() => void)[] = [];

function patchText(obj: any) {
    if (typeof obj === "string") {
        return obj.replace(/hootspooter/gi, "okay");
    }
    return obj;
}

export default {
    onLoad() {
        const TextComponent = findByProps("Text");
        if (TextComponent?.Text?.render) {
            unpatch.push(after("render", TextComponent.Text, (_, res) => {
                if (res?.props?.children) {
                    res.props.children = patchText(res.props.children);
                }
                return res;
            }));
        }
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    }
};