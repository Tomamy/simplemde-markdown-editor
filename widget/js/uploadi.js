(function(mod){
    if(typeof exports == "object" && typeof module == "object")
        module.exports = mod();
    else if(typeof define == "function" && define.amd) 
        return define([], mod);
    else 
        (this || window).Uploadi = mod();
})(function(){
    "use strict";

    var tpl = "<div id=\"upload-layer\" class=\"upload-layer\"> <iframe name=\"upload-iframe\" style=\"display:none\"></iframe> <div id=\"upload-imgpanel\"> <form action=\"/upload\" id=\"upload-form\" method=\"post\" name=\"upload-form\" enctype=\"multipart/form-data\" target=\"upload-iframe\"> <div class=\"head-wrap\"> <div class=\"text\">插入图片</div> <div class=\"close\"><i class=\"glyphicon glyphicon-remove\"></i></div> </div> <div class=\"content-wrap\"> <ul class=\"nav nav-tabs\"> <li role=\"presentation\" class=\"active\" data-name=\"local\"><a href=\"#\">本地上传</a></li> <li role=\"presentation\" data-name=\"remote\"><a href=\"#\">远程地址获取</a></li> </ul> <div class=\"tabs-panel\"> <p>图片大小不大于2M</p> <div class=\"row\"> <div class=\"col-7\"> <div class=\"address form-control\" disabled>选择的图片</div> </div> <div class=\"col-3\"> <div class=\"btn btn-default\">选择图片</div> <input type=\"file\" name=\"imgs\" required/> </div> </div> </div> </div> <div class=\"footer-wrap\"> <div class=\"row\"> <div class=\"col-7 text-right\"> <div class=\"mesg text-info\"></div> </div> <div class=\"col-5 text-right\"> <div class=\"btns\"><div class=\"btn btn-default cancel\">取消</div> <div class=\"btn btn-primary insert\"> 插入</div></div> </div> </div> </div> </div> </form> </div> </div>",
        local_html = "<p>图片大小不大于2M</p> <div class=\"row\"> <div class=\"col-7\"> <div class=\"form-control\" disabled>选择的图片</div> </div> <div class=\"col-3\"> <div class=\"btn btn-default\">选择图片</div> <input type=\"file\" name=\"imgs\" required/> </div> </div>",
        remote_html = "<div class=\"row\" style=\"margin-top:15px;\"> <div class=\"col-sm-offset-1 col-sm-10\"> <input type=\"text\" name=\"remote\" class=\"form-control input-remote\" placeholder=\"请输入远程图片地址\" required/> </div> </div>";
    var isUpload = false;
    var callbackFun = null,
		loading_src,data_name="local",$tpl,upload_url;
    function run(url,i_loading,callback){
        callbackFun = callback;
		loading_src = i_loading;
		upload_url = url;
		$tpl = $(tpl);
        $("body").append($tpl);         
        //event agent 
        $tpl.bind("click",function(e){
            var target = e.target || e.srcElement,
                $target = $(target);
            if($target.hasClass("upload-layer") || $target.hasClass("close") || $target.parents(".close").length > 0 || $target.hasClass("cancel")){
                $tpl.remove(); 
				$tpl = null;
            }else if(target.tagName.toLowerCase() == 'li'){
                tabsHandler($target); 
            }else if($target.parents("li[role]").length > 0){
                tabsHandler($target.parents("li[role]")); 
            }else if($target.hasClass("insert")){
				try{
					uploadHandler($target); 
				}catch(e){}
            }
        }).find("#upload-form").attr("action",upload_url);
		$tpl.find("input[type=file]").bind("change",function(e){
			var target = e.target || e.srcElement;
			var mime_type = target.files.length > 0 && target.files[0].type;
			var allowExt ="image/jpg,image/jpeg,image/png";
			if(allowExt.indexOf(mime_type) == -1){
				$tpl.find(".mesg")
				.removeClass("text-info")
				.removeClass("text-success")
				.addClass("text-danger")
				.html("<i class=\"glyphicon glyphicon-ban-circle\"></i>&nbsp;只能上传图片PNG,JPG,JPEG");
				$(this).val("");
				$tpl.find(".address").text("选择图片");
				return;
			}
			$tpl.find(".mesg").html("");
			$tpl.find(".address").text($(this).val());
		});
    }
    function closeHandler($target){
        $tpl.remove(); 
    }
    function tabsHandler($target){
        if($target.hasClass("active")){
            return; 
        }
        data_name = $target.attr("data-name");
        $target.siblings("li").removeClass("active");
        $target.addClass("active");
        if(data_name == "local"){
            $tpl.find(".tabs-panel").html(local_html);
        }else if(data_name == "remote") {
            $tpl.find(".tabs-panel").html(remote_html);
        }
        $tpl.find(".mesg")
        .html('')
        .removeClass("text-danger")
        .removeClass("text-success")
        .addClass("text-info");
		$tpl.find("#upload-form").attr("action",upload_url);
    };
    function uploadHandler($target){
        if(isUpload){
            return; 
        }
		isUpload = true;
		if(data_name == "local"){
			if(!$tpl.find("input[type=file]").val()){
				$tpl.find(".mesg")
				.removeClass("text-info")
				.removeClass("text-success")
				.addClass("text-danger")
				.html("<i class=\"glyphicon glyphicon-ban-circle\"></i>&nbsp;图片不能为空！");
				isUpload = false;
				return;
			}	
		}else if(data_name == "remote"){
			if(!$tpl.find("input[type=text]").val()){
				$tpl.find(".mesg")
				.removeClass("text-info")
				.removeClass("text-success")
				.addClass("text-danger")
				.html("<i class=\"glyphicon glyphicon-ban-circle\"></i>&nbsp;远程图片地址不能为空！");
				isUpload = false;
				return;
			}else {
                $tpl.find(".mesg").html("<i class=\"glyphicon glyphicon-hourglass\"></i>&nbsp;图片加载中……"); 
                $target.html("<img src=\""+loading_src+"\" style=\"width:20px;height:20px;\"/>");
                var img = new Image();
                img.onload = function(){
                    $tpl.find(".mesg")
                    .removeClass("text-info")
                    .removeClass("text-danger")
                    .addClass("text-success")
                    .html("<i class=\"glyphicon glyphicon-ok\"></i>&nbsp;图片插入成功！");
                    var img_src = img.src; 
                    if(img_src.indexOf("?") != -1){
                        img_src += "&img_w="+img.width+"&img_ratio="+(img.height/img.width).toFixed(6); 
                    }else {
                        img_src += "?img_w="+img.width+"&img_ratio="+(img.height/img.width).toFixed(6); 
                    }
                    callbackFun && callbackFun(img_src);
                    setTimeout(function(){
                        $tpl.remove();
                        $tpl = null;
                    },300);	
                    isUpload = false;
                }
                img.onerror = function(){
                    $tpl.find(".mesg")
                    .removeClass("text-info")
                    .removeClass("text-success")
                    .addClass("text-danger")
                    .html("<i class=\"glyphicon glyphicon-ok\"></i>&nbsp;图片插入失败，请确保地址有效，网络正常！");
                    isUpload = false;
                }
                img.src = $tpl.find("input[type=text]").val();
				return;
			}
		}
        $tpl.find(".mesg").html("<i class=\"glyphicon glyphicon-hourglass\"></i>&nbsp;图片上传中……"); 
        $target.html("<img src=\""+loading_src+"\" style=\"width:20px;height:20px;\"/>");
        
		$tpl.find("#upload-form").submit();
        
        $tpl.find(".mesg")
        .removeClass("text-danger")
        .removeClass("text-success")
        .addClass("text-info");

        var timer,totalTime = 0;
        (function(){
            timer = setInterval(function(){
                if(totalTime > 6000){
                    clearInterval(timer); 
                    $target.html("插入");
                    $tpl.find(".mesg")
                    .removeClass("text-success")
                    .removeClass("text-info")
                    .addClass("text-danger")
                    .html("<i class=\"glyphicon glyphicon-remove\"></i>&nbsp;图片上传失败，请检查网络或者系统升级中!"); 
					isUpload = false;
                    return;
                }
                var $idoc = $($tpl.find("iframe").prop("contentWindow").document); 
                var docstr = $idoc.find("#result").html();

                if(docstr){
                    clearInterval(timer); 
                    $target.html("插入");
                    try{
                        var ret = JSON.parse(docstr);
                        $tpl.find(".mesg")
                        .removeClass("text-danger")
                        .removeClass("text-info")
                        .addClass("text-success")
                        .html("<i class=\"glyphicon glyphicon-ok\"></i>&nbsp;图片上传成功!"); 
						var ret = JSON.parse(docstr);
                        callbackFun && callbackFun(window.location.origin+ret.data);
						setTimeout(function(){
							$tpl.remove();
							$tpl = null;
						},300);	
                    }catch(e){
                        $tpl.find(".mesg")
                        .removeClass("text-success")
                        .removeClass("text-info")
                        .addClass("text-danger")
                        .html("<i class=\"glyphicon glyphicon-remove\"></i>&nbsp;图片上传失败，请重试!"); 
                    }
					isUpload = false;
                }
                totalTime+=300;
            },300); 
        })();
    }
    return run;
});
