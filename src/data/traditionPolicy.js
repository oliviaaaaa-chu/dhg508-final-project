export const POLICY = {
  excluded: ["aztec", "hittite", "zoroastrian", "vietnamese", "ugaritic", "thai"],
  merges: {
    maori: "polynesian",
    hawaiian: "polynesian",
    baltic: "slavic",
    sumerian: "mesopotamian",
    babylonian: "mesopotamian",
  },
  recategorizeByTradition: {
    tibetan: "myth-religion",
    islamic: "myth-religion",
    afroatlantic: "myth-religion",
  },
  pureReligion: ["hebrew", "christian", "islamic", "buddhist", "taoist"],
  rationale:
    "babylonian merged into mesopotamian (with sumerian): Akkadian/Babylonian literature is the same continuous regional tradition; its myths (Enuma Elish, Atrahasis, Gilgamesh) share gods and motifs with Sumerian. aztec excluded: their pantheon is inherited almost entirely from Maya. maori+hawaiian merged into polynesian: same mythology in island-dialect variants. baltic merged into slavic: highly similar corpora. sumerian merged into mesopotamian: one continuous tradition of the region. hittite excluded: a blend of native Hattian, Hurrian, Mesopotamian and Indo-European traditions rather than a distinct corpus. zoroastrian excluded: nearly identical in scope to the Persian tradition. vietnamese excluded: curatorial reduction of over-represented Southeast Asian material. ugaritic excluded: curatorial reduction of small overlapping Canaanite material. thai excluded: curatorial reduction of over-represented Southeast Asian material. tibetan recategorized into myth-religion: myth and religion there are one continuum. pureReligion: the 'religious' category is reserved for Judaism, Christianity, Islam, Buddhism and Taoism; all other traditions' religious-category texts are classified as myth. Curatorial policy applied at load time, independent of raw data state.",
}
