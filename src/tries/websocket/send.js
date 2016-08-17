function EncodeHTMLForm( data )
{
    var params = [];

    for( var name in data )
    {
        var value = data[ name ];
        var param = encodeURIComponent( name ).replace( /%20/g, '+' )
            + '=' + encodeURIComponent( value ).replace( /%20/g, '+' );

        params.push( param );
    }

    return params.join( '&' );
} 
new Vue({
  el: '#body',
  data:{
    url: 'http://localhost:3000/test.cgi',
    ret: "",
    data: '',
    query: '"cmd":"git --version"'
  },
  methods:{
    send: function(){
      var that = this;
      console.log(that.data);
      $.get(`${that.url}?json={${that.query},"mkfile":"${that.data.replace(/\n/g, "\r\n")}"}`, (d) => {
        that.ret = d.responseText || d;
        console.log(that.ret);
      });
    }
  }
});
      /*
      var req = new XMLHttpRequest();
      req.onreadystatechange = function(){
        var READYSTATE_COMPLETED = 4;
        var HTTP_STATUS_OK = 200;

        if( this.readyState == READYSTATE_COMPLETED
         && this.status == HTTP_STATUS_OK )
        {
            // レスポンスの表示
            alert( this.responseText );
        } 
      };

      req.open('POST', this.url);
      req.setRequestHeader( 'Content-Type', 'application/x-www-form-urlencoded' );
      req.send( EncodeHTMLForm('{"cmd":"git%20--version"}') );
      */
      //document.form.submit();

