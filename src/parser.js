import htmlparser from 'htmlparser2';

/**
 * Promisify htmlparser2
 * @param input
 * @param handlerOptions
 * @param parserOptions
 * @returns {Promise<any>}
 */
export default function parser(
    input,
    handlerOptions = {
        withStartIndices: true,
        withEndIndices: true,
    },
    parserOptions = {
        decodeEntities: true,
        recognizeSelfClosing: true,
        lowerCaseAttributeNames: false,
    }) {
    return new Promise((resolve, reject) => {
        let handler = new htmlparser.DomHandler(function(error, dom) {
            error && reject(error) || resolve(dom);
        }, handlerOptions);

        let parser = new htmlparser.Parser(handler, parserOptions);
        parser.write(input);
        parser.end();
    });
}
