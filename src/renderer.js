import {curry, map, compose} from 'ramda';

export default function renderer(container, dom) {
    if (dom instanceof Array) {
        dom.forEach((d) => {
            renderer(container, d);
        });
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

        case'tag':
        case 'script':
        case 'style':
            append(lt());
            append(tag(dom.name));

            for (let attr in dom.attribs) {
                if (dom.attribs.hasOwnProperty(attr)) {
                    append(space());
                    map(append)(attribute(attr, dom.attribs[attr]));
                }
            }

            append(gt());

            if (dom.name === 'a') {
                let a = compose(setAttributes(dom.attribs), addClass('link'), node)('a');
                renderer(a, dom.children);
                append(a);
            } else {
                renderer(container, dom.children);
            }

            switch (dom.name) {
                case 'meta':
                case'link':
                    break;
                default:
                    let group = spanWithClass('no-break')('');
                    append(group);
                    map(appendTo(group))([
                        lt(),
                        slash(),
                        tag(dom.name),
                        gt(),
                    ]);
            }
            break;

        case 'text':
            append(code(dom.data));
            break;

        default:
            throw new Error(`unrecognized dom: ${dom}`);
    }
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
