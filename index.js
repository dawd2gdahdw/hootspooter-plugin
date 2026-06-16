import { findByProps } from "@vendetta/metro";
import { after } from "@vendetta/patcher";

let unpatch: (() => void)[] = [];

export default {
    onLoad() {
        const UserStore = findByProps("getCurrentUser");
        const originalGetCurrentUser = UserStore.getCurrentUser.bind(UserStore);
        unpatch.push(after("getCurrentUser", UserStore, (_, user) => {
            if (user && user.username === "hootspotter") {
                return { ...user, username: "okay" };
            }
            return user;
        }));
    },
    onUnload() {
        unpatch.forEach(u => u());
        unpatch = [];
    }
};
