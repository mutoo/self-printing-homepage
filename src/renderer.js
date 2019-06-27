import {curry, map, compose, flatten} from 'ramda';
import {
    addClass,
    appendTo,
    attribute,
    code,
    comment,
    gt,
    lt,
    node,
    setAttributes,
    slash,
    space,
    spanWithClass,
    tag,
} from './helper';

/**
 *
 * @param container - To keep the rendered output
 * @param dom - The dom tree
 */
export default function renderer(container, dom) {
    if (dom instanceof Array) {
        return dom.forEach((d) => {
            renderer(container, d);
        });
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
            throw new Error(`unrecognized dom: ${dom}`);
    }
}
