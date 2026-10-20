"""Copy the Dennis clone pages from _ref_dennis/ to the project root,
swapping only Iago's personal data. Every replacement must hit at least once."""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REF = ROOT / "_ref_dennis"

EMAIL = "iagoesteevezz@gmail.com"
PHONE = "+34 660 552 864"
PHONE_HREF = "+34660552864"
GITHUB = "https://github.com/iagoesteevezz"
LINKEDIN = "https://linkedin.com/in/iagoestevez"
DESC = ("A passionate Software Developer dedicated to building robust and scalable "
        "applications. Specializing in backend development with a focus on cloud "
        "technologies. Fluent in English, Spanish, and German.")
META_DESC = DESC + " Located in Spain. © Code by Iago"
OG_IMAGE = "https://iagoestevez.com/assets/og.jpg?v=2"
OG_URLS = {
    "index": "https://iagoestevez.com/",
    "about": "https://iagoestevez.com/about",
    "work": "https://iagoestevez.com/work",
    "contact": "https://iagoestevez.com/contact",
}

errors = []


def sub(text, pattern, repl, label, regex=False, flags=0):
    if regex:
        new, n = re.subn(pattern, repl, text, flags=flags)
    else:
        n = text.count(pattern)
        new = text.replace(pattern, repl)
    if n == 0:
        errors.append(label)
    return new


def common(t, page):
    t = sub(t, r'<script src="portfolio-config\.js"></script>\s*<script src="portfolio-theme\.js"></script>',
            '<link href="/iago.css" rel="stylesheet" />\n  <script src="/iago.js"></script>\n' + FAVICON_LINKS,
            f"{page}: config scripts", regex=True)

    t = rewrite_urls(t, page)

    if page != "index":
        t = sub(t, '<meta property="og:site_name" content="Portfolio" />',
                '<meta property="og:site_name" content="Iago Estévez" />', f"{page}: og site name")
        t = sub(t, '<meta property="og:image" content="" />',
                f'<meta property="og:image" content="{OG_IMAGE}" />', f"{page}: og image")
        t = sub(t, '<meta property="twitter:image" content="" />',
                f'<meta property="twitter:image" content="{OG_IMAGE}" />', f"{page}: twitter image")

    # Socials: Awwwards -> GitHub, drop Instagram + Twitter, LinkedIn -> Iago
    t = sub(t, r'\s*<li class="btn btn-link btn-link-external">\s*<a href="https://www\.instagram\.com/codebydennis/"[\s\S]*?</li>',
            '', f"{page}: instagram", regex=True)
    t = sub(t, r'\s*<li class="btn btn-link btn-link-external">\s*<a href="https://twitter\.com/codebydennis"[\s\S]*?</li>',
            '', f"{page}: twitter", regex=True)
    t = sub(t, r'(<a href=")https://www\.awwwards\.com/dennissnellenberg/("[\s\S]*?<span class="btn-text-inner">)Awwwards(</span>)',
            rf'\g<1>{GITHUB}\g<2>GitHub\g<3>', f"{page}: awwwards->github", regex=True)
    t = sub(t, "https://www.linkedin.com/in/dennissnellenberg/", LINKEDIN, f"{page}: linkedin")

    t = sub(t, "mailto:info@dennissnellenberg.com", f"mailto:{EMAIL}", f"{page}: mailto")
    t = sub(t, "info@dennissnellenberg.com", EMAIL, f"{page}: email text")
    t = sub(t, "tel:+31627847430", f"tel:{PHONE_HREF}", f"{page}: tel")
    t = sub(t, "+31 6 27 84 74 30", PHONE, f"{page}: phone text")

    t = sub(t, r'(class="dennis-span">)&nbsp;(</span>)', r'\g<1>Iago\g<2>', f"{page}: logo name", regex=True)
    t = sub(t, r'(class="snellenberg">)(?:&nbsp;)?(</span>)', r'\g<1>Estévez\g<2>', f"{page}: logo surname", regex=True)

    t = sub(t, "2022 © Edition", "2026 © Edition", f"{page}: version")

    t = sub(t, r'(bottom-footer[\s\S]*?<div class="socials">\s*<h5>\s*Socials\s*</h5>\s*<ul>[\s\S]*?)(\n\s*</ul>)',
            r'\g<1>' + RESUME_LI.replace('\\', '\\\\') + r'\g<2>', f"{page}: footer resume link", regex=True)
    t = sub(t, r'(<div class="fixed-nav-inner">[\s\S]*?<div class="socials">\s*<h5>\s*Socials\s*</h5>\s*<ul>[\s\S]*?)(\n\s*</ul>)',
            r'\g<1>' + RESUME_LI.replace('\\', '\\\\') + r'\g<2>', f"{page}: menu resume link", regex=True)
    return t


def index(t):
    t = sub(t, "<title>Dennis Snellenberg • Freelance Designer &amp; Developer</title>",
            "<title>Iago Estévez • Software Developer</title>", "index: title")
    t = sub(t, 'content="Dennis Snellenberg • Freelance Designer &amp; Developer"',
            'content="Iago Estévez • Software Developer"', "index: og/twitter title")
    t = sub(t, r'content="Helping brands thrive in the digital world\. Located in The Netherlands\.[^"]*"',
            f'content="{META_DESC}"', "index: meta description", regex=True)
    t = sub(t, r'content="https://dennissnellenberg\.com/media/site/[^"]*"',
            f'content="{OG_IMAGE}"', "index: meta image", regex=True)
    t = sub(t, '<meta property="og:site_name" content="Dennis Snellenberg" />',
            '<meta property="og:site_name" content="Iago Estévez" />', "index: site name")
    t = sub(t, r'<link rel="canonical" href="https://dennissnellenberg\.com" />',
            f'<link rel="canonical" href="{OG_URLS["index"]}" />', "index: canonical", regex=True)

    t = sub(t, '<img src="https://dennissnellenberg.com/assets/img/DSC07033.jpg" />',
            '<img src="/assets/iago-entero.png" alt="Iago Estévez" />', "index: hero photo")
    t = sub(t, r'<span>in the</span>(\s*)<span>Netherlands</span>', r'<span>in</span>\g<1><span>Spain</span>',
            "index: location", regex=True)
    t = sub(t, r'<span>Freelance</span>(\s*)Designer &amp; Developer', r'<span>Software</span>\g<1>Developer',
            "index: role", regex=True)
    t = sub(t, r'(<h1 class="no-select once-in once-in-secondary">\s*)Dennis Snellenberg', r'\g<1>Iago Estévez',
            "index: big name", regex=True)
    t = sub(t, r'(<h4 class="span-lines animate">\s*)Helping brands to stand out[\s\S]*?cutting edge\.',
            rf'\g<1>{DESC}', "index: intro tagline", regex=True)
    t = sub(t, r'(<div class="text-wrap fade-in animate">\s*<p>\s*)The combination of my passion[\s\S]*?world\.',
            r'\g<1>DAM student and AWS Certified Cloud Practitioner, building with Java, Spring Boot, AWS, React &amp; Python.',
            "index: intro bio", regex=True)
    return t


def about(t):
    t = sub(t, "<title>About - Portfolio</title>", "<title>About • Iago Estévez</title>", "about: title")
    t = sub(t, 'content="About - Portfolio"', 'content="About • Iago Estévez"', "about: twitter title")
    t = sub(t, r'content="Helping brands thrive in the digital world\. From my office in the Netherlands[^"]*"',
            f'content="{META_DESC}"', "about: meta description", regex=True)
    t = sub(t, "<h1><span>Helping brands thrive </span><span>in the digital world</span></h1>",
            "<h1><span>Building robust </span><span>&amp; scalable software</span></h1>", "about: h1")
    t = sub(t, r'(data-scroll-offset="0%, -50%">)I\s+help companies from all over the world[\s\S]*?quality first\.',
            rf'\g<1>{DESC}', "about: bio", regex=True)

    t = sub(t, r'<h4>Design</h4>\s*<p>[\s\S]*?</p>',
            '<h4>Backend</h4>\n                        <p>Robust, scalable backend services and REST APIs built with Java and Spring Boot.</p>',
            "about: service 1", regex=True)
    t = sub(t, r'<h4>Development</h4>\s*<p>[\s\S]*?</p>',
            '<h4>Cloud</h4>\n                        <p>AWS Certified Cloud Practitioner. I design and deploy applications on AWS with a focus on cloud technologies.</p>',
            "about: service 2", regex=True)
    t = sub(t, r'(</span>The full package</h4>\s*)<p>[\s\S]*?</p>',
            r'\g<1><p>From backend to interface: complete applications with Java, Spring Boot, AWS, React and Python.</p>',
            "about: service 3", regex=True)

    t = sub(t, "<h2>Awwwards<br>judge '19-25</h2>", "<h2>AWS Jam National<br>Competition</h2>", "about: award title")
    t = sub(t, r'<p>I am a proud member of the Awwwards International Jury[\s\S]*?every move\.</p>',
            '<p>Barcelona, 2026. Selected to represent my school at the national AWS Jam, a hands-on competition '
            'where teams solve real-world cloud architecture and infrastructure challenges on Amazon Web Services.</p>',
            "about: award text", regex=True)
    return t


def contact(t):
    t = sub(t, "<title>Contact - Portfolio</title>", "<title>Contact • Iago Estévez</title>", "contact: title")
    t = sub(t, 'content="Contact - Portfolio"', 'content="Contact • Iago Estévez"', "contact: twitter title")
    t = sub(t, r'(content="Let\'s start a project together\. Reach out via email or hop on a call\.)[^"]*"',
            r'\g<1> Based in Spain."', "contact: meta description", regex=True)
    t = sub(t, "<p>Portfolio B.V.</p>", "<p>Iago Estévez</p>", "contact: business name")
    t = sub(t, r'\s*<li>\s*<p>CoC: 92411711</p>\s*</li>', '', "contact: coc", regex=True)
    t = sub(t, r'\s*<li>\s*<p>VAT: NL866034080B01</p>\s*</li>', '', "contact: vat", regex=True)
    t = sub(t, "<p>Location: The Netherlands</p>", "<p>Location: Gran Canaria, Spain</p>", "contact: location")
    t = sub(t, r'(<p>Location: Gran Canaria, Spain</p>[\s\S]*?<h5>Socials</h5>[\s\S]*?)(\n\s*</ul>)',
            r'\g<1>' + RESUME_LI.replace('\\', '\\\\') + r'\g<2>', "contact: resume link", regex=True)
    t = sub(t, '<form class="form" method="post" action="contact.html" enctype="multipart/form-data" novalidate>',
            '<form class="form" method="post" action="https://api.web3forms.com/submit" novalidate data-web3forms>\n'
            f'                        <input type="hidden" name="access_key" value="{WEB3FORMS_KEY}">\n'
            '                        <input type="hidden" name="subject" value="New message from your portfolio">\n'
            '                        <input type="hidden" name="from_name" value="Portfolio Iago Estévez">',
            "contact: form -> web3forms")
    t = sub(t, '<input class="field" type="text" id="form-tel" name="tel" tabindex="-1">',
            '<input class="field" type="text" id="form-tel" name="botcheck" tabindex="-1" autocomplete="off">',
            "contact: honeypot -> botcheck")
    return t


WEB3FORMS_KEY = "38744957-bd94-44fc-9acc-dd6ad2a28779"


RESUME_LI = '''
                        <li class="btn btn-link btn-link-external">
                            <a href="/assets/cv-iago-estevez-en.pdf" download="Iago-Estevez-CV-EN.pdf" data-barba-prevent
                                class="btn-click magnetic" data-strength="20" data-strength-text="10">
                                <span class="btn-text">
                                    <span class="btn-text-inner">Resume<svg class="icon-download" viewBox="0 0 16 16"
                                            aria-hidden="true"><path d="M8 1.5v9M3.5 6.5 8 11l4.5-4.5M2 14.5h12"
                                                fill="none" stroke="currentColor" stroke-width="1.4"
                                                stroke-linecap="round" stroke-linejoin="round"/></svg></span>
                                </span>
                            </a>
                        </li>'''


def work(t):
    t = sub(t, "<title>Work - Portfolio</title>", "<title>Work • Iago Estévez</title>", "work: title")
    t = sub(t, 'content="Work - Portfolio"', 'content="Work • Iago Estévez"', "work: twitter title")
    t = sub(t, r'content="Creating next level digital products\. I help companies from all over the world[^"]*"',
            'content="Selected work by Iago Estévez, Software Developer based in Spain."',
            "work: meta description", regex=True)
    return t


PAGES = {"index": index, "about": about, "contact": contact, "work": work}

FAVICON_LINKS = (
    '  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />\n'
    '  <link rel="icon" type="image/png" sizes="192x192" href="/assets/favicon-192.png" />\n'
    '  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />'
)

URL_MAP = (
    ('href="index.html"', 'href="/"'),
    ('href="work.html"', 'href="/work"'),
    ('href="about.html"', 'href="/about"'),
    ('href="contact.html"', 'href="/contact"'),
    ('href="assets/cv-iago-estevez.pdf"', 'href="/assets/cv-iago-estevez.pdf"'),
    ('<link rel="canonical" href="about.html" />',
     '<link rel="canonical" href="https://iagoestevez.com/about" />'),
    ('<link rel="canonical" href="work.html" />',
     '<link rel="canonical" href="https://iagoestevez.com/work" />'),
    ('<link rel="canonical" href="contact.html" />',
     '<link rel="canonical" href="https://iagoestevez.com/contact" />'),
)


def rewrite_urls(t, page):
    for old, new in URL_MAP:
        if old in t:
            t = t.replace(old, new)
    leftover = re.findall(r'href="(?:index|about|work|contact)\.html"', t)
    if leftover:
        errors.append(f"{page}: leftover .html hrefs {leftover}")
    return t


def dest_for(name):
    if name == "index":
        return ROOT / "index.html"
    path = ROOT / name / "index.html"
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


for name, fn in PAGES.items():
    src = (REF / f"{name}.html").read_text(encoding="utf-8")
    out = fn(common(src, name))
    dest = dest_for(name)
    dest.write_text(out, encoding="utf-8", newline="")
    print(f"wrote {dest.relative_to(ROOT)}")

if errors:
    print("MISSED REPLACEMENTS:", *errors, sep="\n  ")
    sys.exit(1)
