;(function(){
    var $tpl = $("<div id=\"upload-layer\" class=\"upload-layer\"><div id=\"upload-imgpanel\"><div class=\"head-wrap\"><div class=\"text\">插入图片</div><div class=\"close\"><i class=\"glyphicon glyphicon-remove\"></i></div></div> <div class=\"content-wrap\"><ul class=\"nav nav-tabs\"><li role=\"presentation\" class=\"active\" data-name=\"local\"><a href=\"#\">本地上传</a></li><li role=\"presentation\" data-name=\"remote\"><a href=\"#\">远程地址获取</a></li></ul><div class=\"local-wrap show tabs-panel\"><p>图片大小不大于2M</p><div class=\"row\"><div class=\"col-sm-7\"><input type=\"text\" class=\"form-control\" disabled placeholder=\"推动图片到这里\"/></div><div class=\"col-sm-3\"><div class=\"btn btn-default\">选择图片</div><input type=\"file\" name=\"imgs\"/></div></div></div><div class=\"remote-wrap tabs-panel\"><div class=\"row\"><div class=\"col-sm-offset-1 col-sm-10\"><input type=\"text\" class=\"form-control input-remote\" placeholder=\"请输入远程图片地址\"/></div></div></div></div><div class=\"footer-wrap text-right\"><div class=\"btns\"><div class=\"btn btn-default cancel\">取消</div><div class=\"btn btn-primary insert \">插入</div></div></div></div></div>"); 
        
    function run(upload_url,callback){
        $("body").append($tpl);         
        TabsModule.run();
        UploadModule.run(upload_url,callback); 
        //close action
        $tpl.bind("click",function(e){
            var target = e.target || e.srcElement,
                $target = $(target);
            if($target.hasClass("upload-layer") || $target.hasClass("close") || $target.parents(".close").length > 0 || $target.hasClass("cancel")){
                $tpl.remove(); 
            }
        });
    }
    //Tabs module
    var TabsModule = function(){
        var $lis = $tpl.find(".nav li");  
        function run(){
            $lis.bind("click",function(){
                $_this = $(this);
                if($_this.hasClass("active")){
                    return; 
                }
                var data_name = $_this.attr("data-name");
                $_this.siblings("li").removeClass("active");
                $_this.addClass("active");
                $tpl.find(".tabs-panel")
                .removeClass("show")
                .each(function(){
                    if($(this).hasClass(data_name+"-wrap")){
                        $(this).addClass("show"); 
                    } 
                });
            }); 
        }
        return {
            run: run 
        }
    }();
    //upload Module
    var UploadModule = function(){
        var upload_url,callback,flags,
            isRequesting = false;
        function run(url,call){
            upload_url = url;
            callback = call;

            $tpl.find("input[type=file]").bind("change",function(e){
                var target = e.target || e.srcElement,
                    $target = $(target);
                $tpl.find(".local-wrap input[type=text]").val($target.val());
            });
            $tpl.find(".insert").bind("click",function(){
                if($(this).hasClass("disabled")){
                    return; 
                }
                insert(); 
            });
        }
        function insert(){
            var $curTabsPanel = $tpl.find(".tabs-panel.show"); 
            if($curTabsPanel.hasClass("local-wrap")){
                flags = "local";
                if(!$curTabsPanel.find("input[type=file]").val()){
                   return;  
                }
            }else if($curTabsPanel.hasClass("remote-wrap")){
                flags = "remote";
                if(!$curTabsPanel.find("input").val()){
                    return; 
                } 
            }
            uploadService();
        }
        function compress(quality){
            var mime_type = file.files[0].type;
            var allowExt ="image/jpg,image/jpeg,image/png";
            if(allowExt.indexOf(mime_type) == -1){
                $mesg.html('<div class="warning">请上传jpg/jpeg/png格式的图片</div>');
                return; 
            }
            var reader = new FileReader();
            reader.onload = function(e){
                var imgEle = document.createElement("img");
                imgEle.src = img;
                imgEle.onload = function(){
                    var imgw = imgEle.width,
                        imgh = imgEle.height;
                    var cvs = document.createElement("canvas");
                    cvs.width = imgw;
                    cvs.height = imgh;
                    var ctx = cvs.getContext("2d").drawImage(imgEle, 0, 0,imgw,imgh);
                    var newImg = cvs.toDataURL(mime_type,quality/100);
                }
            }
            reader.readAsDataURL(file.files[0]);
        }
        function uploadService(){
            if(isRequesting){
                return; 
            }
            isRequesting = true;
            $.ajax({
                type: "post",
                url: upload_url + "?flags="+flags,
                contentType: false,
                processData: false,
                dataType: "json",
                success: function(ret){
                    isRequesting = false;
                    if(!ret.status){
                    
                    }else {
                        callback && callback(ret.data.img_src);
                    }
                },
                error: function(e){
                    isRequesting = false;      
                }
            }); 
        }
        return {
            run: run 
        }
    }();
    //return run;
    window.Uploadi = {
        run: run 
    }
})();
