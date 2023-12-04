var
  blogId = '1470457395436625875',
  img_base = 'https://bootleq.github.io/blogspot/',
  pageType = null,
  leq_se1 = null,
  leq_se2 = null,
  userConfigPrefs = {},
  prefs_jar = {};

function BlogNoise (src) {
  this.audio = new Audio();
  this.audio.src = src;

  this.play = function() {
    if (userConfigPrefs.enableSE) {
      this.audio.play();
    }
  };
}

jQuery.noConflict();
jQuery(document).ready( function($){
  pageType = $('#dataBlogPageType').attr('value') ? $('#dataBlogPageType').attr('value').replace('type_','') : "type_undefined";
  prefs_jar = $.cookieJar('prefs', {expires:86400000, path:'/', cacheCookie:false});   // 100 天

  leq_se1 = new BlogNoise(img_base + 'media/cursor1.mp3');
  leq_se2 = new BlogNoise(img_base + 'media/close03.mp3');

  dp.SyntaxHighlighter.ClipboardSwf = img_base + 'media/clipboard.swf';
  dp.SyntaxHighlighter.BloggerMode();

  maincontentFx($);
  SidebarFx($);

  $('a[rel=external]').attr('target','_blank');
  $('noscript').hide();
});

function SidebarFx($)
{
  let $toggle = $('#toggleSidebarBtn');
  let $sidebar = $('#sidebar');

  $('#toggleSidebarBtn').click(() => {
    let top = $toggle.offset().top;
    $sidebar.css({top: top + 20}).toggleClass('visible');
  });

    // 搜尋列
    $('#search_input').focus( function(){$(this).select();} );
    // sidebar widget 自動折疊
    $('#Profile1, #Label1, #Feed2,#HTML1,#BlogArchive1').children('.widget-content').hide();
    // sidebar widget 折疊
    $('#Feed2,#Label1,#HTML1,#BlogArchive1,#Profile1').find('h2:eq(0) span').click(function(){
        leq_se1.play();
        $(this).closest('h2').next('.widget-content').toggle();
    });

  // 瀏覽偏好   // http://www.jdempster.com/2007/08/11/jquery-cookiejar/
  userConfigPrefs = prefs_jar.toObject();
  $.extend( { enableSE:true, lightbox:true }, userConfigPrefs );
  if( userConfigPrefs.enableSE && userConfigPrefs.lightbox ) { prefs_jar.destroy(); }

  if( userConfigPrefs.enableSE===false ) { $('#id_soundbb_switch').addClass('config-off'); }
  else { userConfigPrefs.enableSE = true; }
  if( userConfigPrefs.lightbox===false ) { $('#id_lightbox_switch').addClass('config-off'); }
  else { userConfigPrefs.lightbox = true; }

  $('#id_soundbb_switch').click(function(){
    userConfigPrefs.enableSE = !userConfigPrefs.enableSE;
    $(this).toggleClass('config-off');
    prefs_jar.set('enableSE', userConfigPrefs.enableSE);
    leq_se2.play();
  });

  $('#id_lightbox_switch').click(function(){
    userConfigPrefs.lightbox = !userConfigPrefs.lightbox;
    $(this).toggleClass('config-off');
    prefs_jar.set('lightbox', userConfigPrefs.lightbox);
    leq_se2.play();
  });

  // sidebar 標籤展開
  $('#Label1 .widget-content li').each(function(){
    var labelName = $(this).children('a').attr('href').match(/\/([a-zA-Z0-9%_\.\-]+)\?/)[1];
    $(this).prepend(
      '<span class="item_pv_switch" id="label_switch_' + labelName + '" title="讀取此標籤近期文章">&#65306;</span>'
    ).children('.item_pv_switch').click(function(){
      if( $(this).nextAll('.postListByTagName').length ) { leq_se1.play(); $(this).nextAll('.postListByTagName').toggle(); }
      else {
        $(this).text('等…');
        var url = "/feeds/posts/summary/-/" + labelName + "?alt=json&orderby=published&max-results=666";
        $.getJSON(url, function(json){
          var list = ['<div class="postListByTagName"><ul>'];
          $.each( json.feed.entry, function(i, entry) {
            $.each( entry.link, function(j, link) {
              if(link.rel=='alternate') { list.push('<li><a href="'+link.href+'">'+link.title+'</a></li>'); }
            });
          });
          list.push('</ul></div>');
          var escLabelName = labelName.replace(/%/g,"\\%");
          if( ! $('#label_switch_'+escLabelName).next('div.postListByTagName').length ) {
            leq_se1.play();
            $('#label_switch_'+escLabelName).text('：').closest('li').append(list.join(''));
          }
        });
      }
    });
  });

  // sidebar 文章封存展開
  $('#BlogArchive1_ArchiveList li').each(function(){
    var labelName = $(this).children('a').first().attr('href').match(/\/(\d{4}\/\d+)/)[1].replace(/\D/g,'-');
    $(this).prepend(
      '<span class="item_pv_switch" id="archive_switch_' + labelName + '" title="讀取此封存所有文章">&#65306;</span>'
    ).children('.item_pv_switch').click(function(){
      if( $(this).nextAll('.postListByDate').length ) { leq_se1.play(); $(this).nextAll('.postListByDate').toggle(); }
      else {
        $(this).text('等…');
        var nextMonth = parseInt(labelName.substr(5,2),10)+1;
        nextMonth = nextMonth > 12 ?
                    String("0000" + (parseInt(labelName.substr(0,4))+1) ).slice(-4) + '-01' :
                    labelName.substr(0,4) + '-' + String("0000" + nextMonth).slice(-2);
        var url = "/feeds/posts/summary?alt=json&published-min=" + labelName + '-01T00%3A00%3A00%2B08:00&published-max=' + nextMonth +'-01T00%3A00%3A00%2B08:00';
        $.getJSON(url, function(json){
          var list = ['<div class="postListByDate"><ul>'];
          $.each( json.feed.entry, function(i, entry) {
            $.each( entry.link, function(j, link) {
              if(link.rel=='alternate') { list.push('<li><a href="'+link.href+'">'+link.title+'</a></li>'); }
            });
          });
          list.push('</ul></div>');
          if( ! $('#archive_switch_'+labelName).next('div.postListByDate').length ) {
            leq_se1.play();
            $('#archive_switch_'+labelName).text('：').closest('li').append(list.join(''));
          }
        });
      }
    });
  });

  // 最新回應 by LVCHEN - http://code.google.com/p/lvchen-recentcomments/
  rcPreSetting = {
    g_szBlogDomain:'bootleq.blogspot.com',
    g_iShowCount: 6,
    noContent: ['<i class="rcPostTitleRemoved">（原文已刪除）</i>','<p>沒有留言可以顯示</p>'],
    cachesize: 49,
    showJumpButton:false,
    showRCnoPost:true,
    rcFoldImage:[img_base+'img/rc2/show.gif', '', img_base+'img/rc2/hide.gif', '：', '載入中……','全部展開','全部隱藏'],
    otherText:['','跳至留言','上一頁','下一頁',''],
    reply:[img_base+'img/rc2/external.png', '前往留言表單'],
    rcAuthorLinkFormat:'<a href="%link%" rel="nofollow">%author%</a>',
    rcTitleLinkFormat: '<a href="%orgLink%">%g_szTitle%</a>',
    rcExpendIconFormat: '<img title="展開／隱藏 這則留言" src="' + img_base + 'img/rc2/at.gif" alt="@" />',
    createDisplayFormat:'%rcAuthorLinkFormat% %rcExpendIconFormat% %rcTitleLinkFormat% %timestamp% %replyImg% <p>%content%</p>',
    today:'今天',
    authorLink:true,
    rcDateFormat: 1
  };

  $('#Feed2 .widget-content').html('<div id="divrc"></div>').find('#divrc').html(rcPreSetting.rcFoldImage[4]);
  rcFunction.addHeaderButton();
  rcFunction.fetchComments(rcSetting.commentStartIndex, rcPreSetting.g_iShowCount);
  $(document).on('mouseover', '#divrc li', function(){
    $(this).find('.rcfold img').attr('src', img_base+'img/rc2/at-blink.gif');
  })
  $(document).on('mouseout', '#divrc li', function(){
    $(this).find('.rcfold img').attr('src', img_base+'img/rc2/at.gif');
  });

}

function maincontentFx($)
{
  // 繼續閱讀
  if( pageType != 'item' )
  {
    $('.fullpost').each(function(){
      var fp = $(this);
      var postLink = $(this).closest('div.postcontent').prev('div.postheader').find('h2 a:eq(0)').attr('href');
      var closeBtnHTML = '<div class="leq_read_more"><span title="這篇文章可以折疊">...攤開這篇文章</span>｜<a href="'
                       + postLink + '" title="進入單篇文章頁面">繼續閱讀</a><img title="攤開文章，然後移除這行文字（無法復原）" alt="關閉" src="'
                       + img_base + 'img/closer.gif" class="no-lb" /></div>';
      $(this).toggle().before(closeBtnHTML).prev('.leq_read_more').children('img').click(function(){  // 隱藏整個開關
        leq_se2.play();
        $(this).parent('.leq_read_more').fadeOut(function(){
          $(this).remove();
        }).next('.fullpost').show();
      });
      $(this).prev('.leq_read_more').children('span').click(function(){  // 展開/折疊
        leq_se1.play();
        fp.toggle();
        $(this).text( fp.is(':visible') ? '...折疊這篇文章' : '...攤開這篇文章' );
      });
    });
  }

  // SyntaxHighlighter
  dp.SyntaxHighlighter.HighlightAll('sh-code',true,true,false);
  $('.dp-highlighter').hover(function(){
      var bar = $(this).find('div.bar');
      bar.css({ top: $(this).offset().top - bar.height(), left: $(this).offset().left + $(this).innerWidth() - bar.width() }).show();
    },
    function(){ $(this).find('div.bar').hide(); }
  ).each(function(){ $(this).hScrollBtns({step:20, speed:20, safeHeight:400}); }).find('div.bar').hide();

  // 貼原始碼 hScrollBtns
  $('pre.vim').each(function(){ $(this).hScrollBtns({step:20, speed:20, safeHeight:400}) });

  // Lightbox  - http://leandrovieira.com/projects/jquery/lightbox/
  $.fn.lightBox.defaults = $.extend( $.fn.lightBox.defaults, {
    imageLoading: img_base+'img/lightbox/ico-loading.gif',
    imageBtnClose: img_base+'img/lightbox/btn-close.gif',
    imageBtnPrev: img_base+'img/lightbox/btn-prev.gif',
    imageBtnNext: img_base+'img/lightbox/btn-next.gif',
    imageBlank: img_base+'img/lightbox/blank.gif',
    imageSrcLink: img_base+'img/lightbox/in-new-tab.svg',
    containerBorderSize: 15,
    onNextPrev: () => leq_se1.play(),
    onFinish:   () => leq_se2.play()
  });
  $('.postcontent img:not(.no-lb)').each(function(){
    var fullSrc = $(this).attr('src');  // 原圖的位址
    if( $(this).parent('a[href]').length && $.inArray($(this).parent('a').attr('href').split('.').pop().toLowerCase(), ['png','jpg','gif','bmp']) > -1){
      fullSrc = $(this).parent('a').attr('href');
    }
    if( ! $(this).parent('a').length ) {
      $(this).wrap('<a></a>');
    }
    fullSrc = fullSrc.replace(/\/s(\d)+-h\//g, 's$1');
    $(this).parent('a').attr({ href:fullSrc, title:$(this).attr('alt') });
    $(this).mouseover( function(){
      $(this).css('cursor', (userConfigPrefs.lightbox!=false) ? 'pointer' : 'auto' );
    });
  });
  $('.postcontent a:has(img:not(.no-lb))').lightBox();

  // postheader h2 背景效果
  $('.postheader h2').mouseover(function(e){
    $(this).animate({backgroundPositionX: (e.clientX - $(this).offset().left -64)}, 300);
  });

  // 電梯向下
  if( pageType != 'item' )
  {
    $('.comments_btn').click(function () {
      var elevator_box = $(this).nextAll('.elevator').children('p.loading');
      if (!elevator_box.length) {
        return;
      }

      if ($(this).nextAll('.elevator').children('div.scrollContainer').length) {  // 已讀取留言 -> 只做展開／折疊
        var scrollContainer = $(this).nextAll('.elevator').children('div.scrollContainer');
        scrollContainer.is(':visible') ? scrollContainer.fadeOut(0,leq_se2.play) : scrollContainer.fadeIn(0,leq_se1.play);
        elevator_box.stop(true,true).fadeOut(700);
      } else {  // 嘗試讀取留言
        if ($(this).text() <= 0) {
          elevator_box.text('沒人發表意見。');
        } else {
          $.getJSON( "/feeds/" + $(this).attr('id').replace('postId_','') + "/comments/default?alt=json&orderby=published", function(json, status){
            if(status=='success') {
              var html = ['<div class="scrollContainer" style="display:none;"><ol class="comments">'];
              $.each( json.feed.entry.reverse(), function(i, entry) {
                var href = '';
                $.each( entry.link, function(j, link) {
                  if(link.rel=='alternate') { href = link.href; }
                });
                var userinfo = entry.author[0].uri ?
                  '<a class="commenter" href="'+ entry.author[0].uri.$t +'">'+ entry.author[0].name.$t + '</a>' :
                  '<span class="commenter">'+ (entry.author[0].name.$t=='Anonymous' ? '匿名' : entry.author[0].name.$t) + '</span>';
                html.push([ '<li class="comment'+ ((entry.author[0].name.$t=='bootleq')?' super_comment':'') +'" id="comment-'+ entry.id.$t +'">',
                          '<div class="leq_rc_7"><div class="leq_rc_9"><div class="leq_rc_1"><div class="leq_rc_3"><div class="leq_rc_5">',
                          '<div class="comment_top">' + userinfo,
                          '<span class="comment_timestamp" title="' + entry.published.$t + '">',
                            entry.published.$t.replace( /(\d+)-(0)?(\d+)-(\d+)T(\d+:\d+).*/ , function(str,p1,p2,p3,p4,p5){
                              return [p1,'-',String("00"+p3).slice(-2),'-',String("00"+p4).slice(-2),' ',p5].join('')
                            }),
                          '</span><a href="'+ href +'" title="這個回應的永久連結">§</a></div>',
                          '<p class="comment_body">'+ entry.content.$t +'</p><div class="both"/></div></div></div></div></div></li>'
                        ].join(''));
              });
              html.push('</ol><div class="scrollContainer_footer"><span>回到第一個意見</span><img src="'+ img_base +'img/back2top.gif" alt="回到第一個意見" title="回到第一個意見" /></div>');
              elevator_box.after(html.join('')).next('.scrollContainer').fadeIn(0,function(){
                leq_se1.play();
                elevator_box.stop(true,true).fadeOut(700);
              });
              $('.scrollContainer_footer').click(function(){
                window.scrollTo( 0, $(this).closest('.elevator').offset().top );
                leq_se1.play();
              });
            }
            else {
              elevator_box.text('電梯爆了…').stop(true,true).fadeIn(700, leq_se2.play);
            }
          });
        }
        elevator_box.animate({opacity:'toggle'}, 700);
      }

    });
  }

  // 留言音效
  $('.comment_num_text').click(() => leq_se1.play());
  $('.comment-link').click(() => leq_se1.play());

  // 內文折疊（磁鐵）
  $('#post-content-toggle').click(function(){
    leq_se1.play();
    if($(this).css('top')!='0px') {
      $(this).animate({
        top: '0px'
      },300);
      $('.postcontent').slideUp(400);
      $('.postfooter').hide();
    }
    else {
      $(this).animate({
        top: '-70px'
      },300);
      $('.postcontent').slideDown(600);
      $('.postfooter').show();
    }
  });

  // 意見表單的「回到第一個意見」
  if( ! $('ol.comments').length) { $('#comment-form a:eq(0)').hide(); }

  // 日期格式
  $('#comments .comment_timestamp').each(function(){
    $(this).text( $(this).text().replace(
      /(\d+)年(\d+)月(\d+)日/,
      function(str, p1, p2, p3){ return [p1, '-', String("00"+p2).slice(-2), '-', String("00"+p3).slice(-2)].join('');
    }) );
  });
}
