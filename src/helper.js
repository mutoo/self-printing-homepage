import {compose, curry} from 'ramda';

/**
 * create a element
 * @param tag - name of the tag
 * @return {any}
 */
export const node = (tag) => document.createElement(tag);

/**
 * create a text node
 * @param text - the content
 * @return {Text}
 */
export const textNode = (text) => document.createTextNode(text);

/**
 * add class to node
 */
export const addClass = curry((className, node) => {
    node.classList.add(className);
    return node;
});

/**
 * set innerText of node
 */
export const setText = curry((text, node) => {
    node.innerText = text;
    return node;
});

/**
 * set attribute to node
 */
export const setAttribute = curry((attr, value, node) => {
    node.setAttribute(attr, value);
    return node;
});

/**
 * set attributes to node
 */
export const setAttributes = curry((attrs, node) => {
    for (let attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
            setAttribute(attr, attrs[attr], node);
        }
    }
    return node;
});

/**
 * append a node to a container
 */
export const appendTo = curry((container, node) => {
    container.appendChild(node);
    return node;
});

/**
 * create a code node with text
 * @param code
 */
export const code = (code) => compose(setText(code), node)('code');

/**
 * create a span with class
 */
export const spanWithClass = curry((className, text) => {
    return compose(setText(text), addClass(className), node)('span');
});

/**
 * create a "<" node
 */
export const lt = () => spanWithClass('angle-bracket')('<');

/**
 * create a ">" node
 */
export const gt = () => spanWithClass('angle-bracket')('>');

/**
 * create a "/" node
 */
export const slash = () => spanWithClass('angle-bracket')('/');

/**
 * create a "=" node
 */
export const eq = () => spanWithClass('eq')('=');

/**
 * create a '"' node
 */
export const quote = () => spanWithClass('quote')('"');

/**
 * create a " " node
 */
export const space = () => textNode(' ');

/**
 * create <span class="comment"></span>
 */
export const comment = spanWithClass('comment');

/**
 * create <span class="tag"></span>
 */
export const tag = spanWithClass('tag');

/**
 * create <span class="key"></span>
 */
export const key = spanWithClass('key');

/**
 * create <span class="value"></span>
 */
export const value = spanWithClass('value');

/**
 * create a group of nodes for attribute: attr="value"
 * @param k - attr
 * @param v - value
 * @return {Array}
 */
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
