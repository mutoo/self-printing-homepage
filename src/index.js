import './index.scss';
import 'whatwg-fetch';
import 'es6-promise/auto';
import htmlparser from 'htmlparser2';

const links = {
    linkedin: 'https://www.linkedin.com/in/mutoo/',
    github: 'https://github.com/mutoo/',
    codepen: 'https://codepen.io/mutoo/',
    twitter: 'https://twitter.com/tmutoo/',
};

window.addEventListener('load', () => {
    let meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1.0';
    document.head.appendChild(meta);

    let main = document.querySelector('card');
    main.innerHTML = `<pre class="source">loading...</pre>`;

    fetch(window.location.href).then(data => {
        return data.text();
    }).then(body => {
        main.innerHTML = `<pre class="source"></pre>`;

        let handler = new htmlparser.DomHandler(function(error, dom) {
            if (error) {
                console.error(error);
                return;
            }

            let container = document.querySelector('.source');
            dom.forEach((d) => {
                translate(container, d);
            });

            let codes = container.querySelectorAll('code');
            codes.forEach((code) => {
                code.innerHTML = code.innerText.replace(/(\w+): (.+)/g, (_, site, username) => {
                    let link = links[site.toLowerCase()];
                    return `${site}: <a href="${link}" target="_blank">${username}</a>`;
                });
            });
        }, {
            withStartIndices: true,
            withEndIndices: true,
        });

        let parser = new htmlparser.Parser(handler, {
            decodeEntities: true,
            recognizeSelfClosing: true,
        });
        parser.write(body);
        parser.end();
    });
});

// Google Tag Manager
(function(w, d, s, l, i) {
    w[l] = w[l] || [];
    w[l].push({
        'gtm.start':
            new Date().getTime(), event: 'gtm.js',
    });
    let f = d.getElementsByTagName(s)[0],
        j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : '';
    j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;
    f.parentNode.insertBefore(j, f);
})(window, document, 'script', 'dataLayer', 'GTM-MZWF9KM');

function translate(container, dom) {
    switch (dom.type) {
        case 'directive':
            let span = document.createElement('span');
            span.classList.add('comment');
            span.innerText = `<${dom.data}>`;
            container.appendChild(span);
            break;

        case 'comment':
            span = document.createElement('span');
            span.classList.add('comment');
            span.innerText = `<!--${dom.data}-->`;
            container.appendChild(span);
            break;

        case'tag':
        case 'script':
            spanL(container);

            span = document.createElement('span');
            span.classList.add('tag');
            span.innerText = dom.name;
            container.appendChild(span);

            for (let attr in dom.attribs) {
                space(container);
                attribute(container, attr, dom.attribs[attr]);
            }

            spanR(container);

            if (dom.name === 'a') {
                let a = document.createElement('a');
                a.classList.add('link');
                for (let attr in dom.attribs) {
                    a[attr] = dom.attribs[attr];
                }
                dom.children.forEach((d) => {
                    translate(a, d);
                });
                container.appendChild(a);
            } else {
                dom.children.forEach((d) => {
                    translate(container, d);
                });
            }

            switch (dom.name) {
                case 'meta':
                case'link':
                    break;
                default:
                    let group = document.createElement('span');
                    group.classList.add('no-break');
                    spanL(group);
                    span = document.createElement('span');
                    span.classList.add('tag');
                    span.innerText = `/${dom.name}`;
                    group.appendChild(span);
                    spanR(group);
                    container.appendChild(group);
            }
            break;

        case 'text':
            text(container, dom.data);
            break;

        default:
            console.warn('unrecognized dom', dom);
    }
}

function text(container, text) {
    let code = document.createElement('code');
    code.innerText = text;
    container.appendChild(code);
}

function space(container) {
    let text = document.createTextNode(' ');
    container.appendChild(text);
}

function eq(container) {
    let span = document.createElement('span');
    span.classList.add('eq');
    span.innerText = '=';
    container.appendChild(span);
}

function spanL(container) {
    let span = document.createElement('span');
    span.classList.add('angle-bracket');
    span.innerText = '<';
    container.appendChild(span);
}

function spanR(container) {
    let span = document.createElement('span');
    span.classList.add('angle-bracket');
    span.innerText = '>';
    container.appendChild(span);
}

function quote(container) {
    let span = document.createElement('span');
    span.classList.add('quote');
    span.innerText = '"';
    container.appendChild(span);
}

function attribute(container, key, value) {
    let span = document.createElement('span');
    span.classList.add('key');
    span.innerText = key;
    container.appendChild(span);

    if (!value) return;

    eq(container);
    quote(container);

    switch (key) {
        case 'src':
        case 'href':
            let a = document.createElement('a');
            a.href = value;
            a.target = '_blank';
            a.tabIndex = -1;
            a.innerText = value;
            container.appendChild(a);
            break;
        default:
            span = document.createElement('span');
            span.classList.add('value');
            span.innerText = value;
            container.appendChild(span);
    }

    quote(container);
}
