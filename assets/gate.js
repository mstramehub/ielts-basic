/* IELTS BASIC · Ms Trâm English Hub — màn hình mật khẩu dùng chung cho mọi trang.
   Mật khẩu lưu ở config.json (thư mục gốc) dưới dạng mã hoá SHA-256. */
(function(){
  var SALT='mstram-ielts-basic:';
  var BASE=new URL('..',document.currentScript.src).href;
  /* Tự nhận tên kho từ địa chỉ GitHub Pages, để đổi tên kho không làm hỏng mật khẩu */
  var REPO='mstramehub/ielts-basic';
  (function(){var u=new URL(BASE);var m=u.hostname.match(/^([^.]+)\.github\.io$/);var seg=u.pathname.split('/').filter(Boolean)[0];if(m&&seg)REPO=m[1]+'/'+seg;})();
  var CONFIG_URLS=[BASE+'config.json','https://raw.githubusercontent.com/'+REPO+'/main/config.json'];
  var EDIT_URL='https://github.com/'+REPO+'/edit/main/config.json';
  var LOGO=BASE+'assets/logo.png';
  var DEFAULT={"enabled":true,"student":"e3531ed59cad3a2af761cbf87a8e5ab2332a74ba9056c57ab8ac8723c878612a","teacher":"46eea834361a61aaecd68bab05e03160a6b4bc6e566dfba93b22076c142b4009"};
  var unlock; window.__GATE=new Promise(function(r){unlock=r;});
  document.body.classList.add('locked');
  var gate=document.createElement('div'); gate.id='gate'; gate.setAttribute('role','dialog'); gate.setAttribute('aria-label','Nhập mật khẩu');
  gate.innerHTML='<div class="g-card" id="g-card"><p class="g-sub">Đang tải…</p></div>';
  document.body.insertBefore(gate,document.body.firstChild);
  var card=gate.firstChild, cfg=DEFAULT;
  var ls={get:function(k){try{return localStorage.getItem('ipa-ca:'+k);}catch(e){return null;}},set:function(k,v){try{localStorage.setItem('ipa-ca:'+k,v);}catch(e){}}};
  function sha(t){
    if(!(window.crypto&&crypto.subtle)) return Promise.reject(new Error('nocrypto'));
    return crypto.subtle.digest('SHA-256',new TextEncoder().encode(SALT+t)).then(function(b){return Array.from(new Uint8Array(b)).map(function(x){return x.toString(16).padStart(2,'0');}).join('');});
  }
  function loadCfg(){
    var i=0;
    function next(){
      if(i>=CONFIG_URLS.length) return Promise.resolve(DEFAULT);
      var u=CONFIG_URLS[i++];
      return fetch(u+'?t='+Date.now(),{cache:'no-store'}).then(function(r){if(!r.ok) throw 0; return r.json();})
        .then(function(j){ if(j&&j.student&&j.teacher) return j; throw 0; }).catch(next);
    }
    return next();
  }
  function enter(){ document.body.classList.remove('locked'); gate.hidden=true; unlock(); }
  function head(){return '<div class="g-logo"><img src="'+LOGO+'" alt="Logo Ms Trâm English Hub"><div><b>Ms Trâm</b><span>english hub</span></div></div><h1 class="g-title">IELTS <span>BASIC</span></h1>';}
  var foot='<div class="g-foot"><span>Chưa có mật khẩu? Liên hệ cô Trâm:</span><span>Zalo / Hotline: <strong>079 29 51 529</strong> · <strong>0898 123 696</strong></span><span>12 Lê Đình Chinh, Quy Nhơn Nam</span></div>';
  function pwField(id,label,ph){return '<div class="g-field"><label for="'+id+'">'+label+'</label><div class="g-row"><input class="g-input" id="'+id+'" type="password" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="'+(ph||'')+'"><button type="button" class="g-eye" data-for="'+id+'">Hiện</button></div></div>';}
  function wireEyes(){card.querySelectorAll('.g-eye').forEach(function(b){b.onclick=function(){var i=document.getElementById(b.dataset.for);var s=i.type==='password';i.type=s?'text':'password';b.textContent=s?'Ẩn':'Hiện';};});}
  function $(id){return document.getElementById(id);}

  function showStudent(){
    card.innerHTML=head()+'<p class="g-sub">Tiếng Anh nền tảng · Nhập mật khẩu lớp học để vào bài.</p>'+
      pwField('g-pw','Mật khẩu học viên','Nhập mật khẩu…')+
      '<p class="g-err" id="g-err" role="alert"></p><button type="button" class="g-btn" id="g-go">Vào học</button>'+foot+
      '<button type="button" class="g-link" id="g-teacher">Dành cho giáo viên</button>';
    wireEyes();
    var inp=$('g-pw'), err=$('g-err');
    function tryIt(){
      var v=inp.value.trim(); if(!v){err.textContent='Em chưa nhập mật khẩu.';inp.focus();return;}
      sha(v).then(function(hh){
        if(hh===cfg.student){ ls.set('pass',hh); enter(); }
        else if(hh===cfg.teacher){ showTeacher(); }
        else { err.textContent='Mật khẩu chưa đúng. Kiểm tra lại chữ hoa, chữ thường hoặc hỏi cô Trâm.'; inp.select(); }
      }).catch(function(){err.textContent='Trình duyệt này không kiểm tra được mật khẩu. Hãy mở bằng Chrome, Safari hoặc Edge bản mới.';});
    }
    $('g-go').onclick=tryIt;
    inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();tryIt();}};
    $('g-teacher').onclick=showTeacherLogin;
    inp.focus();
  }
  function showTeacherLogin(){
    card.innerHTML=head()+'<p class="g-sub">Khu vực giáo viên: đổi mật khẩu học viên, đổi mật khẩu giáo viên, bật hoặc tắt yêu cầu mật khẩu.</p>'+
      pwField('g-tpw','Mật khẩu giáo viên')+'<p class="g-err" id="g-err" role="alert"></p>'+
      '<button type="button" class="g-btn" id="g-tgo">Đăng nhập</button><button type="button" class="g-link" id="g-back">← Quay lại trang học viên</button>';
    wireEyes();
    var inp=$('g-tpw'), err=$('g-err');
    function tryIt(){ sha(inp.value.trim()).then(function(hh){ if(hh===cfg.teacher) showTeacher(); else { err.textContent='Mật khẩu giáo viên chưa đúng.'; inp.select(); } }).catch(function(){err.textContent='Trình duyệt này không hỗ trợ kiểm tra mật khẩu.';}); }
    $('g-tgo').onclick=tryIt;
    inp.onkeydown=function(e){if(e.key==='Enter'){e.preventDefault();tryIt();}};
    $('g-back').onclick=showStudent;
    inp.focus();
  }
  function showTeacher(){
    var on=cfg.enabled!==false;
    card.innerHTML=head()+'<p class="g-ok">Đã đăng nhập giáo viên.</p>'+
      '<label class="g-toggle"><input type="checkbox" id="g-on"'+(on?' checked':'')+'> Yêu cầu học viên nhập mật khẩu</label>'+
      pwField('g-new','Mật khẩu học viên mới','Để trống nếu giữ nguyên')+
      pwField('g-newt','Mật khẩu giáo viên mới','Để trống nếu giữ nguyên')+
      '<p class="g-err" id="g-err" role="alert"></p><button type="button" class="g-btn" id="g-make">Tạo nội dung cài đặt mới</button>'+
      '<div id="g-result" hidden></div><button type="button" class="g-btn line" id="g-enter">Vào trang học</button>'+
      '<button type="button" class="g-link" id="g-back">← Đăng xuất</button>';
    wireEyes();
    $('g-enter').onclick=enter; $('g-back').onclick=showStudent;
    $('g-make').onclick=function(){
      var err=$('g-err'); err.textContent='';
      var ns=$('g-new').value.trim(), nt=$('g-newt').value.trim(), en=$('g-on').checked;
      if(ns&&ns.length<4){err.textContent='Mật khẩu học viên cần ít nhất 4 ký tự.';return;}
      if(nt&&nt.length<6){err.textContent='Mật khẩu giáo viên cần ít nhất 6 ký tự.';return;}
      if(ns&&nt&&ns===nt){err.textContent='Mật khẩu giáo viên phải khác mật khẩu học viên.';return;}
      Promise.all([ns?sha(ns):Promise.resolve(cfg.student), nt?sha(nt):Promise.resolve(cfg.teacher)]).then(function(r){
        var d=new Date(), stamp=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
        var json=JSON.stringify({enabled:en,student:r[0],teacher:r[1],updated:stamp},null,2);
        var box=$('g-result'); box.hidden=false;
        box.innerHTML='<div class="g-field"><label for="g-json">Nội dung cài đặt mới</label><textarea class="g-out" id="g-json" rows="7" readonly></textarea></div>'+
          '<button type="button" class="g-btn line" id="g-copy">Sao chép nội dung</button>'+
          '<ol class="g-steps"><li>Bấm <b>Sao chép nội dung</b> ở trên.</li>'+
          '<li>Mở <a href="'+EDIT_URL+'" target="_blank" rel="noopener">file config.json trên GitHub ↗</a> (đăng nhập tài khoản mstramehub).</li>'+
          '<li>Xoá hết nội dung cũ, dán nội dung mới vào, bấm <b>Commit changes</b>.</li>'+
          '<li>Khoảng 5 phút sau, cài đặt mới có hiệu lực cho mọi mục. Học viên đang dùng mật khẩu cũ sẽ phải nhập mật khẩu mới.</li></ol>'+
          '<p class="g-sub" style="font-size:13px">Hãy ghi nhớ mật khẩu mới. Trang chỉ lưu mã hoá nên không xem lại được mật khẩu.</p>';
        var ta=$('g-json'); ta.value=json;
        $('g-copy').onclick=function(){
          var b=this, done=function(){b.textContent='Đã sao chép ✓';};
          if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(json).then(done,function(){ta.select();b.textContent='Đã chọn — nhấn Ctrl+C hoặc giữ để sao chép';});
          else {ta.select();try{document.execCommand('copy');done();}catch(e){b.textContent='Nhấn giữ để sao chép';}}
        };
        box.scrollIntoView({block:'nearest'});
      });
    };
  }
  loadCfg().then(function(c){
    cfg=c;
    if(cfg.enabled===false || ls.get('pass')===cfg.student) return enter();
    showStudent();
  });
})();
