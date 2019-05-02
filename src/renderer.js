import {curry, map, compose, flatten} from 'ramda';

export default function renderer(container, dom) {
    return new Promise((resolve, reject) => {
        if (dom instanceof Array) {
            Promise.all(dom.map((d) => {
                return renderer(container, d);
            })).then(resolve, reject);
            return;
        }

        let append = appendTo(container);
        switch (dom.type) {
            case 'directive':
                append(comment(`<${dom.data}>`));
                break;

            case 'comment':
                append(comment(`<!--${dom.data}-->`));
                break;

            case 'tag':
            case 'script':
            case 'style':

                // <tag
                append(lt());
                append(tag(dom.name));

                // key1="value1" key2="value2"
                for (let attr in dom.attribs) {
                    if (dom.attribs.hasOwnProperty(attr)) {
                        map(append)(flatten([space(), attribute(attr, dom.attribs[attr])]));
                    }
                }

                // >
                append(gt());

                // make children in the a-tag clickable
                if (dom.name === 'a') {
                    let a = compose(append, setAttributes(dom.attribs), addClass('link'), node)('a');
                    renderer(a, dom.children);

                } else {

                    // render the children recursively
                    renderer(container, dom.children);
                }

                switch (dom.name) {
                    case 'meta':
                    case'link':
                        // some special tags don't need to be closed
                        break;

                    default:
                        // make the </tag> a group
                        let group = compose(append, spanWithClass('no-break'))('');
                        map(appendTo(group))([lt(), slash(), tag(dom.name), gt()]);
                }
                break;

            case 'text':
                // put the text in the code-tag so the line-breaks and spaces are took into account
                append(code(dom.data));
                break;

            default:
                reject(`unrecognized dom: ${dom}`);
        }

        resolve(container);
    });
}

let node = (tag) => document.createElement(tag);
let textNode = (text) => document.createTextNode(text);

let addClass = curry((className, node) => {
    node.classList.add(className);
    return node;
});

let setText = curry((text, node) => {
    node.innerText = text;
    return node;
});

let setAttribute = curry((attr, value, node) => {
    node.setAttribute(attr, value);
    return node;
});

let setAttributes = curry((attrs, node) => {
    for (let attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
            node[attr] = attrs[attr];
        }
    }
    return node;
});

let appendTo = curry((container, node) => {
    container.appendChild(node);
    return node;
});

let code = (code) => compose(setText(code), node)('code');
let spanWithClass = curry((className, text) => {
    return compose(setText(text), addClass(className), node)('span');
});

let lt = () => spanWithClass('angle-bracket')('<');
let gt = () => spanWithClass('angle-bracket')('>');
let slash = () => spanWithClass('angle-bracket')('/');
let eq = () => spanWithClass('eq')('=');
let quote = () => spanWithClass('quote')('"');
let space = () => textNode(' ');

let comment = spanWithClass('comment');
let tag = spanWithClass('tag');
let key = spanWithClass('key');
let value = spanWithClass('value');

let attribute = (k, v) => {
    let nodes = [];
    nodes.push(key(k));

    if (!v) return nodes;

    nodes.push(eq());
    nodes.push(quote());

    switch (k) {
        case 'src':
        case 'href':
            nodes.push(compose(
                setAttribute('href', v),
                setAttribute('target', '_blank'),
                setAttribute('tabIndex', '-1'),
                setText(v),
                node)('a'));
            break;

        default:
            nodes.push(value(v));
    }

    nodes.push(quote());
    return nodes;
};
