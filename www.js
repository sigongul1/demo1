#!/usr/bin/env node

const http = require('http');
const qs = require('querystring');

// ============================================

var PORT = 8080;

http.createServer((req, res) => {
    // url
    let url = new URL(req.url, 'http://host');

    // read body
    req.setEncoding('utf8');
    let body = '';
    req.on('data', data => {
        body += data;
    });
    req.on('end', () => {
        // GET: query
        let query = {};
        for (let [k, v] of url.searchParams.entries()) {
            query[k] = Number.isNaN(Number(v)) ? v : Number(v);
        }
        req.query = query;

        // POST: body
        if (req.method == 'POST') {
            switch (req.headers['content-type']) {
                case 'application/x-www-form-urlencoded':
                    body = qs.parse(body);
                    break;

                case 'application/json':
                    try {
                        body = JSON.parse(body);
                    } catch {
                        body = {};
                    }
                    break;
            }
            req.body = body;
        }

        // route
        let h = getRouteHandler(req.method, url.pathname);
        h(req, res);
    });
}).listen(PORT);

console.log('server started on port:', PORT);

// ============================================

var BASE_DIR = "";
var routes = [];

function get(path, f) {
    let method = 'GET';
    path = BASE_DIR + path;
    routes.push({ method, path, f });
    sortRoutes();
}

function post(path, f) {
    let method = 'POST';
    path = BASE_DIR + path;
    routes.push({ method, path, f });
    sortRoutes();
}

function sortRoutes() {
    routes.sort((a, b) => b.path.length - a.path.length);
}

function getRouteHandler(method, path) {
    for (let e of routes) {
        if (e.method != method) continue;

        if (path.startsWith(e.path)) {
            return e.f;
        }
    }
    return defaultRoutes;
}

function defaultRoutes(req, res) {
    res.end('default');
}

// ============================================

get('/', (req, res) => {
    res.end(`
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width">
        <title>nice day</title>
        <style>
            html, body {
                margin: 0;
                width: 100%;
                color: #333;
            }

            input, select {
                min-width: 60px;
                height: 34px;
                box-sizing: border-box;
                color: #333;
                font-size: 18px;
            }

            button {
                min-width: 60px;
                height: 34px;
            }

            .card {
                border: 1px solid #bee5eb;
                border-radius: 5px;
                min-width: 300px;
                width: max-content;
            }

            .card > .card-head {
                background-color: #d1ecf1;
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
                min-height: 25px;
                padding: 10px;
                color: #31708f;
            }

            .card > .card-body {
                padding: 10px;
            }

            .card.primary {
                border-color: #b8daff;
            }

            .card.primary > .card-head {
                background-color: #cce5ff;
            }

            .card.success {
                border-color: #a3cfbb;
            }

            .card.success > .card-head {
                background-color: #d1e7dd;
            }

            .card.warn {
                border-color: #ffeeba;
            }

            .card.warn > .card-head {
                background-color: #fff3cd;
            }

            .card.danger {
                border-color: #f5c6cb;
            }

            .card.danger > .card-head {
                background-color: #f8d7da;
            }

            .row {
                width: 100%;
                margin: 8px auto;
                display: flex;
                flex-wrap: wrap;
            }

            .row > * {
                flex: auto;
                margin: 0px 2px;
            }

            .row label {
                flex-grow: 0;
                align-self: center;
                font-weight: bold;
            }

            .row .card {
                flex-grow: 0;
                margin: 5px 50px;
            }

        </style>
    </head>
    <body>
        <div class="row">
            <div class='card success'>
                <div class='card-head'>server time</div>
                <div class='card-body'>
                    <div class='row'>
                        <label id='svrts'></label>
                    </div>
                </div>
            </div>
        </div>
       
        <script>
            Date.prototype.toString = function () {
                let [Y, m, d, H, M, S] = [
                    this.getFullYear(),
                    this.getMonth() + 1,
                    this.getDate(),
                    this.getHours(),
                    this.getMinutes(),
                    this.getSeconds(),
                ];

                return \`\${Y}-\${m}-\${d} \${H}:\${M}:\${S}\`;
            }

            document.addEventListener("DOMContentLoaded", evt => {
                var t = ${Date.now()};
                let e = document.querySelector('#svrts');
                e.innerHTML = new Date(t).toString();
                setInterval(() => {
                    t += 1000;
                    e.innerHTML = new Date(t).toString();
                }, 1000);
            });
        </script>
    </body>
</html>
    `);
});
