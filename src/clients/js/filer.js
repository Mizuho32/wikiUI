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
      alert(this.pname);
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
        }

        //debug.log(that.ret);
      }
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
    mkfile: function(ext, content){
      if (this.filename == '') return;

      this.send(`mkfile,${this.filename}.${ext}:${content}`);
    },
    ShowContent: function(){
      this.data = 'cmd:ls -F';
      this.send();
    }
  }
});

filer.open();
