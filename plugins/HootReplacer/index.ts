import { after } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { storage } from "@vendetta/plugin";
import { useProxy } from "@vendetta/storage";
import { React, ReactNative } from "@vendetta/metro/common";
import { Forms } from "@vendetta/ui/components";

const { FormRow, FormSwitch, FormInput, FormSection, FormDivider } = Forms;
const { Image } = ReactNative;

storage.replacementName ??= "okay";
storage.badgeEnabled    ??= false;
storage.badgeId         ??= "staff";

const BADGES: Record<string, { label: string; url: string }> = {
  staff:        { label: "Discord Staff",           url: "https://cdn.discordapp.com/badge-icons/5e74e9b61934fc1f67c2da7eca4c7f57.png" },
  partner:      { label: "Partnered Owner",         url: "https://cdn.discordapp.com/badge-icons/3f9748e53446a137a052f3454e2de41e.png" },
  hype_ev:      { label: "HypeSquad Events",        url: "https://cdn.discordapp.com/badge-icons/bf01d1073931f921909045f3a39fd264.png" },
  bravery:      { label: "HypeSquad Bravery",       url: "https://cdn.discordapp.com/badge-icons/8a88d63823d8a71cd5e390baa45efa02.png" },
  brilliance:   { label: "HypeSquad Brilliance",    url: "https://cdn.discordapp.com/badge-icons/011940fd013082d85d96680709bab45e.png" },
  balance:      { label: "HypeSquad Balance",       url: "https://cdn.discordapp.com/badge-icons/3aa41de486fa12454c3761e8e223442e.png" },
  early_sup:    { label: "Early Supporter",         url: "https://cdn.discordapp.com/badge-icons/7060786766c9c840eb3019e725d2b358.png" },
  bug1:         { label: "Bug Hunter",              url: "https://cdn.discordapp.com/badge-icons/2717692e7220739a8a23e8db81119033.png" },
  bug2:         { label: "Bug Hunter Gold",         url: "https://cdn.discordapp.com/badge-icons/848f79194d4be5ff5f81505cbd0ce1e6.png" },
  dev:          { label: "Active Developer",        url: "https://cdn.discordapp.com/badge-icons/6bdc42827a38498929a4920da12695d9.png" },
  verified:     { label: "Verified Bot Dev",        url: "https://cdn.discordapp.com/badge-icons/6df5892e0f35b051f8b61eace34f4967.png" },
  mod_alumni:   { label: "Mod Alumni",              url: "https://cdn.discordapp.com/badge-icons/fee1624003e2fee35cb398e125dc479b.png" },
  nitro_bronze: { label: "Nitro Bronze (1mo)",      url: "https://cdn.discordapp.com/badge-icons/4f33c4a9c64ce221936bd256c356f91f.png" },
  nitro_silver: { label: "Nitro Silver (3mo)",      url: "https://cdn.discordapp.com/badge-icons/4514fab914bdbfb4ad2fa23df76121a6.png" },
  nitro_gold:   { label: "Nitro Gold (6mo)",        url: "https://cdn.discordapp.com/badge-icons/2895086c18d5531d499862e41d1155a6.png" },
};

const patches: (() => void)[] = [];

function patchUser(res: any) {
  if (!res) return;
  const find    = /hootspotter/gi;
  const replace = storage.replacementName || "okay";
  if (typeof res.username === "string")
    res.username = res.username.replace(find, replace);
  if (typeof res.globalName === "string")
    res.globalName = res.globalName.replace(find, replace);
}

export default {
  onLoad() {
    const UserStore = findByProps("getUser", "getCurrentUser");

    patches.push(after("getUser", UserStore, ([_]: [any], res: any) => patchUser(res)));
    patches.push(after("getCurrentUser", UserStore, ([]: [], res: any) => patchUser(res)));

    const candidateNames = [
      "ProfileBadges",
      "UserBadges",
      "BadgeList",
      "Badges",
      "ProfileBadge",
      "MemberListBadges",
    ];

    let BadgeComp: any = null;

    for (const name of candidateNames) {
      const found = findByName(name, false);
      if (found) {
        BadgeComp = found;
        console.log(`[HootReplacer] Found badge component: ${name}`);
        break;
      }
    }

    if (!BadgeComp) {
      const byProps = findByProps("getBadges") ?? findByProps("renderBadge") ?? findByProps("badges", "userId");
      if (byProps) {
        BadgeComp = byProps;
        console.log(`[HootReplacer] Found badge component via props`);
      }
    }

    if (!BadgeComp) {
      console.log("[HootReplacer] No badge component found");
      return;
    }

    patches.push(
      after("default", BadgeComp, ([props]: [any], res: any) => {
        if (!storage.badgeEnabled || !storage.badgeId) return;
        const badge = BADGES[storage.badgeId];
        if (!badge || !res?.props) return;

        const currentUser = UserStore.getCurrentUser();
        if (!currentUser) return;
        if (props?.userId && props.userId !== currentUser.id) return;

        const children = res.props.children
          ? (Array.isArray(res.props.children) ? res.props.children : [res.props.children])
          : [];

        const badgeEl = React.createElement(Image, {
          key:    "hoot-injected-badge",
          source: { uri: badge.url },
          style:  { width: 22, height: 22, marginHorizontal: 2 },
        });

        res.props.children = [...children, badgeEl];
      })
    );
  },

  onUnload() {
    patches.forEach(u => u?.());
    patches.length = 0;
  },

  settings: () => {
    const proxy = useProxy(storage);

    return React.createElement(
      React.Fragment,
      null,
      React.createElement(FormSection, { title: "Username Replacement" },
        React.createElement(FormInput, {
          title:       "Replace username with",
          placeholder: "okay",
          value:       proxy.replacementName,
          onChange:    (v: string) => { proxy.replacementName = v; },
        }),
      ),
      React.createElement(FormSection, { title: "Badge Injection" },
        React.createElement(FormRow, {
          label:    "Inject badge",
          subLabel: "Adds a badge next to your username (local only)",
          trailing: React.createElement(FormSwitch, {
            value:          proxy.badgeEnabled,
            onValueChange:  (v: boolean) => { proxy.badgeEnabled = v; },
          }),
        }),
        React.createElement(FormDivider, null),
        React.createElement(FormInput, {
          title:       "Badge ID",
          placeholder: "staff",
          value:       proxy.badgeId,
          onChange:    (v: string) => { proxy.badgeId = v; },
        }),
        React.createElement(FormRow, {
          label:    "Available IDs",
          subLabel: Object.entries(BADGES)
            .map(([k, v]) => `${k} — ${v.label}`)
            .join("\n"),
        }),
      ),
    );
  },
};