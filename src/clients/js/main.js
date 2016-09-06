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
var iso8601 = (now)=>{
  let day = now.toISOString().match(/(.+T)/)[1];
  let timezone = (m=now.toTimeString().match(/([\d:]+).+(\+\d{2})(\d{2})/))[1] + m[2] + ":" + m[3];
  return day + timezone;
};
var render = ()=>{
  if (Container.rightview === 'render' )
    output.innerHTML = Opal.Asciidoctor.$convert(
      `= ${title.value || "タイトルを入力してください" }\n${editor.getValue()}`
    , options);
  else if (Container.rightview === 'html' )
    Container.righttextarea = Opal.Asciidoctor.$convert(
      `= ${title.value || "タイトルを入力してください" }\n${editor.getValue()}`
    , options);
  else{
    var now = new Date();
    //console.log(now.toISOString());
    var day = now.toISOString().match(/(.+T)/)[1];
    var timezone = (m=now.toTimeString().match(/([\d:]+).+(\+\d{2})(\d{2})/))[1] + m[2] + ":" + m[3];
    var front =
    {
      kind: Container.kind
    };
    if (Container.htags.some( (e,i)=>e.length!==0 )){
      var htags = Container.htags.filter( (e,i)=>e.length !== 0 );
      front.htags = htags;
    }
    if (Container.draft)
      front.status = "draft";

    if (Container.mathjax != undefined)
      front.mathjax = Container.mathjax;

    if (Container.frontmatter !== ''){
      const f = jsyaml.load(Container.frontmatter);
      for (let k of Object.keys(f))
        front[k] = f[k];
    }
    //console.log(front, jsyaml.safeDump(front));
    Container.righttextarea = 
`---
title: "${Container.title}"
excerpt: "${Container.title}"
${jsyaml.safeDump(front)}created_at: ${Container.newarticle ? day + timezone : Container.created_at}
---
${editor.getValue()}`;
  //console.log(editor.getValue());
  }

};

  
//Vue

var Container = new Vue({
  el: '.container',
  data:{
    title:        '',
    draft:        false,
    htags:        [
      "",
    ],
    kind:  'article',
    kinditems:[
      {text: 'article', value: 'article'}
    ],
    mathjax: undefined,
    mathitems:[
      {text: 'none',  value: undefined},
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
    frontmatter:    '',
    newarticle: true,
    created_at: null,
    newtag: null,
    current: null
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
    },
    htagscmp: function(){
      return this.htags.map((el,i)=>el.split("/"));
    }
  },
  created: function(){
  },
  methods:{
    addhtag: function(){
      this.htags.push("");
    },
    addtag: function(row){
      this.htags[row] = (this.htags[row] && `${this.htags[row]}/`) + this.newtag; 
      this.newtag = "";
      this.htags.push(null);this.htags.pop();

      setTimeout(()=>document.getElementById("taginput").focus() ,10);
    },
    deletetag: function(row, col){
      let tmp = this.htags[row].split("/");
      tmp.pop();
      this.htags[row] = tmp.join("/");
      this.htags.push(null);this.htags.pop();

      setTimeout(()=>document.getElementById("taginput").focus() ,10);
    },
    deletehtag: function(row){
      this.htags.splice(row, 1);
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

      this.raw();
      
      if (this.newarticle)
        filer.file("mkfile", "adoc", this.righttextarea);
      else
        filer.file("owfile", "adoc", this.righttextarea);

      var msg = prompt("コミットメッセージを入力してください");
      
      if (msg == null || msg == "") return;

      filer.send(`cmd:git add ${filer.filename}.adoc;git commit -m '${msg}'`);
    },
		push: function(){
			if (confirm("pushします")) filer.send(`cmd:${config.push}`);
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
$(function () {
$('[data-toggle="tooltip"]').tooltip()
})
