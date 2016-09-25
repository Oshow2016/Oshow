/* models/database.js
 * by BO LYUN
 */
module.exports = {
    'connection': {
        'host': '14.63.196.48',
        'port' : '3306',
        'user': 'root',
        'password': 'Rkakdqpfm!00'
    },
	'database': 'oshow',
    'tables' : {
    	'cl': 'customers',
    	'ow': 'owners'
    },
    'query':{
    	'sel_id_cl': "SELECT * FROM customers WHERE customer_id = ?",
    	'sel_id_ow': "SELECT * FROM owners WHERE owner_id = ?",
    	'ins_cl': "INSERT INTO customers ( customer_id, customer_pw, customer_name, customer_tel, fame_name, auth ) values (?,?,?,?,?,?)",
    	'ins_ow': "INSERT INTO owners ( owner_id, owner_pw, owner_name, owner_tel, restaurant_no, auth ) values (?,?,?,?,?,?)",
    	'upd_auth_cl': "UPDATE customers SET auth = 'success' WHERE customer_id = ? ",
    	'upd_info_cl': "UPDATE customers SET customer_name=?, customer_pw=?, custome_tel=? WHERE customer_id = ? ",
    	'upd_auth_ow': "UPDATE owners SET auth = 'success' WHERE owner_id = ? "
    }
};
