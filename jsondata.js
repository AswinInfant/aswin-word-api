var data=require('./dict.json');
var mysql = require('mysql');
const connection = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'aswinapi'
});



for (let key in data){
    connection.query('INSERT INTO word VALUES(NULL,?)', key,  function (error, results, fields) {
       if (error) throw error;
       console.log("inserted")
        });
}
//for (let key in data) {
//for(j=0;j<data[key]['definitions'].length;j++) {
 //   console.log(key);
 //   var str1='"';
 //   var str=data[key]['definitions'][j];
    
 //   console.log(str.text);
   // connection.query('INSERT INTO definitions VALUES(?,?)', [key,str.text],  function (error, results, fields) {
     //   if (error) throw error;
     //   console.log("inserted")
   // });
 //}
//}
//for (let key in data) {
  //  for(j=0;j<data[key]['examples'].length;j++) {
    //    console.log(key);
      //  var str=data[key]['examples'][j];
        //console.log(str.text);
        //connection.query('INSERT INTO examples VALUES(?,?)', [key,str.text],  function (error, results, fields) {
        //    if (error) throw error;
        //    console.log("inserted")
       // });
   // }
//}

//for (let key in data) {
  //  for(j=0;j<data[key]['relatedWords'].length;j++) {
    //    var str=data[key]['relatedWords'][j];
        //if(str.relationshipType.localeCompare("antonym") == 0) {
        //console.log(str.words.length);
       // for(i = 0; i < str.words.length; i++){
       // connection.query('INSERT INTO relation VALUES(?,?)', [key,str.words[i]],  function (error, results, fields) {
       //    if (error) throw error;
       //    console.log("inserted")
       // });
       // }
       // }
       // if(str.relationshipType.localeCompare("synonym") == 0) {
       //     console.log(str.words.length);
        //    for(i = 0; i < str.words.length; i++){
        //    connection.query('INSERT INTO synonyms VALUES(?,?)', [key,str.words[i]],  function (error, results, fields) {
        //       if (error) throw error;
        //       console.log("inserted")
       //     });
        //    }
        //    }
    // }
  //  }
