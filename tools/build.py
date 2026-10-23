#!/usr/bin/env python3
"""Build the Erythmind app (this repo) from the world's source folder.

    python3 tools/build.py [path/to/erythmind-source]      (default: ../erythmind)

The source folder is the same one published as the claude.ai artifact: erythmind.html, js/, assets/.
This copies the world code and the 3D models in, wraps the page as a full installable app and plugs in
the Supabase runtime (app/). Run it again whenever the world changes, then commit and push."""
import hashlib, pathlib, re, shutil, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT.parent / 'erythmind').resolve()

# claude.ai wording that means something else in the app
APP_TEXT = {
    'js/07-ui.js': [
        ('Kongsikan pautan artifak ini dengan mereka (sebagai Contributor supaya laporan bot dan buku pelawat berfungsi) dan beritahu PIN mereka secara bersemuka.',
         'Kongsikan pautan app ini dengan mereka (Kawalan Penuh → Salin pautan) dan beritahu PIN mereka secara bersemuka.'),
        ('Laporan daripada pelayar tetamu hanya tersimpan jika tetamu dikongsi sebagai Contributor atau lebih. Tetamu peringkat Viewer hanya dipantau secara langsung semasa kau berada dalam dunia.',
         'Laporan daripada pelayar tetamu disimpan dalam projek Supabase kau dan hanya pemilik boleh membacanya.'),
        ("Buku pelawat hanya untuk tetamu peringkat Contributor ('", "Buku pelawat ditolak: dunia dikunci atau peranti ini disekat ('"),
    ],
    'js/14-borak.js': [
        ('Akaun kau tidak dibenarkan menghantar mesej di sini (perlu akses Contributor).', 'Room menolak mesej: dunia dikunci atau peranti ini disekat.'),
    ],
}

HEAD_EXTRA = '''<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#070a12">
<meta name="description" content="Erythmind: dunia 3D peribadi yang disulitkan dengan PIN.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Erythmind">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
'''
RUNTIME = '''<script src="app/config.js"></script>
<script src="vendor/supabase.js"></script>
<script src="app/supabase-shim.js"></script>
'''
TAIL = '''<script src="app/kawalan.js"></script>
<script>if('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));</script>
'''


def main():
    page = (SRC / 'erythmind.html').read_text(encoding='utf-8')
    if not (SRC / 'js').is_dir():
        sys.exit(f'Tiada folder js/ di {SRC}')
    # page: fragment -> full document
    page = re.sub(r'<meta charset="utf-8">\s*', '', page)
    page = re.sub(r'<meta name="claude:[^>]*>\s*', '', page)
    head_end = page.index('</style>') + len('</style>')
    head, body = page[:head_end], page[head_end:]
    first = body.index('<script src="js/01-base.js"')
    body = body[:first] + RUNTIME + body[first:]
    last = body.rindex('</script>') + len('</script>')
    body = body[:last] + '\n' + TAIL + body[last:]
    html = f'<!doctype html>\n<html lang="ms">\n<head>\n<meta charset="utf-8">\n{HEAD_EXTRA}{head}\n</head>\n<body>\n{body.strip()}\n</body>\n</html>\n'
    (ROOT / 'index.html').write_text(html, encoding='utf-8')

    # world code
    shutil.rmtree(ROOT / 'js', ignore_errors=True)
    shutil.copytree(SRC / 'js', ROOT / 'js')
    for rel, pairs in APP_TEXT.items():
        p = ROOT / rel
        s = p.read_text(encoding='utf-8')
        for a, b in pairs:
            if a not in s:
                print(f'  amaran: teks tidak dijumpai dalam {rel}: {a[:50]}…')
            s = s.replace(a, b)
        p.write_text(s, encoding='utf-8')

    # only the assets the world actually loads
    refs = set()
    for f in [SRC / 'erythmind.html', *sorted((SRC / 'js').glob('*.js')), *sorted((SRC / 'assets').glob('manifest*.json'))]:
        refs |= set(re.findall(r'assets/[A-Za-z0-9._-]+', f.read_text(encoding='utf-8')))
    shutil.rmtree(ROOT / 'assets', ignore_errors=True)
    (ROOT / 'assets').mkdir()
    # whole asset folders a script loads by name (assets/tex/<name>.jpg)
    for r in [r for r in refs if (SRC / r).is_dir()]:
        shutil.copytree(SRC / r, ROOT / r)
        refs |= {f'{r}/{f.name}' for f in (SRC / r).iterdir() if f.is_file()}
        refs.discard(r)
    missing = []
    for r in sorted(refs):
        if (ROOT / r).is_file():
            continue
        s = SRC / r
        if s.is_file():
            shutil.copy2(s, ROOT / r)
        else:
            missing.append(r)

    # service worker cache name follows the content, so phones pick up every update
    h = hashlib.sha256()
    for f in sorted([ROOT / 'index.html', *(ROOT / 'js').glob('*.js'), *(ROOT / 'app').glob('*.js'), *(f for f in (ROOT / 'assets').rglob('*') if f.is_file())]):
        h.update(f.read_bytes())
    sw = ROOT / 'sw.js'
    sw.write_text(re.sub(r"const VER = '[^']*';", f"const VER = 'erythmind-{h.hexdigest()[:10]}';", sw.read_text(encoding='utf-8')), encoding='utf-8')

    size = sum(f.stat().st_size for f in (ROOT / 'assets').rglob('*') if f.is_file()) / 1e6
    print(f'Siap: index.html, {len(list((ROOT / "js").glob("*.js")))} fail js, {len(refs) - len(missing)} aset ({size:.1f} MB), sw {h.hexdigest()[:10]}')
    if missing:
        print('  aset tiada dalam sumber:', ', '.join(missing))


if __name__ == '__main__':
    main()
