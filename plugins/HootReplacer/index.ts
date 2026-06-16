import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";

const FIND = /hootspotted/gi;
const REPLACE = "okay";

const patches: (() => void)[] = [];

function patchUser(res: any) {
  if (!res) return;
  if (typeof res.username === "string")
    res.username = res.username.replace(FIND, REPLACE);
  if (typeof res.globalName === "string")
    res.globalName = res.globalName.replace(FIND, REPLACE);
  // return nothing — let the original object pass through, just mutated
}

export default {
  onLoad() {
    const UserStore = findByProps("getUser", "getCurrentUser");

    patches.push(
      after("getUser", UserStore, ([_id]: [string], res: any) => patchUser(res))
    );

    patches.push(
      after("getCurrentUser", UserStore, ([]: [], res: any) => patchUser(res))
    );
  },

  onUnload() {
    patches.forEach(u => u?.());
    patches.length = 0;
  },
};