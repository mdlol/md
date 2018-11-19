(function (window) {
    const urlParams = new URLSearchParams(window.location.search);
    const r = urlParams.get('r') || "ethereum/eth2.0-specs";
    const [user, repo] = r.split("/")
    const tree = `https://api.github.com/repos/${user}/${repo}/git/trees/master?recursive=1`
    const dir = document.getElementById('dir');
    const md = window.markdownit({
        langPrefix: 'language-',
        linkify: true,
        highlight: (str, lang) => {
            if (lang && hljs.getLanguage(lang)) {
                try {
                    return hljs.highlight(lang, str).value;
                } catch (__) { }
            }

            return ''; // use external default escaping
        }
    });
    const content = document.getElementById('content');
    const toc = document.getElementById('toc');

    document.getElementById('repository').innerHTML = `<h5>${user}/${repo}</h5>`



    function build_a(path) {
        url = `https://raw.githubusercontent.com/${user}/${repo}/master/${path}`
        return `<a href="#" onclick="render('${url}')">${path}</a>`
    }

    function build_dir(array) {
        lis = array
            .map((path) => `<li>${build_a(path)}</li>`)
            .join("");
        dir.innerHTML = `<ul>${lis}</ul>`;

    }

    window.render = function (url) {
        fetch(url)
            .then((res) => res.text())
            .then((text) => {
                content.innerHTML = md.render(text);
            })
            .then(() => {
                toc.innerHTML = "";
                new Toc('content', {
                    level: 4,
                    top: 0,
                    class: 'toc',
                    targetId: 'toc'
                });
            }
            );
    }

    window.onload = function () {
        fetch(tree)
            .then((res) => res.json())
            .then((json) => {
                mds = json.tree
                    .filter((node) => node.path.slice(-3) == ".md")
                    .map((node) => node.path)
                build_dir(mds)
                default_md =
                    mds.filter((md) => md.startsWith("README"))[0]
                    || mds[0]
                render(`https://raw.githubusercontent.com/${user}/${repo}/master/${default_md}`)
            });
    }

})(window);