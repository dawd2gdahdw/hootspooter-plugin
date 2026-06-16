(function (t, p, c) {
    "use strict";

    var TARGET = "hootspotter";
    var REPLACEMENT = "okay";

    var unpatchers = [];

    function replaceInElement(el) {
        if (!el || typeof el !== "object" || !el.props) return;
        var children = el.props.children;
        if (children === null || children === undefined) return;

        if (typeof children === "string") {
            if (children.toLowerCase().includes(TARGET.toLowerCase())) {
                el.props.children = children.replace(new RegExp(TARGET, "gi"), REPLACEMENT);
            }
        } else if (Array.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                var child = children[i];
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

    var plugin = {
        onLoad: function () {
            var jsxRuntime = p.findByProps("jsx", "jsxs");
            if (!jsxRuntime) {
                console.warn("[HootspotterReplace] Could not find JSX runtime.");
                return;
            }

            unpatchers.push(
                c.after("jsx", jsxRuntime, function (args, ret) {
                    replaceInElement(ret);
                    return ret;
                })
            );
            unpatchers.push(
                c.after("jsxs", jsxRuntime, function (args, ret) {
                    replaceInElement(ret);
                    return ret;
                })
            );
        },
        onUnload: function () {
            unpatchers.forEach(function (u) { return u(); });
            unpatchers = [];
        }
    };

    t.default = plugin;
    Object.defineProperty(t, "__esModule", { value: true });
    return t;
})({}, vendetta.metro, vendetta.patcher);
