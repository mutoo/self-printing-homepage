import {compose, curry} from 'ramda';

export const node = (tag) => document.createElement(tag);
export const textNode = (text) => document.createTextNode(text);

export const addClass = curry((className, node) => {
    node.classList.add(className);
    return node;
});

export const setText = curry((text, node) => {
    node.innerText = text;
    return node;
});

export const setAttribute = curry((attr, value, node) => {
    node.setAttribute(attr, value);
    return node;
});

export const setAttributes = curry((attrs, node) => {
    for (let attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
            node[attr] = attrs[attr];
        }
    }
    return node;
});

export const appendTo = curry((container, node) => {
    container.appendChild(node);
    return node;
});

export const code = (code) => compose(setText(code), node)('code');
export const spanWithClass = curry((className, text) => {
    return compose(setText(text), addClass(className), node)('span');
});

export const lt = () => spanWithClass('angle-bracket')('<');
export const gt = () => spanWithClass('angle-bracket')('>');
export const slash = () => spanWithClass('angle-bracket')('/');
export const eq = () => spanWithClass('eq')('=');
export const quote = () => spanWithClass('quote')('"');
export const space = () => textNode(' ');

export const comment = spanWithClass('comment');
export const tag = spanWithClass('tag');
export const key = spanWithClass('key');
export const value = spanWithClass('value');

export const attribute = (k, v) => {
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
                addClass('link'),
                node)('a'));
            break;

        default:
            nodes.push(value(v));
    }

    nodes.push(quote());
    return nodes;
};
