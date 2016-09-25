/* models/login_util.js
 * 
 * by BO LYUN
 */
//is it number
function IsNum(x){
	if(x>='0'&&x<='9'){
		return true;
	}else
		return false;
}

//is it alphbet
function IsChar(x){
	if( (x>='a' &&  x<='z')||(x>='A' && x<='Z')){
		return true;
	}else 
		return false;
}

//it must be consisted of number and alphabet
function IsNumNChar(str){
	
	var cntN=0;
	var cntC=0;
	
	for(var i=0; i<str.length; i++){
		if(IsNum(str[i])==true) cntN++;
		if(IsChar(str[i])==true) cntC++;
	}
	
	if((cntN+cntC)==str.length){
		return true;
	}else 
		return false;
}
exports.CheckValidity = function(str){
	//the length of ID & PW must longer than 6
	if(str.length>=8){
		//check validity for id
		if(IsNumNChar(str)==true){
			return true;
		}else
			return false;
	} else
		return false;
}
exports.CheckPhoneNumber = function(num){
	if(num.length<10)return false;
	for(var i=0; i<num.length; i++){
		if(num[i]<=9 && num[i]>=0)
			return true;
		else
			return false;
	}
}
exports.CheckBusiNumber = function(num1, num2, num3){
	if(num1<101 || num1>999) return false;
	if(num2<1 || num2>79) return false;
	if(num3<10 || num3>99999) return false;
	
	return true;
}
exports.UsrObjt = function(){
	this.UserInfo = {
			id: null,
			name: null,
			fame: null,
			type: null,
			auth: null
	};
	this.setUsr1 = function (membertype, NewUser){
			this.UserInfo.id = NewUser.id;
			this.UserInfo.name = NewUser.name;
			this.UserInfo.fame = NewUser.fame;
			this.UserInfo.type = membertype;
			this.UserInfo.auth = NewUser.auth;
	};
	this.setUsr2 = function (membertype, rows){
		this.UserInfo.type = membertype;
		this.UserInfo.auth = rows[0].auth;
		if(rows[0].auth != 'success') this.UserInfo.auth = 'none';
		
		if(membertype=='owner'){
			this.UserInfo.id = rows[0].owner_id;
			this.UserInfo.name = rows[0].owner_name;
			this.UserInfo.fame = 'none';
		}
		if(membertype=='customer'){
			this.UserInfo.id = rows[0].customer_id;
			this.UserInfo.name = rows[0].customer_name;
			this.UserInfo.fame = rows[0].fame_name;
		}
	};
	this.getUsr = function (){
		return this.UserInfo; 
	}
}
exports.RndStr = function() {
    this.str = '';
    this.pattern = /^[a-zA-Z0-9]+$/;

    this.setStr = function() {
    	var n=64;
        if(!/^[0-9]+$/.test(n)) n = 0x10;
        this.str = '';
        for(var i=0; i<n-1; i++) {
            this.rndchar();
        }
    }

    this.getStr = function() {
        return this.str;
    }

    this.rndchar = function() {
        var rnd = Math.round(Math.random() * 1000);
        if(!this.pattern.test(String.fromCharCode(rnd))) {
            this.rndchar();
        } else {
            this.str += String.fromCharCode(rnd);
        }
    }
}
