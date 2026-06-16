import { before } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";

let unpatch;

export default {
  onLoad() {
    const MessageActions = findByProps("sendMessage", "editMessage");
    unpatch = before("sendMessage", MessageActions, (args) => {
      const msg = args[1];
      if (msg?.content) {
        msg.content = msg.content.replace(/hootspooter/gi, "okay");
      }
    });
  },
  onUnload() {
    unpatch?.();
  },
};
