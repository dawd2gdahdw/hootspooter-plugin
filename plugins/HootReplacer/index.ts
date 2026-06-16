import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";

const FIND = /hootspotted/gi;
const REPLACE = "okay";

const patches = [];

function patchUser(user) {
  if (!user) return user;
  const patched = { ...user };
  if (patched.username) patched.username = patched.username.replace(FIND, REPLACE);
  if (patched.globalName) patched.globalName = patched.globalName.replace(FIND, REPLACE);
  return patched;
}

export default {
  onLoad() {
    const UserStore = findByProps("getUser", "getCurrentUser");

    // Patch every user lookup so your username renders as "okay" everywhere
    patches.push(
      after("getUser", UserStore, ([_id], res) => patchUser(res))
    );

    // getCurrentUser is what Discord uses to show YOUR username in the UI
    patches.push(
      after("getCurrentUser", UserStore, ([_], res) => patchUser(res))
    );
  },

  onUnload() {
    patches.forEach(u => u?.());
    patches.length = 0;
  },
};