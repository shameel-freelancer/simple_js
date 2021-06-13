class ShameelSalih extends Array{
    undefinedOrNull(param){
        return "undefined" === typeof param || "null" === typeof param
    }
    ready(cb){
        const isReady = this.some(element => "complete" == element.readyState && ("loading" != element.readyState || null != element.readyState));
        if(isReady) setTimeout(cb, 1);
        else this.forEach(element => element.addEventListener("DOMContentLoaded",cb));
    };
    on(event,cbOrSelector,cb){
        if("function" === typeof(cbOrSelector)){
            this.forEach(element => element.addEventListener(event,cbOrSelector));
            return this;
        }else{
            this.find(cbOrSelector).on(event,cb)
            return this;
        }
    };
    click(cb){
        if("function" === typeof cb){
            this.forEach(element => element.addEventListener("click",cb));
        }else{
            if(!this.undefinedOrNull(this[0])) this[0].click();
        }
        return this;
    };
    width(flag){
        if(this[0] === window || this[0] === document) return window.innerWidth;
        if(flag){
            if(!this.undefinedOrNull(this[0]) && !this.undefinedOrNull(this[0].clientWidth)) return this[0].clientWidth;
            return undefined;
        }
        if(!this.undefinedOrNull(this[0]) && !this.undefinedOrNull(this[0].offsetWidth)) return this[0].offsetWidth;
            return undefined;
    };
    attr(param,value){
        if("undefined" === typeof value){
            if(!this.undefinedOrNull(this[0])) return "function" === typeof this[0].getAttribute?this[0].getAttribute(param):undefined;
        }
        else{
            this.forEach(element => {
                element.setAttribute(param,value)
            });
        }
        return this;
    };
    eq(num){
        return new ShameelSalih(this[num]);
    };
    parent(){
        return new ShameelSalih(!this.undefinedOrNull(this[0])?this[0].offsetParent:document);
    };
    children(){
        return new ShameelSalih(!this.undefinedOrNull(this[0])?this[0].children:null);
    };
    find(selector){
        let array=[];
        this.forEach(element => {
            if(!this.undefinedOrNull(element)) array.push(...element.querySelectorAll(selector));
        });
        return new ShameelSalih(...array);
    };
    html(content){
        this.forEach(element => element.innerHTML = content);
        return this;
    };
    removeClass(className){
        this.forEach(element => element.classList.remove(className));
        return this;
    };
    addClass(className){
        this.forEach(element => element.classList.add(className));
        return this;
    };
    toggleClass(className){
        this.forEach(element => element.classList.toggle(className));
        return this;
    };
    hasClass(className){
        return this.some(element => element.classList.contains(className));
    };
    visible(){
        return this.filter(element => element.offsetWidth !== 0 && element.offsetHeight !== 0);
    };
    hide(flag){
        this.filter(element => {
            element.style.display = "";
            element.style.cssText = `display: none${flag?"!important":""};${element.style.cssText}`;
        });
        return this;
    };
    show(value){
        if(value != "" && ("string" === typeof value || value instanceof String)){
            this.forEach(element => element.style.cssText = `display: ${value}!important;${element.style.cssText}`);
        }else{
            this.forEach(element => {
                element.style.display = "";
                if(window.getComputedStyle(element).getPropertyValue("display").indexOf("none") > -1) element.style.cssText = `display: block!important;${element.style.cssText}`;
            });
        }
        return this;
    };
    css(param,value){
        const camelParam = param.replace(/(-[a-z])/,g=>g.replace("-","").toUpperCase());
        this.forEach(element => element.style[camelParam]=value);
        return this;
    };
    scrollTo(obj){
        this.forEach(element => element.scroll(obj));
        return this;
    };
    outerWidth(flag){
        if(window === this[0] || document === this[0]) return window.outerWidth;
        if(!0 === flag && "undefined" != typeof this[0]) return this[0].offsetWidth + parseFloat(window.getComputedStyle(this[0]).getPropertyValue("margin-left").split("px")[0]) + parseFloat(window.getComputedStyle(this[0]).getPropertyValue("margin-right").split("px")[0]);
        if(!this.undefinedOrNull(this[0]) && !this.undefinedOrNull(this[0].offsetWidth)) return this[0].offsetWidth;
        return undefined;
    };
}
function $(param){
    if("string" === typeof param || param instanceof String ){
        return new ShameelSalih(...document.querySelectorAll(param));
    }else{
        return new ShameelSalih(param);
    }
}
class AjaxPromise{
    constructor(promise){
        this.promise = promise;
    }
    done(cb){
        this.promise = this.promise.then(data => {
            cb(data.one,data.two,data.three);
            this.data = data;
            return data;
        })
        return this;
    }
    fail(cb){
        this.promise = this.promise.catch(data => {
            cb(data.one,data.two,data.three);
            this.data = data;
            return data;
        });
        return this;
    }
    always(cb){
        this.promise = this.promise.finally(() => {
            cb(this.data.one,this.data.two,this.data.three);
            return this.data;
        });
        return this;
    }
}
$.get = function(url,success=()=>{},dataType=""){
    if("json" === success){
        dataType = success;
        success = ()=>{};
    }
    return new AjaxPromise(
        new Promise((resolve,reject)=>{
            xhr = new XMLHttpRequest();
            if (!xhr) {
                throw new Error("Ajax not Supported");
            }
            xhr.onreadystatechange = function(){
                if(xhr.readyState === XMLHttpRequest.DONE){
                    if(xhr.status === 200)
                    {
                        if(dataType == "json"){
                            try{
                                resolve({one:JSON.parse(xhr.response),two:xhr.statusText,three:xhr});
                            }
                            catch(e){
                                reject({one:xhr,two:xhr.statusText,three:e});
                                throw Error(e);
                            }
                        }else{
                            resolve({one:xhr.response,two:xhr.statusText,three:xhr});
                        }
                    }
                    else {
                        reject({one:xhr,two:xhr.statusText});
                    }
                }
            };
            xhr.open('GET', url);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
            xhr.send();
        }).then(data=>{
            success(data.one,data.two,data.three);
            return data;
        })
    )
}
$.post = function(url,dataOrSuccess="",success=()=>{},dataType=""){
    let contentType = "application/x-www-form-urlencoded";
    if("function" === typeof dataOrSuccess){
        dataType = success;
        success = dataOrSuccess;
    }
    else if("object" === typeof dataOrSuccess) contentType = "application/json";
    return new AjaxPromise(
        new Promise((resolve,reject)=>{
            xhr = new XMLHttpRequest();
            if (!xhr) {
                throw new Error("Ajax not Supported");
            }
            xhr.onreadystatechange = function(){
                if(xhr.readyState === XMLHttpRequest.DONE){
                    if(xhr.status === 200){
                        if(dataType == "json"){
                            try{
                                resolve({one:JSON.parse(xhr.response),two:xhr.statusText,three:xhr});
                            }
                            catch(e){
                                reject({one:xhr,two:xhr.statusText,three:e});
                                throw Error(e);
                            }
                        }
                        else{
                            resolve({one:xhr.response,two:xhr.statusText,three:xhr});
                        }
                    }
                    else{
                        reject({one:xhr,two:xhr.statusText});
                    }
                }
            };
            xhr.open('POST', url);
            xhr.setRequestHeader('Content-Type', contentType);
            xhr.send();
        }).then(data=>{
            success(data.one,data.two,data.three);
            return data;
        })
    )
}