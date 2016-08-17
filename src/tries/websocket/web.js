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

var parent = new Vue({
  el: '#body',
  data:{
    connection: null,
    data: '',
    ret: "", 
    query: '"cmd":"ls"',
    files: [],
    newname: "",
    counter: 0, 
    lastsent: ""
  },
  methods:{
    open: function(){
      var that = this;
      this.connection = new WebSocket("ws://localhost:8000")

      this.connection.onopen = function(){
        console.log("open");
      };

      this.connection.onerror = function(e){
        console.log("error" + e);
      };
      
      this.connection.onmessage = function(e){
        that.ret = e.data;
        if (that.lastsent.match(/ls/)) ShowContent(that);
      }
    },
    send: function(){
      this.connection.send( this.lastsent = `${this.data}`);
    },
    addfolder: function(){
      //this.newname = `folder ${this.counter++}`;
      this.files.push({type: 'folder', name:`folder ${this.counter++}`});
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
      this.data = 'cmd:ls -F';
      this.send();
      ShowContent(this); 
    }
  }
});

function ShowContent(that){
  that.files = [];
  that.ret.slice(0,that.ret.indexOf(",")).split("\n").forEach((e,i,ar)=>{
    if(e === "") return;
    if (e.match(/^.+\//)){
      that.files.push({type: 'folder', name:e});
    }
    else{
      that.files.push({type: 'file', name:e});
    }
  });
}

