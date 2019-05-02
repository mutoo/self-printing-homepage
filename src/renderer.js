export default function renderer(container, dom) {
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
        case 'style':
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
                    renderer(a, d);
                });
                container.appendChild(a);
            } else {
                dom.children.forEach((d) => {
                    renderer(container, d);
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

// TODO: refactor these function with ramdajs
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