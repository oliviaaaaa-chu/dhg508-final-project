import sys, re, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

T = open('data/raw/myths/christian/kjv.txt', encoding='utf-8-sig').read()

HEADERS = {
 "Genesis": "The First Book of Moses: Called Genesis",
 "Exodus": "The Second Book of Moses: Called Exodus",
 "Joshua": "The Book of Joshua",
 "Numbers": "The Fourth Book of Moses: Called Numbers",
 "Deuteronomy": "The Fifth Book of Moses: Called Deuteronomy",
 "Judges": "The Book of Judges",
 "Ruth": "The Book of Ruth",
 "Samuel1": "The First Book of Samuel",
 "Samuel2": "The Second Book of Samuel",
 "Kings1": "The First Book of the Kings",
 "Kings2": "The Second Book of the Kings",
 "Esther": "The Book of Esther",
 "Job": "The Book of Job",
 "Psalms": "The Book of Psalms",
 "Isaiah": "The Book of the Prophet Isaiah",
 "Jeremiah": "The Book of the Prophet Jeremiah",
 "Ezekiel": "The Book of the Prophet Ezekiel",
 "Daniel": "The Book of Daniel",
 "Jonah": "Jonah",
 "Hosea": "Hosea",
 "Amos": "Amos",
 "Matthew": "The Gospel According to Saint Matthew",
 "Mark": "The Gospel According to Saint Mark",
 "Luke": "The Gospel According to Saint Luke",
 "John": "The Gospel According to Saint John",
 "Acts": "The Acts of the Apostles",
 "Revelation": "The Revelation of Saint John the Divine",
}


def extract(book, cs, ce):
    pat = HEADERS[book]
    occ = [m.start() for m in re.finditer(re.escape(pat) + r"\s*\n+\s*1:1 ", T)]
    if not occ:
        occ = [m.start() for m in re.finditer(re.escape(pat), T)]
    start = occ[-1]
    if book == "Revelation":
        end = T.find("*** END OF THE PROJECT GUTENBERG EBOOK", start)
    else:
        keys = list(HEADERS)
        end = None
        for nb in keys[keys.index(book)+1:]:
            occ2 = [m.start() for m in re.finditer(re.escape(HEADERS[nb]) + r"\s*\n+\s*1:1 ", T) if m.start() > start]
            if not occ2:
                occ2 = [m.start() for m in re.finditer(re.escape(HEADERS[nb]), T) if m.start() > start]
            if occ2:
                end = occ2[0]
                break
    seg = T[start:end] if end else T[start:start+400000]
    chap_re = re.compile(r"(?<=\s)(\d+):1\s", re.M)
    anchors = [(int(m.group(1)), m.start()) for m in chap_re.finditer(seg)]
    for i, (c, pos) in enumerate(anchors):
        if c < cs:
            continue
        if c > ce:
            break
        stop = anchors[i+1][1] if i+1 < len(anchors) else len(seg)
        chunk = re.sub(r"\n\s*\n", "\n", seg[pos:stop]).strip()
        print(f"[{book} {c}]")
        print(chunk)


if __name__ == "__main__":
    extract(sys.argv[1], int(sys.argv[2]), int(sys.argv[3]) if len(sys.argv) > 3 else int(sys.argv[2]))

