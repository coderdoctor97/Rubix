import base64

# Light-open-hand cursor (dark hand so visible on white)
grab_svg = b'''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#222"/><path d="M9 11l2.5 2.5L14 10.5l.5.5-3.5 3.5-3-3z" fill="#fff"/></svg>'''

# Light-closed-hand cursor
grabbing_svg = b'''<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#222"/><path d="M10 8.5h3v3h2v-3h2l-2.5-3H12l-2 3z" fill="#fff"/></svg>'''

for name, svg in [('grab', grab_svg), ('grabbing', grabbing_svg)]:
    b64 = base64.b64encode(svg).decode()
    url = 'url("data:image/svg+xml;base64,' + b64 + '") 12 12, ' + name
    print(url)
    print()
