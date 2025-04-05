const _x1 = s => atob(s);

let _a = document.getElementById(_x1("bGFi")),
    _b = document.getElementById(_x1("dGl0bGU")),
    _c = document.getElementById(_x1("cGFzcw")),
    _d = document.getElementById(_x1("ZmxhZ3M")),
    _e = document.getElementById(_x1("bWFpbg"));

let _f = _x1("Z2FtZQ=="),
    _g = _x1("c3RhZ2Uw"),
    _h = [_x1("c2lsZW5jZQ=="), _x1("cmVhbGx5Pz8="), _x1("Pz8/Pw=="), _x1("b25lIGRheS4uLg=="), _x1("VHJ1dGg/Pw=="), _x1("Lg==")];

function _z(q = 100) {
    for (let r = 0; r < q; r++) {
        let s = document.createElement(_x1("ZGl2"));
        s.className = _x1("c3BhbS13b3Jk");
        s.textContent = _h[Math.floor(Math.random() * _h.length)];
        s.style.top = `${Math.random() * 100}vh`;
        s.style.left = `${Math.random() * 100}vw`;
        s.style.transform = `translate(-50%, -50%) rotate(${Math.random() * 360}deg)`;
        s.style.fontSize = `${10 + Math.random() * 30}px`;
        s.style.opacity = 0.1 + Math.random() * 0.3;
        document.body.appendChild(s);
    }
}

function _y() {
    document.querySelectorAll(_x1("LnNwYW0td29yZA==")).forEach(x => x.remove());
}

function _w() {
    let i = _a.value.toLowerCase().trim();
    if (i == _f && _g == _x1("c3RhZ2Uw")) {
        _s();
        _f = _x1("ZW5nbGlzaA==");
        _g = _x1("c3RhZ2Ux");
    } else if (i == _f && _g == _x1("c3RhZ2Ux")) {
        _t();
        _f = _x1("MTAwMA==");
        _g = _x1("c3RhZ2Uy");
    } else if (i == _f && _g == _x1("c3RhZ2Uy")) {
        _u();
        _f = _x1("cmF1bmFr");
        _g = _x1("c3RhZ2Uz");
    } else if (i == _f && _g == _x1("c3RhZ2Uz")) {
        _v();
        _f = _x1("cmF1bmFr");
        _g = _x1("c3RhZ2U0");
    } else {
        _c.innerText = _x1("V3JvbmcgcGFzc3dvcmQ=");
        _c.classList.remove(_x1("d2lnZ2xl"));
        void _c.offsetWidth;
        _c.classList.add(_x1("d2lnZ2xl"));
    }
}

function _s() {
    _b.innerText = _x1("Q3VyaW9zaXR5");
    _b.style.color = _x1("d2hpdGU=");
    _e.style.color = _x1("d2hpdGU=");
    _c.innerText = "";
    _d.innerHTML = "";
    document.body.style.backgroundColor = _x1("YmxhY2s=");
    _e.innerHTML = _x1("WW91IGFyZSBncmVhdC4uLiBzbWFydC4uLiA8YnI+PGJyPiBraW5nIG9mIHJvbWUgPGJyPiBncmVhdCBoZSB3YXMgPGJyPiBidXQgYmV0cmF5ZWQgPGJyPiB0aHJpY2UgYmFja3dhcmRzPGJyPiA8YnI+IGhxam9sdmsgIA==");
}

function _t() {
    _b.innerText = _x1("SW50ZXJlc3QuLi4=");
    _b.style.color = _x1("d2hpdGU=");
    _e.style.color = _x1("d2hpdGU=");
    _c.innerText = "";
    _d.innerHTML = "";
    document.body.style.backgroundColor = _x1("YmxhY2s=");
    _z(100);
    _e.innerHTML = _x1("Pz8gPGJyPnlvdSBhcmUgaGVyZS4uLjxicj4geW91IGFyZSBub3QgdGhlIHNhbWUgYXMgb3RoZXJzPGJyPnRoYW5rIHlvdS4gPGJyPiB5b3UgYXJlIHdvcnRoIG1vcmUgdGhhbiB5b3UgcmVhbGlzZS4uLiA8YnI+PGJyPjxici9wbj5vcGVuIGFuZCBjbG9zZTxicj51cCBhbmQgZG93biA8YnI+b24gYW5kIG9mZjxicj4gd2l0aCB0d28gb3B0aW9ucyA6IDxicj44");
}

function _u() {
    _b.innerText = _x1("U3VycHJpc2U=");
    _b.style.color = _x1("d2hpdGU=");
    _e.style.color = _x1("d2hpdGU=");
    _c.innerText = "";
    _d.innerHTML = "";
    document.body.style.backgroundColor = _x1("IzJhMzQzOQ==");
    _y();
    _e.innerHTML = _x1("WW91IGtub3cgbWUgcmlnaHQ/PGJyPklmIHlvdSBjYWxsIG1lIHlvdXIgZnJpZW5kPGJyPnRoYW5rIHlvdS4gc28gbXVjaC48YnI+PGJyPj9fX19fX3RoZSBncmVhdC48YnI+");
}

function _v() {
    _b.innerText = "█ █ █ █";
    _b.style.color = _x1("d2hpdGU=");
    _e.style.color = _x1("d2hpdGU=");
    _c.innerText = "";
    _d.innerHTML = "";
    document.body.style.backgroundColor = _x1("Z3JleQ==");
    _y();
    _e.innerHTML = _x1("WW91IGRpZCBub3QgZ2l2ZSB1cC4uLjxicj4gVGVsbCBtZSBvbmUgdGhpbmcuLi48YnI+IHdoeT8gPGJyPiBBcmUgeW91IGhpZGluZyBzb21ldGhpbmc/PGJyPiBJcyB0aGVyZSBzb21ldGhpbmcgeW91IHdhbnQgdG8gc2F5Pzxicj48YnI+d2VsbC4uLiBOZXZlcm1pbmQuLi48YnI+SSBhbSBqdXN0IGdsYWQgeW91IGFyZSBoZXJlLiA8YnI+PGJyPjxicj4gLi4uPGJyPg==");
    _a.disabled = true;
    _a.value = "";
    _a.placeholder = _x1("ZGlzYWJsZWQ=");
    document.getElementById(_x1("YnRuMQ==")).disabled = true;
}
