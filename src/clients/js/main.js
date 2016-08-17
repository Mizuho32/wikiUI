// Ace
var editor = ace.edit("editor");
editor.commands.addCommand({
  name: 'render',
  bindKey: {win: 'Ctrl-Enter'},
  exec: (e)=>{
    //alert(editor.getValue());
    render();
  },
  readOnly: true
});
editor.getSession().setMode("ace/mode/asciidoc");
editor.setTheme("ace/theme/terminal");
editor.setOptions({
  fontSize: "12pt"
});


//asciidoctor
var options = Opal.hash({
  doctypee: 'inline', 
  attributes: [
    'showtitle', 
    'icons=font@',
    //'stylesheet=asciidoctor.css@'
  ]});
//var text =    document.getElementById("text");
var output =  document.getElementById('render');
var title = document.getElementById("title");
var render = ()=>{
if (Contaienr.rightview === 'render' )
  output.innerHTML = Opal.Asciidoctor.$convert(
    `= ${title.value || "タイトルを入力してください" }\n${editor.getValue()}`
  , options);
else if (Contaienr.rightview === 'html' )
  Contaienr.righttextarea = Opal.Asciidoctor.$convert(
    `= ${title.value || "タイトルを入力してください" }\n${editor.getValue()}`
  , options);
else{
  var now = new Date();
  console.log(now.toISOString());
  var day = now.toISOString().match(/(.+T)/)[1];
  var timezone = (m=now.toTimeString().match(/([\d:]+).+(\+\d{2})(\d{2})/))[1] + m[2] + ":" + m[3];
  var front =
`title: "${Contaienr.title}"
created_at: ${day + timezone}
excerpt: "${Contaienr.title}"
kind: ${Contaienr.kindselected}
`;
  if (Contaienr.htags.some( (e,i)=>e.length!==0 )){
    var htags = Contaienr.htags.filter( (e,i)=>e.length !== 0 );
    front += `htags:\n${htags.map((a)=>a.map(c=>c.text).join('/')).map(b=>`  - "${b}"`).join("\n")}\n`;
  }
  if (Contaienr.draft)
    front += "status: draft\n";
  if (Contaienr.mathselected !== 'none')
    front += `mathjax: ${Contaienr.mathselected}\n`;
  if (Contaienr.frontmatter !== '')
    front += Contaienr.frontmatter + "\n";
  Contaienr.righttextarea = 
`---
${front}---
${editor.getValue()}`;
console.log(Contaienr.mathselected);
}

};

  
//Vue
var Child = Vue.extend({
  template: '#child',
  data: function(){
    return {
      newhtag: '',
      index:null,
      htags:null,
      htag_holder:null
    };
  },
  created: function(){
    console.log(this.$parent.htags.length);
    this.index = this.$parent.htags.length;
    this.$parent.htags.push([]);
    this.htags = this.$parent.htags[this.index];
    this.htag_holder = this.$parent.htags_holder[this.index];
  },
  methods:{
    addhtag: function(ev){
      console.log(this);
      console.log(this.$parent.htags);
      var text = this.newhtag.trim();
      if(text){
        console.log(text);
        //this.$parent.htags[this.index].push({ text: text});
        this.htags.push({ text: text});
        this.newhtag = '';
      }
    },
    removehtags: function(){
      try{
        this.$parent.htags.some((v,i)=>{ 
          if(v === this.htags)  this.$parent.htags.splice(i, 1);});
        this.$parent.htags_holder.some((v,i)=>{ 
          if(v === this.htag_holder) this.$parent.htags_holder.splice(i, 1);});
      } catch(e){}
    },
    deletehtag: function(){
      if (this.newhtag.length === 0 ) this.htags.pop(1);
    }
  }
});
Vue.component('child', Child);


var Contaienr = new Vue({
  el: '.container',
  data:{
    title:        '',
    draft:        false,
    htags_holder: [ { type: 'child' } ],
    htags:        [],
    kinditems:[
      {text: 'article', value: 'article'}
    ],
    mathselected: 'none',
    mathitems:[
      {text: 'none',  value: 'none'},
      {text: 'ON',    value: 'on'  },
      {text: 'AMS',   value: 'AMS' }
    ],
    showauth:       true,
    toggled:        false,
    vimon:          false,
    fontsize:       parseInt(editor.getFontSize()),
    editorconf:     false,
    rightview:      'render',
    righttextarea:  '',
    kindselected:   'article',
    frontmatter:    '',

    commitbutton: "danger"
  },
  computed:{
    toggle: function(){
      return this.toggled ? 'V' : '∧';
    },
    ediconText: function(){
      return this.editorconf ?  "エディタ" : "エディタ設定";
    },
    rawviewText: function(){
      return this.rawview ? "rendered" : "raw";
    }
  },
  created: function(){
  },
  methods:{
    addhtagss: function(){
      console.log("HI");
      this.htags_holder.push({ type: 'child'});
    },
    switchauth: function(){
      this.toggled = !this.toggled;
      this.showauth = !this.showauth;
    },
    commit: function(){
      if ( this.title == "" || filer.filename == ""){
        alert("タイトルかファイル名が空です");
        return;
      }

      if (this.rightview !== "raw") this.raw();
      
      filer.mkfile("adoc", this.righttextarea);

      var msg = prompt("コミットメッセージを入力してください");
      
      if (msg == null || msg == "") return;

      filer.send(`cmd:git add ${filer.filename}.adoc;git commit -m '${msg}'`);
    },
    editorConf: function(){
      this.editorconf = ! this.editorconf;  
    },
    vimcheck: function(){
    console.log(editor.getKeyboardHandler());
      if (this.vimon)
        editor.setKeyboardHandler("ace/keyboard/vim");
      else
        editor.setKeyboardHandler(null);
    },
    fontinc: function(){
      this.fontsize++;
      this.fontsizechanged();
    },
    fontdec: function(){
      this.fontsize--;
      this.fontsizechanged();
    },
    fontsizechanged: function(){
      editor.setFontSize(this.fontsize);
    },
    render: function(){ this.rightview = "render"; render(); },
    html: function(){ this.rightview = "html"; render(); },
    console: function(){ this.rightview = "console"; render(); },
    raw: function(){ this.rightview = "raw"; render(); }
  },
  transitions: {
    auth: {
      beforeEnter: function(e){
        console.log("beforeEnter");
      },
      afterEnter: function(e){
        console.log("afterEnter");
        editor.resize();
      },
      enter: function(e){
        console.log('enter');
      },
      afterLeave: function(e){
        console.log("afterleave");
        editor.resize();
      }
    }
  }
});

render();
document.getElementById("preview").onclick = render;
