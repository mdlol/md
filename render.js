(function (window) {
    const urlParams = new URLSearchParams(window.location.search);
    const r = urlParams.get('r') || "ethereum/eth2.0-specs";
    const [user, repo] = r.split("/")
    document.getElementById('repository').innerHTML = `<h1>${user}/${repo}</h1>`


    let tree = `https://api.github.com/repos/${user}/${repo}/git/trees/master?recursive=1`
    let dir = document.getElementById('dir');
    let md = window.markdownit({
        langPrefix: 'language-',
        linkify: true,
        highlight: function (str, lang) {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }

            return ''; // use external default escaping
        }
    });
    let content = document.getElementById('content');
    let toc = document.getElementById('toc');


    function build_a(path) {
        url = `https://raw.githubusercontent.com/${user}/${repo}/master/${path}`
        return ('<a onclick="render(\'' + url + '\')">' + path + '</a>')
    }

    function build_dir(array) {
        uls = array.map(function (path) {
            return ("<li>" + build_a(path) + "</li>")
        }).join("");
        dir.innerHTML = "<ul>" + uls + "</ul>";

    }

    window.render = function (url) {
        fetch(url)
            .then((res) => res.text())
            .then(
                function (text) {
                    content.innerHTML = md.render(text);
                }
            ).then(
                function () {
                    toc.innerHTML = "";
                    new Toc('content', {
                        'level': 4,
                        'top': 0,
                        'class': 'toc',
                        'targetId': 'toc'
                    });
                }
            );



    }

    window.onload = function () {
        fetch(tree)
            .then((res) => res.json())
            .then(function (json) {
                mds = json.tree
                    .filter(function (node) { return (node.path.slice(-3) == ".md") })
                    .map(function (node) { return (node.path) })
                build_dir(mds)
                default_md = mds.filter((md) => md.startsWith("README"))[0] || mds[0]
                render(`https://raw.githubusercontent.com/${user}/${repo}/master/${default_md}`)
            });
    }

})(window);