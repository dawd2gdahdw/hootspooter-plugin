import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";

const { FormRow, FormSwitch, FormInput, FormSection, FormDivider } = Forms;

// Default settings
storage.replacementName ??= "okay";
storage.badgeEnabled ??= false;
storage.badgeId ??= "staff"; // default badge

// Available badges map — these are Discord's internal badge flag names
const BADGES: Record<string, { label: string; flag: number }> = {
  staff:            { label: "Discord Staff",           flag: 1 },
  partner:          { label: "Partnered Server Owner",  flag: 2 },
  hypesquad:        { label: "HypeSquad Events",        flag: 4 },
  bug_hunter_1:     { label: "Bug Hunter (Level 1)",    flag: 8 },
  bug_hunter_2:     { label: "Bug Hunter (Level 2)",    flag: 16384 },
  bravery:          { label: "HypeSquad Bravery",       flag: 64 },
  brilliance:       { label: "HypeSquad Brilliance",    flag: 128 },
  balance:          { label: "HypeSquad Balance",       flag: 256 },
  early_supporter:  { label: "Early Supporter",         flag: 512 },
  active_developer: { label: "Active Developer",        flag: 4194304 },
  verified_dev:     { label: "Verified Bot Developer",  flag: 131072 },
};

const patches: (() => void)[] = [];

function patchUser(res: any) {
  if (!res) return;

  // Username replacement
  const find = /hootspotter/gi;
  const replace = storage.replacementName || "okay";
  if (typeof res.username === "string")
    res.username = res.username.replace(find, replace);
  if (typeof res.globalName === "string")
    res.globalName = res.globalName.replace(find, replace);

  // Badge injection
  if (storage.badgeEnabled && storage.badgeId && BADGES[storage.badgeId]) {
    const flag = BADGES[storage.badgeId].flag;
    if (typeof res.publicFlags === "number") {
      res.publicFlags = res.publicFlags | flag;
    } else {
      res.publicFlags = flag;
    }
  }
}

export default {
  onLoad() {
    const UserStore = findByProps("getUser", "getCurrentUser");
    patches.push(after("getUser", UserStore, ([_id]: [string], res: any) => patchUser(res)));
    patches.push(after("getCurrentUser", UserStore, ([]: [], res: any) => patchUser(res)));
  },

  onUnload() {
    patches.forEach(u => u?.());
    patches.length = 0;
  },

  settings: () => {
    const proxy = useProxy(storage);
    const [badgeInput, setBadgeInput] = React.useState(proxy.badgeId ?? "staff");

    return React.createElement(
      React.Fragment,
      null,

      React.createElement(FormSection, { title: "Username Replacement" },
        React.createElement(FormInput, {
          title: "Replace username with",
          placeholder: "okay",
          value: proxy.replacementName,
          onChange: (v: string) => { proxy.replacementName = v; },
        }),
      ),

      React.createElement(FormSection, { title: "Badge Injection" },
        React.createElement(FormRow, {
          label: "Inject badge",
          subLabel: "Shows a badge next to your username (local only)",
          trailing: React.createElement(FormSwitch, {
            value: proxy.badgeEnabled,
            onValueChange: (v: boolean) => { proxy.badgeEnabled = v; },
          }),
        }),
        React.createElement(FormDivider, null),
        React.createElement(FormInput, {
          title: "Badge ID",
          placeholder: "staff",
          value: badgeInput,
          onChange: (v: string) => {
            setBadgeInput(v);
            proxy.badgeId = v;
          },
        }),
        React.createElement(FormRow, {
          label: "Available badge IDs",
          subLabel: Object.entries(BADGES).map(([k, v]) => `${k} — ${v.label}`).join("\n"),
        }),
      ),
    );
  },
};