(function (window) {
    let tree = "https://api.github.com/repos/ethereum/eth2.0-specs/git/trees/master?recursive=1"
    let dir = document.getElementById('dir');
    let md = window.markdownit();
    let content = document.getElementById('content');
    let toc = document.getElementById('toc');


    function build_a(path) {
        url = "https://raw.githubusercontent.com/ethereum/eth2.0-specs/master/" + path
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
                render("https://raw.githubusercontent.com/ethereum/eth2.0-specs/master/" + mds[1])
            });
    }

})(window);