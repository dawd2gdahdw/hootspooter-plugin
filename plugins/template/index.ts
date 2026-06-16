import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

const TARGET = /hootspotter/gi;
const REPLACEMENT = "okay";

let unpatch: (() => void)[] = [];

function walkAndReplace(node: any) {
    if (!node || typeof node !== "object") return;

    if (node.props) {
        // Replace string children (e.g. <Text>hootspooter</Text>)
        if (typeof node.props.children === "string") {
            node.props.children = node.props.children.replace(TARGET, REPLACEMENT);
        } else if (Array.isArray(node.props.children)) {
            node.props.children = node.props.children.map((child: any) => {
                if (typeof child === "string") return child.replace(TARGET, REPLACEMENT);
                walkAndReplace(child);
                return child;
            });
        } else {
            walkAndReplace(node.props.children);
        }

        // Also patch text in value / defaultValue props (inputs)
        if (typeof node.props.value === "string") {
            node.props.value = node.props.value.replace(TARGET, REPLACEMENT);
        }
        if (typeof node.props.defaultValue === "string") {
            node.props.defaultValue = node.props.defaultValue.replace(TARGET, REPLACEMENT);
        }
        // Patch accessible labels / hints too so screen-reader doesn't leak the name
        if (typeof node.props.accessibilityLabel === "string") {
            node.props.accessibilityLabel = node.props.accessibilityLabel.replace(TARGET, REPLACEMENT);
        }
    }
}

export default {
    onLoad() {
        const React = findByProps("createElement");
        unpatch.push(
            after("createElement", React, (_, res) => {
                walkAndReplace(res);
                return res;
            })
        );
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    },
};
