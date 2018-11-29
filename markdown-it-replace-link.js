'use strict';
// https://github.com/martinheidegger/markdown-it-replace-link/

(function(window){
function replaceAttr(token, attrName, replace, env) {
    token.attrs.forEach(function (attr) {
        if (attr[0] === attrName) {
            attr[1] = replace(attr[1], env, token);
        }
    });
}

window.markdownitReplaceLink = function (md) {
    md.core.ruler.after(
        'inline',
        'replace-link',
        function (state) {
            var replace = md.options.replaceLink;
            if (typeof replace === 'function') {
                state.tokens.forEach(function (blockToken) {
                    if (blockToken.type === 'inline' && blockToken.children) {
                        blockToken.children.forEach(function (token) {
                            var type = token.type;
                            if (type === 'link_open') {
                                replaceAttr(token, 'href', replace, type);
                            } else if (type === 'image') {
                                replaceAttr(token, 'src', replace, type);
                            }
                        }); 
                    }
                }); 
            }
            return false;
        }
    );
};
})(window);