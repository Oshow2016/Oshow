var d = new Date();
var day = d.getDate();
var month = (d.getMonth()+1);
if (month < 10) { month = '0' + month; }
var year = d.getFullYear();
var date = " "+year+"."+month+"."+day+" ";
var date2 = date;
$('#pre').after(date);
$('.no').on('click',no);
date = " "+year+"-"+month+"-"+day+" ";

$('input[type="image"]:first-child').on('click',function(){
   var lastDay = ( new Date( year, month, 0) ).getDate();
   if ((day-1)<1){
       if (month-1<1) {
          year-=1;
      } else{
         month-=1;
         day = ( new Date( year, month, 0) ).getDate();
      }
   } else{
      day-=1;
   }

   date = year.toString()+'-'+month.toString()+'-'+day.toString();

   $.ajax({
         url:"http://127.0.0.1:3000/ownerMain/move/?date="+date,      //url 보안 , kisa
         success:function(data){
            var pre = document.getElementById('pre');
            pre.nextSibling.nodeValue = " "+year+"."+month+"."+day+" ";
            if(data[0]==0){
               $('ul li:nth-child(n+2)').detach();
               $('ul li:nth-child(1)').after("<li><p>예약이 없습니다</p></li>");
            } else{
               list(data);
            }
         }
   });
});

$('input[type="image"]:last-child').on('click',function(){
   var lastDay = ( new Date( year, month, 0) ).getDate();
   if ((day+1)>lastDay){
       if (month+1>12) {
          year+=1;
      } else{
         month+=1;
         day = 1;
      }
   } else{
      day+=1;
   }
   date = year.toString()+'-'+month.toString()+'-'+day.toString();
   $.ajax({
         url:"http://127.0.0.1:3000/ownerMain/move?date="+date,
         success:function(data){
            var pre = document.getElementById('pre');
            pre.nextSibling.nodeValue = " "+year+"."+month+"."+day+" ";
            if(data[0]==0){
               $('ul li:nth-child(n+2)').detach();
               $('ul li:nth-child(1)').after("<li><p>예약이 없습니다</p></li>");
            }else{
               list(data);
            }
         }
   });
});

function list(data){
      $('ul li:nth-child(n+2)').detach();
      for(var i=0;i<data.length-1;i++){
         $('ul li:nth-child('+(i+1)+')').after("<li class='list'><p>"+data[i].reservation_no+"</p><p>"+data[i].table_no+"</p><p>"+
            data[i].reservation_time+"</p><p><button class='specific'>상세보기</button></p>"+
            "<div id='show'><label>Oshow <input type='radio' name="+i+" value='oshow' checked='checked'/></label>"+
            "<label>NOshow <input type='radio' name="+i+" value='oshow'/></label></div></li>");
      }

      specific();

      $('#bottom').children().detach();
      $('#bottom').text("|");
      for(var i=0;i<data[data.length-1]/7;i++){
         $('#bottom').append("<a href='#' class='no'> "+(i+1)+"</a> |");
      }
      $('.no').on('click',no);
}

function no(event) {
      event.preventDefault();
      $.ajax({
            url:"http://127.0.0.1:3000/ownerMain/search/"+date+"/"+this.innerHTML,
            success:function(data){
               $('ul li:nth-child(n+2)').detach();
               for(var i=0;i<data.length;i++){
                  $('ul li:nth-child('+(i+1)+')').after("<li class='list'><p>"+data[i].reservation_no+"</p><p>"+data[i].table_no+"</p><p>"+
                     data[i].reservation_time+"</p><p><button class='specific'>상세보기</button></p>"+
                     "<div id='show'><label>Oshow<input type='radio' name="+i+" value='oshow' checked='checked'/></label>"+
                     "<label>NOshow<input type='radio' name="+i+" value='noshow'/></label></div></li>");
               }
               specific();
            }
      })
}

function specific(){
   $('.specific').on('click',function(time){
      var time = $(this).parent().prev().html();
      var no = $(this).parent().prev().prev().prev().html();

      $.ajax({
            url:"http://127.0.0.1:3000/ownerMain/specific/"+time+"/"+no,
            success:function(data){
               $('#spcific_popup').children().detach();
               $('#spcific_popup').append("<a class='b-close'>x</a>");
               $('#spcific_popup').append(data);
               $('#spcific_popup').bPopup({
                  modalClose: false,
                  position: [480, 250],
                  opacity: 0.6,
                  scrollBar: true,
                  positionStyle: 'fixed',
               });
            }

      });
   });
}

$(document).ready(function() {
   specific();
});

$('#save').on('click',function(){
   var arr=[];
   $('.list').each(function(){
      arr.push($(this).children().first().html());
      arr.push($(this).children().first().next().html());
      if($(this).children().first().next().next().next().next().children().first().children().is( ":checked" ))
         arr.push("0");
      else
         arr.push("1");
   });
   $.ajax({
         url:"http://127.0.0.1:3000/ownerMain/save/"+date+"/"+arr,
         success:function(data){
            alert('success');
         }
      });
})

$('.header:last-child').on('click',function(){
   $(location).attr('href', 'http://127.0.0.1:3000/ownerPage');
});

$('#mypage').on('click',function(){
   $(location).attr('href', 'http://127.0.0.1:3000/ownerPage');
});

$('#logout').on('click',function(){
   $(location).attr('href', 'http://127.0.0.1:3000/logout');
});
