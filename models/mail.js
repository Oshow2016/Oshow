/* models/maill.js
 * by BO LYUN
 */
var email = require("emailjs");

function SendMail(options){
	var server = email.server.connect({
		user: "boryn04@naver.com",
		password: "ghkdlxldqhfusl",
		host: "smtp.naver.com",
		port: 587,
		tls: {ciphers: "SSLv3"}
	});
	var message = {
			text: options.text,
			from: "OSHOW<boryn04@naver.com>",
			to: options.to,
			subject: options.subject //제목
	};
	server.send(message, function(err, message){
		console.log(err||message);
	});
}
module.exports = {
		send: SendMail
};