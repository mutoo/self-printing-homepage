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
        document.body.innerHTML = `<pre class="main">${htmlEntities(body)}</pre>`;

        let handler = new htmlparser.DomHandler(function(error, dom) {
            if (error) {
                console.error(error);
                return;
            }


            console.log(dom);

        });

        let parser = new htmlparser.Parser(handler, {decodeEntities: true});
        parser.write(body);
        parser.end();
    });
});
