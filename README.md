# wikiUI
rogywiki用のUI

# Init
```
$ npm install
$ bower install
$ gulp js
```

```yaml:servers/servers.yaml
:article: "http://localhost:4000/new.html"    # UI page URL
:out: 153                                     # /dev/pts/153, for Debug
:bundle: "/home/hoge/.rbenv/shims/bundle"     # bundler
:root: "/home/hoge/"                          # filer root directory
:filer:
  :host: "localhost"                          # filer url
  :port: 8000                                 # filer port
```

```javascript:js/config.js
var config = {
  filer: "localhost:8000"
}
```
