(function (window) {
    const urlParams = new URLSearchParams(window.location.search);
    const r = urlParams.get('r') || "ethereum/eth2.0-specs";
    const wiki = urlParams.get('wiki') || "";
    const p = urlParams.get('p') || "";
    const [user, repo] = r.split("/")
    const tree = `https://api.github.com/repos/${user}/${repo}/git/trees/master?recursive=1`
    const dir = document.getElementById('dir');
    const content = document.getElementById('content');
    const toc = document.getElementById('toc');
    const repository = document.getElementById('repository');
    const current_dir = p.split("/").slice(0, -1).join("/");
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
        },
        replaceLink: function (link, type) {
            if (!link.startsWith("http") && !link.startsWith("#")) {
                if (type === 'link_open') {
                    return `?p=${current_dir}/${link}`;
                } else if (type === 'image') {
                    return `https://raw.githubusercontent.com/${user}/${repo}/master/${current_dir}/${link}`;
                }
            } else {
                return link
            }
        }
    }).use(window.markdownitReplaceLink);

    md.renderer.rules.table_open = function (tokens, idx) {
        return '<table class="table table-striped">';
    };


    function build_a(path, file_name) {
        return `<a href="?r=${user}/${repo}&p=${path}">📄 ${file_name}</a>`
    }
    function path_to_tree(path_chunks, tree, path) {
        if (path_chunks.length === 1) {
            tree.push({
                name: path_chunks[0],
                type: 'file',
                path: path
            })
        } else {
            node_index = tree.findIndex((node) => node.name === path_chunks[0])
            if (node_index > -1) {
                tree[node_index].children = path_to_tree(path_chunks.slice(1), tree[node_index].children, path)
            } else {
                tree.push({
                    name: path_chunks[0],
                    type: 'dir',
                    children: path_to_tree(path_chunks.slice(1), [], path)
                })
            }
        }
        return tree
    }
    function path_tree_to_dom(tree) {
        result = tree.map((node) => {
            if (node.type === 'file') {
                return `<li>${build_a(node.path, node.name)}</li>`
            } else {
                return `<li>📁 ${node.name}</li>${path_tree_to_dom(node.children)}`
            }
        }).join('');
        return `<ul>${result}</ul>`
    }

    function build_dir(paths) {
        paths_with_init = [[]].concat(paths)
        dir_tree = paths_with_init.reduce((tree, path) => {
            chunks = path.split('/')
            return path_to_tree(chunks, tree, path)
        })

        dom = path_tree_to_dom(dir_tree, [])
        dir.innerHTML = dom
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
            });
    }

    window.onload = function () {
        if (wiki.startsWith('https://github.com')) {
            [_user, _repo, _wiki, page] = wiki.replace('https://github.com/', '').split('/');
            repository.innerHTML = `<a href="https://github.com/${_user}/${_repo}/wiki"><h5>${_user}/${_repo}</h5></a>`
            render(`https://raw.githubusercontent.com/wiki/${_user}/${_repo}/${page}.md`);
        } else {
            fetch(tree)
                .then((res) => res.json())
                .then((json) => {
                    repository.innerHTML = `<a href="https://github.com/${user}/${repo}"><h5>${user}/${repo}</h5></a>`
                    mds = json.tree
                        .filter((node) => node.path.slice(-3) == ".md")
                        .map((node) => node.path)
                    build_dir(mds)
                    default_md = p
                        || mds.filter((md) => md.startsWith("README"))[0]
                        || mds[0]
                    render(`https://raw.githubusercontent.com/${user}/${repo}/master/${default_md}`)
                });
        }
    }

})(window);