import './index.scss';
import 'whatwg-fetch';
import 'es6-promise/auto';
import {htmlEntities} from './utils';
import htmlparser from 'htmlparser2';

window.addEventListener('load', () => {
    document.body.innerHTML = `<pre class="main">loading...</pre>`;

    fetch(window.location.href).then(data => {
        return data.text();
    }).then(body => {
        // simple output plain text
        document.body.innerHTML = `<pre class="main"></pre>`;

        let handler = new htmlparser.DomHandler(function(error, dom) {
            if (error) {
                console.error(error);
                return;
            }

            let container = document.querySelector('.main');
            dom.forEach((d) => {
                translate(container, d);
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

function translate(container, dom) {
    switch (dom.type) {
        case 'directive':
            let span = document.createElement('span');
            span.innerText = `<${dom.data}>`;
            container.append(span);
            break;

        case'tag':
        case 'script':
            spanL(container);

            span = document.createElement('span');
            span.innerText = dom.name;
            container.append(span);

            for (let attr in dom.attribs) {
                space(container);
                attribute(container, attr, dom.attribs[attr]);
            }

            spanR(container);

            if (dom.name === 'a') {
                let a = document.createElement('a');
                a.href = dom.attribs.href;
                a.title = dom.attribs.title;
                a.target = dom.attribs.target;
                dom.children.forEach((d) => {
                    translate(a, d);
                });
                container.append(a);
            } else {
                dom.children.forEach((d) => {
                    translate(container, d);
                });
            }

            switch (dom.name) {
                case 'html':
                case 'meta':
                case'link':
                    break;
                default:
                    span = document.createElement('span');
                    span.innerText = `</${dom.name}>`;
                    container.append(span);
            }
            break;

        case 'text':
            container.append(dom.data);
            break;

        default:
            console.warn('unrecognized dom', dom);
    }
}

function space(container) {
    container.append(' ');
}

function eq(container) {
    let span = document.createElement('span');
    span.innerText = '=';
    container.append(span);
}

function spanL(container) {
    let span = document.createElement('span');
    span.innerText = '<';
    container.append(span);
}

function spanR(container) {
    let span = document.createElement('span');
    span.innerText = '>';
    container.append(span);
}

function quote(container) {
    let span = document.createElement('span');
    span.innerText = '"';
    container.append(span);
}

function attribute(container, key, value) {
    let span = document.createElement('span');
    span.innerText = key;
    container.append(span);

    eq(container);
    quote(container);

    switch (key) {
        case 'src':
        case 'href':
            let a = document.createElement('a');
            a.href = value;
            a.innerText = value;
            container.append(a);
            break;
        default:
            span = document.createElement('span');
            span.innerText = value;
            container.append(span);
    }

    quote(container);
}
