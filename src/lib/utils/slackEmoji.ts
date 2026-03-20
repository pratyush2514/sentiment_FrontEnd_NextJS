/**
 * Maps common Slack emoji shortcodes to Unicode characters.
 * Covers the most frequently used emojis in workplace Slack channels.
 * Unknown / custom emojis gracefully fall back to a styled badge.
 */

const EMOJI_MAP: Record<string, string> = {
  // ── Smileys & People ──
  smile: "😄", laughing: "😆", satisfied: "😆", blush: "😊", relaxed: "☺️",
  wink: "😉", heart_eyes: "😍", kissing_heart: "😘", kissing: "😗",
  stuck_out_tongue_winking_eye: "😜", stuck_out_tongue: "😛", flushed: "😳",
  grin: "😁", grinning: "😀", grimacing: "😬", neutral_face: "😐",
  expressionless: "😑", unamused: "😒", sweat: "😓",
  pensive: "😔", confused: "😕", confounded: "😖",
  disappointed: "😞", worried: "😟", triumph: "😤", cry: "😢",
  sob: "😭", joy: "😂", astonished: "😲", scream: "😱",
  tired_face: "😫", angry: "😠", rage: "😡", sleepy: "😪",
  mask: "😷", smiling_imp: "😈", sunglasses: "😎", dizzy_face: "😵",
  innocent: "😇", thinking_face: "🤔", thinking: "🤔", face_with_rolling_eyes: "🙄",
  rolling_eyes: "🙄", zipper_mouth_face: "🤐", nauseated_face: "🤢",
  sneezing_face: "🤧", face_with_thermometer: "🤒", nerd_face: "🤓",
  hugging_face: "🤗", shushing_face: "🤫", face_with_monocle: "🧐",
  exploding_head: "🤯", partying_face: "🥳", pleading_face: "🥺",
  slightly_smiling_face: "🙂", slightly_frowning_face: "🙁",
  upside_down_face: "🙃", face_with_hand_over_mouth: "🤭",
  yawning_face: "🥱", smiling_face_with_tear: "🥲",
  skull: "💀", skull_and_crossbones: "☠️", ghost: "👻",
  clown_face: "🤡", see_no_evil: "🙈", hear_no_evil: "🙉",
  speak_no_evil: "🙊", wave: "👋", raised_hands: "🙌",
  clap: "👏", pray: "🙏", handshake: "🤝",
  muscle: "💪", point_up: "☝️", point_down: "👇",
  point_left: "👈", point_right: "👉", ok_hand: "👌",
  raised_hand: "✋", open_hands: "👐", palms_up_together: "🤲",
  fist: "✊", facepunch: "👊", punch: "👊",
  metal: "🤘", call_me_hand: "🤙", writing_hand: "✍️",
  eyes: "👀", eye: "👁️", brain: "🧠",

  // ── Hearts & Emotions ──
  heart: "❤️", orange_heart: "🧡", yellow_heart: "💛",
  green_heart: "💚", blue_heart: "💙", purple_heart: "💜",
  black_heart: "🖤", white_heart: "🤍", broken_heart: "💔",
  heartbeat: "💓", heartpulse: "💗", sparkling_heart: "💖",
  star: "⭐", star2: "🌟", sparkles: "✨", boom: "💥",
  fire: "🔥", zap: "⚡", snowflake: "❄️", rainbow: "🌈",
  sunny: "☀️", cloud: "☁️", umbrella: "☂️",

  // ── Hands & Gestures ──
  "+1": "👍", thumbsup: "👍", "-1": "👎", thumbsdown: "👎",
  v: "✌️", crossed_fingers: "🤞", love_you_gesture: "🤟",
  pinching_hand: "🤏", pinched_fingers: "🤌",

  // ── Objects & Symbols ──
  bulb: "💡", wrench: "🔧", hammer: "🔨", gear: "⚙️",
  link: "🔗", paperclip: "📎", memo: "📝", pencil: "✏️",
  book: "📖", bookmark: "🔖", clipboard: "📋",
  calendar: "📅", clock: "🕐", hourglass: "⏳",
  bell: "🔔", loudspeaker: "📢", mega: "📣",
  trophy: "🏆", medal: "🏅", crown: "👑", gem: "💎",
  moneybag: "💰", chart_with_upwards_trend: "📈",
  chart_with_downwards_trend: "📉", bar_chart: "📊",
  lock: "🔒", unlock: "🔓", key: "🔑",
  email: "📧", envelope: "✉️", package: "📦",
  rocket: "🚀", airplane: "✈️", car: "🚗",
  computer: "💻", desktop_computer: "🖥️", keyboard: "⌨️",
  phone: "📱", telephone_receiver: "📞",
  camera: "📷", video_camera: "📹", movie_camera: "🎥",
  headphones: "🎧", microphone: "🎤", musical_note: "🎵",
  art: "🎨", paintbrush: "🖌️",

  // ── Food & Drink ──
  coffee: "☕", tea: "🍵", beer: "🍺", wine_glass: "🍷",
  pizza: "🍕", hamburger: "🍔", taco: "🌮", cake: "🎂",
  cookie: "🍪", candy: "🍬", apple: "🍎",

  // ── Check marks & Status ──
  white_check_mark: "✅", heavy_check_mark: "✔️",
  ballot_box_with_check: "☑️", x: "❌", heavy_multiplication_x: "✖️",
  no_entry: "⛔", warning: "⚠️", bangbang: "‼️",
  question: "❓", grey_question: "❔", exclamation: "❗",
  interrobang: "⁉️", hundred: "💯", no_entry_sign: "🚫",
  accept: "🉑", sos: "🆘", information_source: "ℹ️",
  new: "🆕", ok: "🆗", up: "🆙", cool: "🆒", free: "🆓",

  // ── Arrows & Indicators ──
  arrow_up: "⬆️", arrow_down: "⬇️", arrow_left: "⬅️",
  arrow_right: "➡️", arrow_upper_right: "↗️", arrow_lower_right: "↘️",
  arrows_counterclockwise: "🔄", leftwards_arrow_with_hook: "↩️",
  arrow_right_hook: "↪️", arrow_forward: "▶️",
  rewind: "⏪", fast_forward: "⏩",

  // ── Animals & Nature ──
  dog: "🐶", cat: "🐱", mouse: "🐭", bear: "🐻",
  panda_face: "🐼", penguin: "🐧", bird: "🐦",
  bug: "🐛", bee: "🐝", turtle: "🐢", snake: "🐍",
  unicorn_face: "🦄", unicorn: "🦄",
  four_leaf_clover: "🍀", seedling: "🌱", evergreen_tree: "🌲",
  palm_tree: "🌴", cactus: "🌵", tulip: "🌷", rose: "🌹",
  sunflower: "🌻", blossom: "🌼", cherry_blossom: "🌸",

  // ── Common Slack-specific ──
  tada: "🎉", confetti_ball: "🎊", balloon: "🎈",
  gift: "🎁", ribbon: "🎀", party_popper: "🎉",
  raised_eyebrow: "🤨", face_with_raised_eyebrow: "🤨",
  man_shrugging: "🤷‍♂️", woman_shrugging: "🤷‍♀️", shrug: "🤷",
  facepalm: "🤦", man_facepalm: "🤦‍♂️", woman_facepalm: "🤦‍♀️",
  saluting_face: "🫡", melting_face: "🫠", dotted_line_face: "🫥",
  sweat_smile: "😅", rofl: "🤣", smirk: "😏", yum: "😋",
  relieved: "😌", sleeping: "😴", drooling_face: "🤤",
  money_mouth_face: "🤑", face_vomiting: "🤮",
  hot_face: "🥵", cold_face: "🥶", woozy_face: "🥴",
  cowboy_hat_face: "🤠", disguised_face: "🥸",
  imp: "👿", japanese_ogre: "👹", robot_face: "🤖", robot: "🤖",
  alien: "👽", space_invader: "👾",
  poop: "💩", hankey: "💩",
  // common reactions
  heavy_plus_sign: "➕", heavy_minus_sign: "➖",
  wavy_dash: "〰️", curly_loop: "➰",
  recycle: "♻️", trident: "🔱",
  beginner: "🔰", o: "⭕", white_circle: "⚪",
  black_circle: "⚫", red_circle: "🔴", large_blue_circle: "🔵",
  large_orange_diamond: "🔶", large_blue_diamond: "🔷",
  small_orange_diamond: "🔸", small_blue_diamond: "🔹",
  white_large_square: "⬜", black_large_square: "⬛",
  white_medium_square: "◻️", black_medium_square: "◼️",
};

/** Regex that matches Slack-style emoji shortcodes like :disappointed: or :+1: */
const EMOJI_RE = /:([a-zA-Z0-9_+\-]+):/g;

/**
 * Replace Slack emoji shortcodes with Unicode characters.
 * Returns an array of React-renderable segments (strings and JSX elements).
 *
 * Known emojis → rendered as the Unicode character with a title tooltip.
 * Unknown emojis → rendered as a styled badge so they're still readable.
 */
export function replaceSlackEmojis(
  text: string,
): Array<string | { emoji: string; name: string } | { unknown: string }> {
  const result: Array<string | { emoji: string; name: string } | { unknown: string }> = [];
  let lastIndex = 0;

  // Reset regex state
  EMOJI_RE.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = EMOJI_RE.exec(text)) !== null) {
    // Push text before this match
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }

    const name = match[1];
    const unicode = EMOJI_MAP[name];

    if (unicode) {
      result.push({ emoji: unicode, name });
    } else {
      result.push({ unknown: name });
    }

    lastIndex = match.index + match[0].length;
  }

  // Push remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/** Check if text contains any Slack emoji shortcodes */
export function hasSlackEmojis(text: string): boolean {
  EMOJI_RE.lastIndex = 0;
  return EMOJI_RE.test(text);
}
