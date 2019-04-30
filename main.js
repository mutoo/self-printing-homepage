fetch(window.location.href).then(data => {
    return data.text();
}).then(body => {
    document.write(htmlEntities(body));
});

function htmlEntities(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
