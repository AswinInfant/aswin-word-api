const {Sequelize, DataTypes, Model} = require('sequelize');
const connection = new Sequelize('aswinapi', 'root', 'root', {
	dialect:'mysql',
	host:'localhost'
});
module.exports.connection = connection;
class users extends Model{};
users.init({
		username:{
			type:DataTypes.STRING	
		},
		password:{
			type:DataTypes.STRING
		}		
	},{
		sequelize:connection,
		tableName:'users'
});
users.sync({}).then((result) => {console.log("success:"+result);}, (reject) => {console.log("error");});
module.exports=users;
class apistatus extends Model{};
apistatus.init({
		username:{
			type:DataTypes.STRING
		},
		keycount:{
			type:DataTypes.INTEGER
		},
		maxkey:{
			type:DataTypes.INTEGER
		},
		plan:{
			type:DataTypes.STRING
		},
		limit:{
			type:DataTypes.INTEGER
		},
		usage:{
			type:DataTypes.INTEGER
		},	
	},{
		sequelize:connection,
		tableName:'apistatus'		
});
apistatus.sync({}).then((result) => {console.log("success:"+result);}, (reject) => {console.log("error");});
module.exports.apistatus=apistatus;
class apikeys extends Model{};
apikeys.init({
		username:{
			type:DataTypes.STRING
		},
		apikey:{
			type:DataTypes.STRING
		},
		usage:{
			type:DataTypes.INTEGER
		}	
	},{
		sequelize:connection,
		tableName:'apikeys'		
});
apikeys.sync({}).then((result) => {console.log("success:"+result);}, (reject) => {console.log("error");});
module.exports.apikeys=apikeys;
