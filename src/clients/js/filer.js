var debug = console;

var Folder = Vue.extend({
  template: "#folder",
  data: function(){
    return {
    };
  },
  props:[
    'pname'
  ],
  created: function(){
    //console.log(`creder ${this.$parent.newname} name:${this.pname}`);
  },
  methods: {
    click: function(){
      //alert(this.pname);
      this.$parent.move(this.pname);
    }
  }
});
Vue.component('folder', Folder);

var File = Vue.extend({
  template: "#file",
  data: function(){
    return {
    };
  },
  props:[
    'pname'
  ],
  created: function(){
    //console.log(`crele ${this.pname}`);
    //this.name = this.$parent.newname;
  },
  methods: {
    click: function(){
      //alert(this.pname);
      this.$parent.data = `cmdr:cat ${this.pname}`;
      this.$parent.send();
    }
  },
  computed: {
    name: function(){
      var limit = 17;
      if (this.pname.length < limit) return this.pname;
      else if(m = this.pname.match(/^.+\.(.+)$/) )
        return `${this.pname.slice(0, limit-m[1].length - 1)}~.${m[1]}`;
      else
        return this.pname.slice(0, limit);
    }
  }
});
Vue.component('file', File);

var filer = new Vue({
  el: '#filemanager',
  data:{
    connection: null,
    data: '',
    ret: "", 
    query: '"cmd":"ls"',
    files: [],
    counter: 0, 
    server: config.filer,
    fileron: true,
    filename: ''
  },
  methods:{
    open: function(){
      var that = this;
      this.connection = new WebSocket(`ws://${this.server}`)

      this.connection.onopen = function(){
        console.log("open");
        that.ShowContent();
      };

      this.connection.onerror = function(e){
        console.log("error" + e);
      };
      
      this.connection.onmessage = function(e){
        that.ret = e.data;

        try{
          if (m=that.ret.match(/^cmd:ls.*:\n((?:.|\s)*)/)){
            that.files = [];
            m[1].slice(0,m[1].indexOf(",")).split("\n").forEach((e,i,ar)=>{
              if(e === "") return;
              if (e.match(/^.+\//)){
                that.files.push({type: 'folder', name:e});
              }
              else{
                that.files.push({type: 'file', name:e});
              }
            });
          }else if (m=that.ret.match(/^cmdr:cat\s+(.*):\n((?:.|\s)*)/)){
            if ( (filename = m[1].match(/^(.+)\.adoc$/)) != null && confirm(`Open ${filename[0]} ?`) ){
              // load a existing file
              let file = m[2].match(/---\n((?:.|\s)+?)---\n((?:.|\s)*)$/);
              if (file == null)  throw new TypeError(`File open failed!!\n${m[2]}`);
              console.log(file);
              that.filename = filename[1];
              editor.setValue(file[2]);
              Container.newarticle = false;

              //let f = m[2].match(/---\n((?:.|\s)+?)\n---/);
              //console.log(f[1]);
              let frontmatters = jsyaml.load(file[1]);
              frontmatters.created_at = iso8601(frontmatters.created_at);
              console.log(frontmatters);
              for(let f of ["title", "excerpt", "kind", "mathjax", "created_at"]){
                Container[f] = frontmatters[f];
                delete frontmatters[f];
              }
              Container.draft = (frontmatters.status && true) || false;
              delete frontmatters["status"]

              if (frontmatters.htags != null){
                Container.htags = frontmatters.htags;
                delete frontmatters["htags"]
              }

              if (Object.keys(frontmatters).length != 0)
                Container.frontmatter = jsyaml.safeDump( frontmatters );
              console.log(frontmatters);

            }else
              alert("Asciidoc文書ではない可能性が有ります");
          }else if (that.ret.match(/^File already/)){
            alert(that.ret);
          }
        } catch(e){
          const err = `${e.name}\n${e.message}\n${e.stack}`;
          alert(err);
          console.log(err);
        }
      } // connnection
    },
    send: function(o){
      if (o != null) this.data = o;
      this.connection.send(`${this.data}`);
    },
    conclose: function(){
      this.connection.close();
    },
    addfolder: function(){
      //this.newname = `folder ${this.counter++}`;
      var f = prompt("Folder Name");
      if (f == "" || f == null) return;

      this.send(`cmd:mkdir ${f}`)
      this.files.push({type: 'folder', name:f});
    },
    addfile: function(){
      //this.newname = `file ${this.counter++}`;
      this.files.push({type: 'file', name:`file ${this.counter++}`});
    },
    up: function(){
      this.move('');
    },
    move: function(to){
      this.connection.send(`cmd:cd ${to}`);
      this.ShowContent(); 
    },
    file: function(cmd,ext, content){
      if (this.filename == '') return;

      this.send(`${cmd},${this.filename}.${ext}:${content}`);
    },
    ShowContent: function(){
      this.data = 'cmd:ls -p';
      this.send();
    }
  }
});

filer.open();
