const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
const app = express();
const cors = require("cors");
const otps = [];
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
const springapikey = "6jcx935egh57w4r6c58g7i4z4xyiq8j98";
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aryakroy6320@gmail.com',
      pass: 'Aryak6320'
    }
  });
const mysqlconnection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'Student_DBMS',
    insecureAuth : true
});
const inArray = (element) => {
    for(var i=0;i<otps.length;i++){
        if(otps[i] === element){
            return i;
        }
    }
    return -1;
}
mysqlconnection.connect((err) => {
    if(!err){
        console.log('DB connection success');
    }
    else{
        console.log('DB Connection failed \n Error: ' + JSON.stringify(err,undefined,2));
    }
});
app.get("/student/getotp",(req,res) => {
    var result = {
        status:"",
        message:""
    };
    var id = req.body.id;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT email_id FROM student WHERE stud_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "email retrieval failed";
                        res.send(result);
                    } 
                    else{
                        var email = rows[0].email_id;
                        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
                        console.log(otp);
                          var mailOptions = {
                            from: 'aryakroy6320@gmail.com',
                            to: `${email}`,
                            subject: 'College App OTP Authentication',
                            text: `Your OTP is ${otp}`
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                result.status = "failure";
                                result.message = "OTP to email failed";
                                res.send(result);
                                console.log(error);
                            } 
                            else {
                              otps.push(otp);
                              console.log(otps);
                              result.status = "success";
                              result.message = "OTP successfully sent to mobile to email";
                              res.send(result);
                              console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        }
    }); 
});

app.post("/student/forgotpassword/:id",(req,res) => {
    var result = {
        status:"",
        message:""
    };
    console.log(otps);
    var id = req.params.id;
    var new_password = req.body.new_password;
    var otp = req.body.otp;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "student not found";
                res.send(result);
            }
            else{
                if(inArray(otp) < 0){
                    delete otps[inArray(otp)];
                    result.status = "failure";
                    result.message = "incorrect otp";
                    res.send(result);
                }
                else{
                    mysqlconnection.query("UPDATE student SET pass = ? WHERE stud_id = ?",[new_password,id],(err,rows,fields) => {
                        if(err){
                            result.status = "failure";
                            result.message = "change new password failed";
                            res.send(result);
                            console.log(err); 
                        }
                        else{
                            delete otp[inArray(otp)];
                            result.status = "success";
                            result.message = "successfully changed password";
                            res.send(result);
                        }
                    });
                }
            }
        }
    });
});
app.get("/admin/getotp",(req,res) => {
    var result = {
        status:"",
        message:""
    };
    var id = req.body.id;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT email_id FROM admin WHERE admin_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "email retrieval failed";
                        res.send(result);
                    } 
                    else{
                        var email = rows[0].email_id;
                        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
                        console.log(otp);
                          var mailOptions = {
                            from: 'aryakroy6320@gmail.com',
                            to: `${email}`,
                            subject: 'College App OTP Authentication',
                            text: `Your OTP is ${otp}`
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                result.status = "failure";
                                result.message = "OTP to email failed";
                                res.send(result);
                                console.log(error);
                            } 
                            else {
                              otps.push(otp);
                              console.log(otps);
                              result.status = "success";
                              result.message = "OTP successfully sent to mobile to email";
                              res.send(result);
                              console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        }
    }); 
});
app.post("/admin/forgotpassword/:id",(req,res) => {
    var result = {
        status:"",
        message:""
    };
    console.log(otps);
    var id = req.params.id;
    var new_password = req.body.new_password;
    var otp = req.body.otp;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                if(inArray(otp) < 0){
                    delete otps[inArray(otp)];
                    result.status = "failure";
                    result.message = "incorrect otp";
                    res.send(result);
                }
                else{
                    mysqlconnection.query("UPDATE admin SET pass = ? WHERE admin_id = ?",[new_password,id],(err,rows,fields) => {
                        if(err){
                            result.status = "failure";
                            result.message = "change new password failed";
                            res.send(result);
                            console.log(err); 
                        }
                        else{
                            delete otp[inArray(otp)];
                            result.status = "success";
                            result.message = "successfully changed password";
                            res.send(result);
                        }
                    });
                }
            }
        }
    });
});
app.post("/faculty/getotp",(req,res) => {
    var result = {
        status:"",
        message:""
    };
    var id = req.body.id;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT email_id FROM faculty WHERE fac_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "email retrieval failed";
                        res.send(result);
                    } 
                    else{
                        var email = rows[0].email_id;
                        const otp = otpGenerator.generate(6, { upperCase: false, specialChars: false });
                        console.log(otp);
                          var mailOptions = {
                            from: 'aryakroy6320@gmail.com',
                            to: `${email}`,
                            subject: 'College App OTP Authentication',
                            text: `Your OTP is ${otp}`
                        };
                        transporter.sendMail(mailOptions, function(error, info){
                            if (error) {
                                result.status = "failure";
                                result.message = "OTP to email failed";
                                res.send(result);
                                console.log(error);
                            } 
                            else {
                              otps.push(otp);
                              console.log(otps);
                              result.status = "success";
                              result.message = "OTP successfully sent to mobile to email";
                              res.send(result);
                              console.log('Email sent: ' + info.response);
                            }
                        });
                    }
                });
            }
        }
    }); 
});
app.post("/faculty/forgotpassword/:id",(req,res) => {
    var id = req.params.id;
    var old_password = req.body.old_password;
    var new_password = req.body.new_password;
    var otp = req.body.otp;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                if(inArray(otp) < 0){
                    delete otps[inArray(otp)];
                    result.status = "failure";
                    result.message = "incorrect otp";
                    res.send(result);
                }
                else{
                    mysqlconnection.query("UPDATE faculty SET pass = ? WHERE fac_id = ?",[new_password,id],(err,rows,fields) => {
                        if(err){
                            result.status = "failure";
                            result.message = "change new password failed";
                            res.send(result);
                            console.log(err); 
                        }
                        else{
                            delete otp[inArray(otp)];
                            result.status = "success";
                            result.message = "successfully changed password";
                            res.send(result);
                        }
                    });  
                }
            }
        }
    });
});
app.post("/student/remove/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "removal failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "student not found";
                res.send(result);
            }
            else{
                mysqlconnection.beginTransaction((err) => {
                    if(err){
                        result.status = "failed";
                        result.message = "transaction failed"
                        console.log(err);
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("DELETE FROM stud_address WHERE stud_id = ?",[id],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback((err) => {
                                    console.log(err);
                                    result.status="failure";
                                    result.message="address deletion failed";
                                    res.send(result);
                                });
                            }
                            else{
                                mysqlconnection.query("DELETE FROM student WHERE stud_id = ?",[id],(err,rows,fields) => {
                                    if(err){
                                        return mysqlconnection.rollback((err) => {
                                            console.log(err);
                                            result.status="failure";
                                            result.message="student deletion failed";
                                            res.send(result);
                                        });
                                    }
                                    else{
                                        mysqlconnection.commit((err) => {
                                            if(err){
                                                console.log(err);
                                                result.status="failure";
                                                result.message="commit failed";
                                                res.send(result);
                                            }
                                            else{
                                                result.status="success";
                                                result.message="successfully completed";
                                                res.send(result); 
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});
app.post("/faculty/remove/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "removal failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                mysqlconnection.beginTransaction((err) => {
                    if(err){
                        result.status = "failed";
                        result.message = "transaction failed"
                        console.log(err);
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("DELETE FROM fac_address WHERE fac_id = ?",[id],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback((err) => {
                                    console.log(err);
                                    result.status="failure";
                                    result.message="address deletion failed";
                                    res.send(result);
                                });
                            }
                            else{
                                mysqlconnection.query("DELETE FROM faculty WHERE fac_id = ?",[id],(err,rows,fields) => {
                                    if(err){
                                        return mysqlconnection.rollback((err) => {
                                            console.log(err);
                                            result.status="failure";
                                            result.message="faculty deletion failed";
                                            res.send(result);
                                        });
                                    }
                                    else{
                                        mysqlconnection.commit((err) => {
                                            if(err){
                                                console.log(err);
                                                result.status="failure";
                                                result.message="commit failed";
                                                res.send(result);
                                            }
                                            else{
                                                result.status="success";
                                                result.message="successfully completed";
                                                res.send(result); 
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});
app.get("/student/getAll",(req,res) => {
    var result = {
        status:"",
        data:[],
        message:""
    }
    mysqlconnection.query('SELECT s.stud_id, s.first_name,s.middle_name, s.last_name, s.programme_id,s.email_id, p.name as programme_name FROM student s INNER JOIN programme p ON s.programme_id = p.programme_id',(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }
        else{
            console.log(err);
        }
    });
});
app.get("/student/getAll/:id",(req,res) => {
    var result = {
        status:"",
        data:[],
        message:""
    };
    var id = req.params.id;
    mysqlconnection.query('SELECT s.stud_id, s.first_name,s.middle_name, s.last_name, s.programme_id,s.email_id, p.name as programme_name FROM student s INNER JOIN programme p ON s.programme_id = p.programme_id WHERE s.programme_id = ?',[id],(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }
        else{
            console.log(err);
        }
    });
});
app.get("/faculty/getAll",(req,res) => {
    var result = {
        status:"",
        data:[],
        message:""
    }
    mysqlconnection.query('SELECT s.fac_id, s.first_name,s.middle_name, s.last_name, s.branch_id,s.email_id, p.name as department_name FROM faculty s INNER JOIN department p ON s.branch_id = p.dept_id',(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }
        else{
            console.log(err);
        }
    });
});
app.get("/faculty/getAll/:id",(req,res) => {
    var result = {
        status:"",
        data:[],
        message:""
    };
    var id = req.params.id;
    mysqlconnection.query('SELECT s.fac_id, s.first_name,s.middle_name, s.last_name, s.branch_id,s.email_id, p.name as department_name FROM faculty s INNER JOIN department p ON s.branch_id = p.dept_id WHERE s.branch_id = ?',[id],(err,rows,fields) => {
        if(!err){
            res.send(rows);
        }
        else{
            console.log(err);
        }
    });
});
app.post("/student/register",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:""
    }
    var id = req.body.id;
    console.log(id);
    var first_name = req.body.first_name;
    console.log(first_name);
    var middle_name = req.body.middle_name;
    console.log(middle_name);
    var last_name = req.body.last_name;
    console.log(last_name);
    var sex = req.body.sex;
    console.log(sex);
    var dob = req.body.dob;
    console.log(dob);
    var blood_group = req.body.blood_group;
    console.log(blood_group);
    var email = req.body.email;
    console.log(email);
    var pass = req.body.pass;
    console.log(pass);
    var hostel = req.body.hostel;
    console.log(hostel);
    var age = Number(req.body.age);
    console.log(age);
    var phone = Number(req.body.phone);
    console.log(phone);
    const today = new Date();
    const date = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    var start_date = year + "-" + month + "-" + date;
    console.log(start_date);
    var programme = req.body.programme;
    console.log(programme);
    var houseno = req.body.houseno;
    console.log(houseno);
    var apt_name = req.body.apt_name;
    console.log(apt_name);
    var locality = req.body.locality;
    console.log(locality);
    var city = req.body.city;
    console.log(city);
    var state = req.body.state;
    console.log(state);
    var country = req.body.country;
    console.log(country);
    var pincode = Number(req.body.pincode);
    console.log(pincode);
    mysqlconnection.beginTransaction((err) =>{
        if(err){
            result.status="failure";
            result.message="transaction failed";
            console.log(err);
            res.send(result);
        }
        mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
            if(err){
                console.log(err);
                result.status = "failure";
                result.message = "failed";
                res.send(result);
            }
            else{
                console.log(rows);
                if(rows.length > 0){
                    result.status = "failure";
                    result.message = "user id taken";
                    res.send(result);
                }
                else{
                    console.log(id);
                    console.log(req.body);
                    mysqlconnection.query("INSERT INTO student(stud_id,first_name,middle_name,last_name,sex,age,dob,programme_id,email_id,pass,hostel_room,phone_no,blood_group,start_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,req.body.first_name,middle_name,req.body.last_name,req.body.sex,req.body.age,req.body.dob,req.body.programme,req.body.email,req.body.pass,hostel,req.body.phone,req.body.blood_group,start_date],(err,rows,fields) => {
                        if(err){
                            return mysqlconnection.rollback(() => {
                                console.log(err);
                                result.status="failure";
                                result.message="student insertion failed";
                                res.send(result);
                            });
                        }
                        else{
                            mysqlconnection.query("SELECT 1 FROM state_country WHERE state = ? AND country = ? ORDER BY state",[req.body.state,req.body.country],(err,rows,fields) => {
                                if(err){
                                    return mysqlconnection.rollback(() => {
                                        console.log(err);
                                        result.status="failure";
                                        result.message="student state failed";
                                        res.send(result);
                                    });
                                }
                                else{
                                    console.log(rows);
                                    if(rows.length <= 0){
                                        mysqlconnection.query("INSERT INTO state_country VALUES(?,?)",[req.body.state,req.body.country],(err,rows,fields) => {
                                            if(err){
                                                return mysqlconnection.rollback(() => {
                                                    console.log(err);
                                                    result.status="failure";
                                                    result.message="state insertion failed";
                                                    res.send(result);
                                                });
                                            }
                                            else{
                                                console.log(rows);
                                            }
                                        });
                                    }
                                    mysqlconnection.query("SELECT 1 FROM city_state WHERE state = ? AND city = ? ORDER BY city",[req.body.state,req.body.city],(err,rows,fields) => {
                                        if(err){
                                            return mysqlconnection.rollback(() => {
                                                console.log(err);
                                                result.status="failure";
                                                result.message="student city failed";
                                                res.send(result);
                                            });
                                        }
                                        else{
                                            console.log(rows);
                                            if(rows.length <= 0){
                                                mysqlconnection.query("INSERT INTO city_state VALUES(?,?)",[req.body.city,req.body.state],(err,rows,fields) => {
                                                    if(err){
                                                        return mysqlconnection.rollback(() => {
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="city insertion failed";
                                                            res.send(result);
                                                        });
                                                    }
                                                    else{
                                                        console.log(rows);
                                                    }
                                                }); 
                                            }
                                            mysqlconnection.query("INSERT INTO stud_address VALUES(?,?,?,?,?,?)",[req.body.id,req.body.houseno,req.body.apt_name,req.body.locality,req.body.city,req.body.pincode],(err,rows,fields) => {
                                                if(err) {
                                                    return mysqlconnection.rollback(() => {
                                                        console.log(err);
                                                        result.status="failure";
                                                        result.message="student address insertion failed";
                                                        res.send(result);
                                                    }); 
                                                }
                                                else{
                                                    mysqlconnection.commit((err) => {
                                                        if(err){
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="commit failed";
                                                            res.send(result); 
                                                        }
                                                        else{
                                                            result.status="success";
                                                            result.message="successfully completed";
                                                            res.send(result);
                                                        }
                                                    }); 
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });
});
app.post("/student/updatestudentdetails/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:""
    }
    var id = req.params.id;
    console.log(id);
    var first_name = req.body.first_name;
    console.log(first_name);
    var middle_name = req.body.middle_name;
    console.log(middle_name);
    var last_name = req.body.last_name;
    console.log(last_name);
    var sex = req.body.sex;
    console.log(sex);
    var dob = req.body.dob;
    console.log(dob);
    var blood_group = req.body.blood_group;
    console.log(blood_group);
    var email = req.body.email;
    console.log(email);
    var hostel = req.body.hostel;
    console.log(hostel);
    var age = Number(req.body.age);
    console.log(age);
    var phone = Number(req.body.phone);
    console.log(phone);
    var programme = req.body.programme;
    console.log(programme);
    var houseno = req.body.houseno;
    console.log(houseno);
    var apt_name = req.body.apt_name;
    console.log(apt_name);
    var locality = req.body.locality;
    console.log(locality);
    var city = req.body.city;
    console.log(city);
    var state = req.body.state;
    console.log(state);
    var country = req.body.country;
    console.log(country);
    var pincode = Number(req.body.pincode);
    console.log(pincode);
    mysqlconnection.beginTransaction((err) =>{
        if(err){
            result.status="failure";
            result.message="transaction failed";
            console.log(err);
            res.send(result);
        }
        mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
            if(err){
                console.log(err);
                result.status = "failure";
                result.message = "failed";
                res.send(result);
            }
            else{
                console.log(rows);
                if(rows.length > 0){
                    result.status = "failure";
                    result.message = "user id taken";
                    res.send(result);
                }
                else{
                    console.log(id);
                    console.log(req.body);
                    mysqlconnection.query("UPDATE student SET first_name = ?,middle_name = ?,last_name = ?,sex = ?,age = ?,dob = ?,programme_id = ?,email_id = ?,hostel_room = ?,phone_no = ?,blood_group = ? WHERE stud_id = ?",[req.body.first_name,req.body.middle_name,req.body.last_name,req.body.sex,req.body.age,req.body.dob,req.body.programme,req.body.email,req.body.hostel,req.body.phone,req.body.blood_group,id],(err,rows,fields) => {
                        if(err){
                            return mysqlconnection.rollback(() => {
                                console.log(err);
                                result.status="failure";
                                result.message="student insertion failed";
                                res.send(result);
                            });
                        }
                        else{
                            mysqlconnection.query("SELECT 1 FROM state_country WHERE state = ? AND country = ? ORDER BY state",[req.body.state,req.body.country],(err,rows,fields) => {
                                if(err){
                                    return mysqlconnection.rollback(() => {
                                        console.log(err);
                                        result.status="failure";
                                        result.message="student state failed";
                                        res.send(result);
                                    });
                                }
                                else{
                                    console.log(rows);
                                    if(rows.length <= 0){
                                        mysqlconnection.query("INSERT INTO state_country VALUES(?,?)",[req.body.state,req.body.country],(err,rows,fields) => {
                                            if(err){
                                                return mysqlconnection.rollback(() => {
                                                    console.log(err);
                                                    result.status="failure";
                                                    result.message="state insertion failed";
                                                    res.send(result);
                                                });
                                            }
                                            else{
                                                console.log(rows);
                                            }
                                        });
                                    }
                                    mysqlconnection.query("SELECT 1 FROM city_state WHERE state = ? AND city = ? ORDER BY city",[req.body.state,req.body.city],(err,rows,fields) => {
                                        if(err){
                                            return mysqlconnection.rollback(() => {
                                                console.log(err);
                                                result.status="failure";
                                                result.message="student city failed";
                                                res.send(result);
                                            });
                                        }
                                        else{
                                            console.log(rows);
                                            if(rows.length <= 0){
                                                mysqlconnection.query("INSERT INTO city_state VALUES(?,?)",[req.body.city,req.body.state],(err,rows,fields) => {
                                                    if(err){
                                                        return mysqlconnection.rollback(() => {
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="city insertion failed";
                                                            res.send(result);
                                                        });
                                                    }
                                                    else{
                                                        console.log(rows);
                                                    }
                                                }); 
                                            }
                                            mysqlconnection.query("UPDATE stud_address SET house_no = ?, apt_name = ?, locality = ?, city = ?, pin_code = ? WHERE stud_id = ?",[req.body.houseno,req.body.apt_name,req.body.locality,req.body.city,req.body.pincode,id],(err,rows,fields) => {
                                                if(err) {
                                                    return mysqlconnection.rollback(() => {
                                                        console.log(err);
                                                        result.status="failure";
                                                        result.message="student address insertion failed";
                                                        res.send(result);
                                                    }); 
                                                }
                                                else{
                                                    mysqlconnection.commit((err) => {
                                                        if(err){
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="commit failed";
                                                            res.send(result); 
                                                        }
                                                        else{
                                                            result.status="success";
                                                            result.message="successfully completed";
                                                            res.send(result);
                                                        }
                                                    }); 
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });
});
app.post("/faculty/register",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:""
    }
    var id = req.body.id;
    console.log(id);
    var first_name = req.body.first_name;
    console.log(first_name);
    var middle_name = req.body.middle_name;
    console.log(middle_name);
    var last_name = req.body.last_name;
    console.log(last_name);
    var sex = req.body.sex;
    console.log(sex);
    var dob = req.body.dob;
    console.log(dob);
    var blood_group = req.body.blood_group;
    console.log(blood_group);
    var email = req.body.email;
    console.log(email);
    var pass = req.body.pass;
    console.log(pass);
    var cabin = req.body.cabin;
    console.log(cabin);
    var age = Number(req.body.age);
    console.log(age);
    var phone = Number(req.body.phone);
    console.log(phone);
    const today = new Date();
    const date = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    var start_date = year + "-" + month + "-" + date;
    console.log(start_date);
    var branch_id = req.body.branch_id;
    console.log(branch_id);
    var houseno = req.body.houseno;
    console.log(houseno);
    var apt_name = req.body.apt_name;
    console.log(apt_name);
    var locality = req.body.locality;
    console.log(locality);
    var city = req.body.city;
    console.log(city);
    var state = req.body.state;
    console.log(state);
    var country = req.body.country;
    console.log(country);
    var pincode = Number(req.body.pincode);
    console.log(pincode);
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length > 0){
                result.status = "failure";
                result.message = "user id taken";
                res.send(result);
            }
            else{
                mysqlconnection.beginTransaction((err) =>{
                    if(err){
                        result.status="failure";
                        result.message="transaction failed";
                        console.log(err);
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("INSERT INTO faculty(fac_id,first_name,middle_name,last_name,sex,age,dob,branch_id,email_id,pass,cabin_room,phone_no,blood_group,start_date) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)",[id,first_name,middle_name,last_name,sex,age,dob,branch_id,email,pass,cabin,phone,blood_group,start_date],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback((err) => {
                                    console.log(err);
                                    result.status="failure";
                                    result.message="faculty insertion failed";
                                    res.send(result);
                                });
                            }
                            else{
                                mysqlconnection.query("SELECT 1 FROM state_country WHERE state = ? AND country = ? ORDER BY state",[state,country],(err,rows,fields) => {
                                    if(err){
                                        return mysqlconnection.rollback((err) => {
                                            console.log(err);
                                            result.status="failure";
                                            result.message="faculty state failed";
                                            res.send(result);
                                        });
                                    }
                                    else{
                                        console.log(rows);
                                        if(rows.length <= 0){
                                            mysqlconnection.query("INSERT INTO state_country VALUES(?,?)",[state,country],(err,rows,fields) => {
                                                if(err){
                                                    return mysqlconnection.rollback((err) => {
                                                        console.log(err);
                                                        result.status="failure";
                                                        result.message="state insertion failed";
                                                        res.send(result);
                                                    });
                                                }
                                                else{
                                                    console.log(rows);
                                                }
                                            });
                                        }
                                        mysqlconnection.query("SELECT 1 FROM city_state WHERE state = ? AND city = ? ORDER BY city",[state,city],(err,rows,fields) => {
                                            if(err){
                                                return mysqlconnection.rollback((err) => {
                                                    console.log(err);
                                                    result.status="failure";
                                                    result.message="faculty city failed";
                                                    res.send(result);
                                                });
                                            }
                                            else{
                                                console.log(rows);
                                                if(rows.length <= 0){
                                                    mysqlconnection.query("INSERT INTO city_state VALUES(?,?)",[city,state],(err,rows,fields) => {
                                                        if(err){
                                                            return mysqlconnection.rollback((err) => {
                                                                console.log(err);
                                                                result.status="failure";
                                                                result.message="city insertion failed";
                                                                res.send(result);
                                                            });
                                                        }
                                                        else{
                                                            console.log(rows);
                                                        }
                                                    }); 
                                                }
                                                mysqlconnection.query("INSERT INTO fac_address VALUES(?,?,?,?,?,?)",[id,houseno,apt_name,locality,city,pincode],(err,rows,fields) => {
                                                    if(err) {
                                                        return mysqlconnection.rollback((err) => {
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="faculty address insertion failed";
                                                            res.send(result);
                                                        }); 
                                                    }
                                                    else{
                                                        mysqlconnection.commit((err) => {
                                                            if(err){
                                                                console.log(err);
                                                                result.status="failure";
                                                                result.message="commit failed";
                                                                res.send(result); 
                                                            }
                                                            else{
                                                                result.status="success";
                                                                result.message="successfully completed";
                                                                res.send(result);
                                                            }
                                                        }); 
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});
app.post("/student/:id/addClass/:sec",(req,res) => {
    var result = {
        status:"",
        message:"",
    }
    var id = req.params.id;
    var sec = req.params.sec;
    mysqlconnection.query("INSERT INTO stud_sec(stud_id,sec_id) VALUES(?,?)",[id,sec],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log("success");
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/student/:id/getcoursefaculties/:course",(req,res) => {
    var result = {
        status:"",
        message:"",
        data:[]
    }
    var id = req.params.id;
    var course = req.params.course;
    mysqlconnection.query("SELECT f.fac_id, f.first_name, f.middle_name, f.last_name, section.section_id,section.course_id, courses.name as course_name, section.room_id, building.name, time_slot.time_slot_id, time_slot.start_time, time_slot.end_time, time_slot.day  FROM courses INNER JOIN section ON courses.course_id = section.course_id INNER JOIN faculty f ON f.fac_id = section.fac_id INNER JOIN sec_time ON sec_time.sec_id = section.section_id INNER JOIN time_slot ON time_slot.time_slot_id = sec_time.time_slot_id INNER JOIN room ON room.room_id = section.room_id INNER JOIN building ON building.building_id = room.building_id WHERE  courses.course_id = ? AND section.section_id  IN  (SELECT DISTINCT section.section_id FROM section INNER JOIN sec_time ON sec_time.sec_id = section.section_id LEFT JOIN stud_sec ON section.section_id = stud_sec.sec_id WHERE sec_time.time_slot_id NOT IN (SELECT sec_time.time_slot_id FROM sec_time INNER JOIN section ON section.section_id = sec_time.sec_id INNER JOIN stud_sec ON stud_sec.sec_id = section.section_id WHERE stud_sec.stud_id = ?))",[course,id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status="status";
            result.message="successfully competed";
            res.send(result);
        }
    });
});
app.get("/student/:id/getcoursefaculties",(req,res) => {
    var result = {
        status:"",
        message:"",
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT f.fac_id, f.first_name, f.middle_name, f.last_name, section.section_id,section.course_id, courses.name as course_name, section.room_id, building.name, time_slot.time_slot_id, time_slot.start_time, time_slot.end_time, time_slot.day  FROM courses INNER JOIN section ON courses.course_id = section.course_id INNER JOIN faculty f ON f.fac_id = section.fac_id INNER JOIN sec_time ON sec_time.sec_id = section.section_id INNER JOIN time_slot ON time_slot.time_slot_id = sec_time.time_slot_id INNER JOIN room ON room.room_id = section.room_id INNER JOIN building ON building.building_id = room.building_id WHERE  section.section_id  IN  (SELECT DISTINCT section.section_id FROM section INNER JOIN sec_time ON sec_time.sec_id = section.section_id LEFT JOIN stud_sec ON section.section_id = stud_sec.sec_id WHERE sec_time.time_slot_id NOT IN (SELECT sec_time.time_slot_id FROM sec_time INNER JOIN section ON section.section_id = sec_time.sec_id INNER JOIN stud_sec ON stud_sec.sec_id = section.section_id WHERE stud_sec.stud_id = ?))",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status="status";
            result.message="successfully competed";
            res.send(result);
        }
    });
});
app.post("/faculty/updatefacultydetails/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:""
    }
    var id = req.params.id;
    console.log(id);
    var first_name = req.body.first_name;
    console.log(first_name);
    var middle_name = req.body.middle_name;
    console.log(middle_name);
    var last_name = req.body.last_name;
    console.log(last_name);
    var sex = req.body.sex;
    console.log(sex);
    var dob = req.body.dob;
    console.log(dob);
    var blood_group = req.body.blood_group;
    console.log(blood_group);
    var email = req.body.email;
    console.log(email);
    var cabin = req.body.cabin;
    console.log(cabin);
    var age = Number(req.body.age);
    console.log(age);
    var phone = Number(req.body.phone);
    console.log(phone);
    var branch_id = req.body.branch_id;
    console.log(branch_id);
    var houseno = req.body.houseno;
    console.log(houseno);
    var apt_name = req.body.apt_name;
    console.log(apt_name);
    var locality = req.body.locality;
    console.log(locality);
    var city = req.body.city;
    console.log(city);
    var state = req.body.state;
    console.log(state);
    var country = req.body.country;
    console.log(country);
    var pincode = Number(req.body.pincode);
    console.log(pincode);
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length > 0){
                result.status = "failure";
                result.message = "user id taken";
                res.send(result);
            }
            else{
                mysqlconnection.beginTransaction((err) =>{
                    if(err){
                        result.status="failure";
                        result.message="transaction failed";
                        console.log(err);
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("UPDATE faculty SET first_name = ?,middle_name = ?,last_name = ?,sex = ?,age = ?,dob = ?,branch_id = ?,email_id = ?,cabin_room = ?,phone_no = ?,blood_group = ? WHERE fac_id = ?",[first_name,middle_name,last_name,sex,age,dob,branch_id,email,cabin,phone,blood_group,id],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback((err) => {
                                    console.log(err);
                                    result.status="failure";
                                    result.message="faculty insertion failed";
                                    res.send(result);
                                });
                            }
                            else{
                                mysqlconnection.query("SELECT 1 FROM state_country WHERE state = ? AND country = ? ORDER BY state",[state,country],(err,rows,fields) => {
                                    if(err){
                                        return mysqlconnection.rollback((err) => {
                                            console.log(err);
                                            result.status="failure";
                                            result.message="faculty state failed";
                                            res.send(result);
                                        });
                                    }
                                    else{
                                        console.log(rows);
                                        if(rows.length <= 0){
                                            mysqlconnection.query("INSERT INTO state_country VALUES(?,?)",[state,country],(err,rows,fields) => {
                                                if(err){
                                                    return mysqlconnection.rollback((err) => {
                                                        console.log(err);
                                                        result.status="failure";
                                                        result.message="state insertion failed";
                                                        res.send(result);
                                                    });
                                                }
                                                else{
                                                    console.log(rows);
                                                }
                                            });
                                        }
                                        mysqlconnection.query("SELECT 1 FROM city_state WHERE state = ? AND city = ? ORDER BY city",[state,city],(err,rows,fields) => {
                                            if(err){
                                                return mysqlconnection.rollback((err) => {
                                                    console.log(err);
                                                    result.status="failure";
                                                    result.message="faculty city failed";
                                                    res.send(result);
                                                });
                                            }
                                            else{
                                                console.log(rows);
                                                if(rows.length <= 0){
                                                    mysqlconnection.query("INSERT INTO city_state VALUES(?,?)",[city,state],(err,rows,fields) => {
                                                        if(err){
                                                            return mysqlconnection.rollback((err) => {
                                                                console.log(err);
                                                                result.status="failure";
                                                                result.message="city insertion failed";
                                                                res.send(result);
                                                            });
                                                        }
                                                        else{
                                                            console.log(rows);
                                                        }
                                                    }); 
                                                }
                                                mysqlconnection.query("UPDATE fac_address SET house_no = ?, apt_name = ?, locality = ?, city = ?, pin_code = ? WHERE fac_id = ?",[houseno,apt_name,locality,city,pincode,id],(err,rows,fields) => {
                                                    if(err) {
                                                        return mysqlconnection.rollback((err) => {
                                                            console.log(err);
                                                            result.status="failure";
                                                            result.message="faculty address insertion failed";
                                                            res.send(result);
                                                        }); 
                                                    }
                                                    else{
                                                        mysqlconnection.commit((err) => {
                                                            if(err){
                                                                console.log(err);
                                                                result.status="failure";
                                                                result.message="commit failed";
                                                                res.send(result); 
                                                            }
                                                            else{
                                                                result.status="success";
                                                                result.message="successfully completed";
                                                                res.send(result);
                                                            }
                                                        }); 
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        }
    });
});
app.get("/faculty/:id/getCourses",(req,res) => {
    var result = {
        status:"",
        message:"",
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT c.course_id,c.name FROM courses c INNER JOIN section s ON c.course_id = s.course_id WHERE s.fac_id <> ?",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            
            Array.prototype.push.apply(result.data,rows);
            result.status="success"
            result.message="successfully completed"
            res.send(result);
        }
    });
});
app.get("/faculty/:id/getTime/:day",(req,res) => {
    var result = {
        status:"",
        message:"",
        data:[]
    }
    var id = req.params.id;
    var day = req.params.day;
    mysqlconnection.query("select * from time_slot where time_slot.day = ? and time_slot.time_slot_id NOT IN (select sec_time.time_slot_id from section inner join sec_time on sec_time.sec_id = section.section_id where section.fac_id = ?)",[day,id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status="success"
            result.message="successfully completed"
            res.send(result);
        }
    });
});
app.post("/faculty/:id/addClass",(req,res) => {
    var result = {
        status:"",
        message:"",
    }
    var id = req.params.id;
    var section = req.body.section;
    var time = req.body.time;
    var room = req.body.room;
    var course = req.body.course;
    mysqlconnection.query("SELECT 1 FROM section WHERE section_id = ? ORDER BY section_id",[section],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length > 0){
                result.status = "failure";
                result.message = "section id taken";
                res.send(result);
            }
            else{
                mysqlconnection.beginTransaction((err) => {
                    if(err){
                        result.status="failure";
                        result.message="transaction failed";
                        console.log(err);
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("INSERT INTO section VALUES(?,?,?,?)",[section,room,id,course],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback(() => {
                                    console.log(err);
                                    result.status="failure";
                                    result.message="section insertion failed";
                                    res.send(result);
                                }); 
                            }
                            else{
                                mysqlconnection.query("INSERT INTO sec_time VALUES(?,?)",[section,time],(err,rows,fields) => {
                                    if(err){
                                        return mysqlconnection.rollback(() => {
                                            console.log(err);
                                            result.status="failure";
                                            result.message="time insertion failed";
                                            res.send(result);
                                        }); 
                                    }
                                    else{
                                        mysqlconnection.commit((err) => {
                                            if(err){
                                                return mysqlconnection.rollback((err) => {
                                                    console.log(err);
                                                    result.status="failure";
                                                    result.message="commit failed";
                                                    res.send(result);
                                                }); 
                                            }
                                            else{
                                                result.status="success";
                                                result.message="successfully completed";
                                                res.send(result);
                                            }
                                        })
                                    }
                                });
                            }
                        });
                    }
                })
            }
        }
    });
});
app.post("/admin/addRoom",(req,res) => {
    var result = {
        status:"",
        message:"",
    }
    var building = req.body.building_id;
    var room = req.body.room_id;
    var capacity = req.body.room_capacity;
    mysqlconnection.query("SELECT 1 FROM room WHERE room_id = ? ORDER BY room_id",[room],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length > 0){
                result.status = "failure";
                result.message = "room id taken";
                res.send(result);
            }
            else{
                mysqlconnection.query("INSERT INTO room VALUES(?,?,?)",[room,building,capacity],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "room insertion failed";
                        res.send(result);
                    }
                    else{
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.get("/faculty/:id/getRoom/:time/:building",(req,res) => {
    var result = {
        status:"",
        message:"",
        data:[]
    }
    var id = req.params.id;
    var time = req.params.day;
    var building = req.params.building;
    mysqlconnection.query("select * from room where building_id = ? and room_id not in (select section.room_id from section inner join sec_time on section.section_id = sec_time.sec_id where sec_time.time_slot_id = ?)",[building,time],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status="success"
            result.message="successfully completed"
            res.send(result);
        }
    });
});
app.get("/student/get/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:{}
    }
    var id = req.params.id;
    console.log(id);
    if(id !== null){
    var name;
    var sex;
    var age;
    var dob;
    var email;
    var phone;
    var hostel_room;
    var blood_group;
    var proctor_id;
    var proctor_name;
    var programme_id;
    var programme;
    var department;
    var building;
    var houseno;
    var apt_name;
    var locality;
    var city;
    var state;
    var country;
    var pincode;
    var start_date;
    var sem_completed;
    var creds_completed;
    var curr_sem;
    var cgpa;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            mysqlconnection.query("SELECT * FROM student WHERE stud_id = ?",[id],(err,rows,fields) => {
                if(err){
                    console.log(err);
                    result.status="failure"
                    result.message = "retrieval of student data failed"
                    res.send(result);
                }
                else{
                    const data = rows[0];
                    console.log(data);
                    name = data.first_name + " " ;
                    if(data.middle_name !== null)
                    name = name + data.middle_name + " ";
                    name = name + data.last_name;
                    sex = data.sex;
                    age = data.age;
                    dob = data.dob;
                    var dob_date = new Date(dob);
                    var date_dob = dob_date.getUTCDate();
                    if(date_dob<10){
                        date_dob = "0" + date_dob.toString();
                    }
                    var dob_month = dob_date.getUTCMonth() + 1;
                    if(dob_month<10){
                        dob_month = "0" + dob_month.toString();
                    }
                    dob = date_dob + "-" + dob_month+ "-" + dob_date.getUTCFullYear() ;
                    email = data.email_id;
                    phone = data.phone_no;
                    blood_group = data.blood_group;
                    programme_id = data.programme_id;
                    hostel_room = data.hostel_room;
                    proctor_id = data.proctor_id;
                    start_date = data.start_date;
                    var date = new Date(start_date);
                    var date_start = date.getUTCDate();
                    if(date_start<10){
                        date_start = "0" + date_start.toString(); 
                    }
                    var month = date.getUTCMonth() + 1;
                    if(month<10){
                        month = "0" + month.toString();
                    }
                    start_date = date_start + "-" + month + "-" + date.getUTCFullYear();
                    sem_completed = data.sem_completed;
                    creds_completed = data.creds_completed;
                    curr_sem = data.curr_sem;
                    cgpa = data.cgpa;
                    if(proctor_id !== null){
                        mysqlconnection.query("SELECT first_name,middle_name,last_name FROM faculty WHERE fac_id = ?",[proctor_id],(err,rows,fields) => {
                            if(err){
                                console.log(err);
                                result.status="failure"
                                result.message = "retrieval of proctor data failed"
                                res.send(result);  
                            }
                            else{
                                proctor_name = rows[0].first_name + " ";
                                if(rows[0].middle_name !== null)
                                proctor_name = proctor_name + rows[0].middle_name + " " ;
                                proctor_name = proctor_name + rows[0].last_name;
                            }
                        });
                    }
                    mysqlconnection.query('SELECT name,dept_id FROM programme WHERE programme_id = ?',[programme_id],(err,rows,fields) => {
                        if(err){
                            console.log(err);
                            result.status="failure"
                            result.message = "retrieval of programme data failed"
                            res.send(result); 
                        }
                        else{
                            programme = rows[0].name;
                            department = rows[0].dept_id;
                        }
                    });
                    mysqlconnection.query("SELECT name from building WHERE building_id = (SELECT building_id from room WHERE room_id = ?)",[hostel_room],(err,rows,fields) => {
                        if(err){
                            console.log(err);
                            result.status="failure"
                            result.message = "retrieval of hostel data failed"
                            res.send(result); 
                        }
                        else{
                            building = rows[0].name;
                        }
                    });
                    mysqlconnection.query("SELECT * FROM stud_address WHERE stud_id = ?",[id],(err,rows,fields) => {
                        if(err){
                            console.log(err);
                            result.status="failure"
                            result.message = "retrieval of student address data failed"
                            res.send(result); 
                        }
                        else{
                            houseno = rows[0].house_no;
                            apt_name = rows[0].apt_name;
                            locality = rows[0].locality;
                            city = rows[0].city;
                            pincode = rows[0].pin_code;
                            mysqlconnection.query("SELECT state FROM city_state WHERE city=?",[city],(err,rows,fields) => {
                                if(err){
                                    console.log(err);
                                    result.status="failure"
                                    result.message = "retrieval of student address (state) data failed"
                                    res.send(result); 
                                }
                                else{
                                    state = rows[0].state;
                                    mysqlconnection.query("SELECT country FROM state_country WHERE state=?",[state],(err,rows,fields) => {
                                        if(err){
                                            console.log(err);
                                            result.status="failure"
                                            result.message = "retrieval of student address (country) data failed"
                                            res.send(result); 
                                        }
                                        else{
                                            country = rows[0].country;
                                            console.log(country);
                                            result.status = "success";
                                            result.message = "successfully completed";
                                            result.data = {
                                                 id:id,
                                                 name:name,
                                                 sex:sex,
                                                 age:age,
                                                 dob:dob,
                                                 email:email,
                                                 phone:phone,
                                                 hostel_room:hostel_room,
                                                 blood_group:blood_group,
                                                 proctor_id:proctor_id,
                                                 proctor_name:proctor_name,
                                                 programme_id:programme_id,
                                                 programme:programme,
                                                 department:department,
                                                 building:building,
                                                 houseno:houseno,
                                                 apt_name:apt_name,
                                                 locality:locality,
                                                 city:city,
                                                 state:state,
                                                 country:country,
                                                 pincode:pincode,
                                                 start_date: start_date,
                                                 sem_completed: sem_completed,
                                                 creds_completed: creds_completed,
                                                 curr_sem: curr_sem,
                                                 cgpa: cgpa,
                                            };
                                            console.log(result.data);
                                            res.send(result);
                                        }
                                    });
                                }
                                
                            });    
                        }
                    });
                }
            });
        }
    });
}
else{
    result.status = "failure";
    res.send(result);
}
});
app.get("/student/getClass/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT section.course_id, courses.name as course_name, section.fac_id, faculty.first_name, faculty.middle_name, faculty.last_name, stud_sec.sec_id, section.room_id, time_slot.time_slot_id, time_slot.start_time, time_slot.end_time, time_slot.day, room.room_id, room.building_id, building.name as building_name FROM student INNER JOIN stud_sec ON student.stud_id = stud_sec.stud_id INNER JOIN section ON stud_sec.sec_id = section.section_id INNER JOIN sec_time ON section.section_id = sec_time.sec_id INNER JOIN time_slot ON time_slot.time_slot_id = sec_time.time_slot_id  INNER JOIN room ON room.room_id = section.room_id INNER JOIN faculty ON section.fac_id = faculty.fac_id INNER JOIN building ON building.building_id = room.building_id INNER JOIN courses ON courses.course_id = section.course_id WHERE student.stud_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "select failed";
                        res.send(result);
                    }
                    else{
                        Array.prototype.push.apply(result.data,rows);
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.get("/faculty/getClass/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT section.section_id, section.course_id, courses.name, section.room_id, time_slot.time_slot_id, time_slot.start_time, time_slot.end_time, time_slot.day, room.building_id, building.name as building_name FROM faculty INNER JOIN section ON section.fac_id = faculty.fac_id INNER JOIN sec_time ON section.section_id = sec_time.sec_id INNER JOIN time_slot ON time_slot.time_slot_id = sec_time.time_slot_id INNER JOIN room ON room.room_id = section.room_id INNER JOIN courses ON courses.course_id = section.course_id INNER JOIN building ON building.building_id = room.building_id WHERE faculty.fac_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "select failed";
                        res.send(result);
                    }
                    else{
                        Array.prototype.push.apply(result.data,rows);
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.get("/faculty/getClass/:id/info/:sec",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var sec = req.params.sec;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT section.section_id, section.course_id, courses.name, section.room_id, time_slot.time_slot_id, time_slot.start_time, time_slot.end_time, time_slot.day, room.building_id, building.name as building_name FROM faculty INNER JOIN section ON section.fac_id = faculty.fac_id INNER JOIN sec_time ON section.section_id = sec_time.sec_id INNER JOIN time_slot ON time_slot.time_slot_id = sec_time.time_slot_id INNER JOIN room ON room.room_id = section.room_id INNER JOIN courses ON courses.course_id = section.course_id INNER JOIN building ON building.building_id = room.building_id WHERE faculty.fac_id = ? AND section.section_id = ?",[id,sec],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "select failed";
                        res.send(result);
                    }
                    else{
                        Array.prototype.push.apply(result.data,rows);
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.get("/faculty/getClass/:id/students/:sec",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var sec = req.params.sec;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT stud.stud_id, stud.first_name, stud.middle_name,stud.last_name, stud.email_id, stud.phone_no, stud.programme_id FROM stud_sec s INNER JOIN student stud ON stud.stud_id = s.stud_id WHERE s.sec_ID = ?",[sec],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "select failed";
                        res.send(result);
                    }
                    else{
                        Array.prototype.push.apply(result.data,rows);
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/student/login",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.body.id;
    var password = req.body.password;
    console.log(id);
    console.log(password);
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status = "failure";
            result.message = "failed";
            res.send(result);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "user not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM student WHERE stud_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "failed password";
                        res.send(result);
                    }
                    else{
                        console.log(rows);
                        if(password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect password";
                            res.send(result); 
                        }
                        else{
                            result.status = "success";
                            result.message = "successfully completed";
                            res.send(result);
                        }
                    }
                });
            }
        }
    });
});
app.post("/admin/register",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var first_name = req.body.first_name;
    var middle_name = req.body.middle_name;
    var last_name = req.body.last_name;
    var admin_id = req.body.admin_id;
    var email = req.body.email;
    var pass = req.body.password;
    console.log(admin_id);
    console.log(first_name);
    console.log(middle_name);
    console.log(last_name);
    console.log(email);
    console.log(pass);
    mysqlconnection.beginTransaction((err) => {
        if(err){
            result.status = "failure";
            result.message = "transaction failed";
            res.send(result);
            console.log(err);
        }
        else{
            mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[admin_id],(err,rows,fields) => {
                if(err){
                    return mysqlconnection.rollback((err) => {
                        result.status="failure";
                        result.message = "check failed";
                        res.send(result);
                        console.log(err);
                    });
                }
                else{
                    console.log(rows);
                    if(rows.length > 0){
                        result.status = "failure";
                        result.message = "user id taken";
                        res.send(result);
                    }
                    else{
                        mysqlconnection.query("INSERT INTO admin(admin_id,first_name,last_name,email_id,pass) VALUES(?,?,?,?,?)",[admin_id,first_name,last_name,email,pass],(err,rows,fields) => {
                            if(err){
                                return mysqlconnection.rollback((err) => {
                                    result.status="failure";
                                    result.message = "insertion failed";
                                    res.send(result);
                                    console.log(err);
                                });
                            }
                            else{
                                if(middle_name !== null){
                                    mysqlconnection.query("UPDATE admin SET middle_name = ? WHERE admin_id = ?",[middle_name,admin_id],(err,rows,fields) => {
                                        if(err){
                                            return mysqlconnection.rollback((err) => {
                                                result.status="failure";
                                                result.message = "insertion of middle name failed";
                                                res.send(result);
                                                console.log(err);
                                            });
                                        }
                                    });
                                }
                                mysqlconnection.commit((err) => {
                                    if(err){
                                        return mysqlconnection.rollback((err) => {
                                            result.status="failure";
                                            result.message = "commit failed";
                                            res.send(result);
                                            console.log(err);
                                        });
                                    }
                                    else{
                                        result.status = "success";
                                        result.message = "successfully completed";
                                        res.send(result);
                                    }
                                })
                            }
                        });
                    }
                }
            });
            
        }
    });
});
app.post("/admin/login",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.body.admin_id;
    var password = req.body.password;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "login failed";
            res.send(result);
            console.log(err);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM admin WHERE admin_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "failed password";
                        res.send(result);
                    }
                    else{
                        console.log(rows);
                        if(password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect password";
                            res.send(result); 
                        }
                        else{
                            result.status = "success";
                            result.message = "successfully completed";
                            res.send(result);
                        }
                    }
                });
            }
        }
    });
});

app.get("/admin/get/:id",(req,res)=>{
    var result = {
        status:"",
        message:"",
        errors:[],
        data:{}
    }
    var id = req.params.id;
    var name;
    var email;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT * FROM admin WHERE admin_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="retrieval of faculty data failed"
                        res.send(result); 
                    }
                    else{
                        name = rows[0].first_name + " ";
                        if(rows[0].middle_name !== null){
                            name = name + rows[0].middle_name + " ";                  
                        }
                        name = name + rows[0].last_name;
                        email = rows[0].email_id;
                        result.status = "success";
                        result.message = "successfully completed";
                        result.data = {
                            id:id,
                            name:name,
                            email:email
                        };
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/admin/remove/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "removal failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("DELETE FROM admin WHERE admin_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        result.status = "failure";
                        result.message = "admin removal failed";
                        res.send(result);
                        console.log(err);
                    }
                    else{
                        result.status = "success";
                        result.message = "admin successfully removed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/admin/updateadmindetails/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var first_name = req.body.first_name;
    var middle_name = req.body.middle_name;
    var last_name = req.body.last_name;
    var email = req.body.email;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "update failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("UPDATE admin SET first_name = ?, middle_name = ?, last_name = ?, email_id = ? WHERE admin_id = ?",[first_name,middle_name,last_name,email,id],(err,rows,fields) => {
                    if(err){
                        result.status = "failure";
                        result.message = "admin update failed";
                        res.send(result);
                        console.log(err);
                    }
                    else{
                        result.status = "success";
                        result.message = "successfully completed";
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/admin/changepassword/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var old_password  = req.body.password;
    var newpassword = req.body.new_password;
    mysqlconnection.query("SELECT 1 FROM admin WHERE admin_id = ? ORDER BY admin_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "admin not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM admin WHERE admin_id = ?",[id],(err,rows,fields)=> {
                    if(err){
                        result.status = "failure";
                        result.message = "old password retrieval failed";
                        res.send(result);
                        console.log(err); 
                    }
                    else{
                        console.log(old_password);
                        console.log(newpassword);
                        console.log(rows[0].pass);
                        if(old_password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect old password";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("UPDATE admin SET pass = ? WHERE admin_id = ?",[newpassword,id],(err,rows,fields) => {
                                if(err){
                                    result.status = "failure";
                                    result.message = "change new password failed";
                                    res.send(result);
                                    console.log(err); 
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully changed password";
                                    res.send(result);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});
app.post("/student/changepassword/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var old_password  = req.body.password;
    var newpassword = req.body.new_password;
    mysqlconnection.query("SELECT 1 FROM student WHERE stud_id = ? ORDER BY stud_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "student not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM student WHERE stud_id = ?",[id],(err,rows,fields)=> {
                    if(err){
                        result.status = "failure";
                        result.message = "old password retrieval failed";
                        res.send(result);
                        console.log(err); 
                    }
                    else{
                        console.log(old_password);
                        console.log(newpassword);
                        console.log(rows[0].pass);
                        if(old_password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect old password";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("UPDATE student SET pass = ? WHERE stud_id = ?",[newpassword,id],(err,rows,fields) => {
                                if(err){
                                    result.status = "failure";
                                    result.message = "change new password failed";
                                    res.send(result);
                                    console.log(err); 
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully changed password";
                                    res.send(result);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});
app.post("/faculty/changepassword/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var old_password  = req.body.password;
    var newpassword = req.body.new_password;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM faculty WHERE fac_id = ?",[id],(err,rows,fields)=> {
                    if(err){
                        result.status = "failure";
                        result.message = "old password retrieval failed";
                        res.send(result);
                        console.log(err); 
                    }
                    else{
                        console.log(old_password);
                        console.log(newpassword);
                        console.log(rows[0].pass);
                        if(old_password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect old password";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("UPDATE faculty SET pass = ? WHERE fac_id = ?",[newpassword,id],(err,rows,fields) => {
                                if(err){
                                    result.status = "failure";
                                    result.message = "change new password failed";
                                    res.send(result);
                                    console.log(err); 
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully changed password";
                                    res.send(result);
                                }
                            });
                        }
                    }
                });
            }
        }
    });
});
app.post("/admin/facultychangesalaray/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.params.id;
    var salary = req.body.salary;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "change failed";
            res.send(result);
            console.log(err);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("UPDATE faculty SET salary = ? WHERE fac_id = ?",[salary,id],(err,rows,fields) => {
                    if(err){
                        result.status = "failure";
                        result.message = "update salary failed";
                        res.send(result);
                        console.log(err);
                    }
                    else{
                        result.status = "success";
                        result.message = "successfully updated salary";
                        res.send(result);
                    }
                });
            }
        } 
    });
});

app.get("/admin/buildings",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("SELECT * FROM building",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/hostels",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("SELECT * FROM building WHERE name LIKE '%Block'",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/academic",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("SELECT * FROM building WHERE name NOT LIKE '%Block'",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/building/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:{
            id:"",
            name:"",
            rooms:[]
        }
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM building WHERE building_id = ? ORDER BY building_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "building not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT * FROM building WHERE building_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="retrieval of building name failed"
                        res.send(result);  
                    }
                    else{
                        result.data.id = rows[0].building_id;
                        result.data.name = rows[0].name;
                        mysqlconnection.query("SELECT * FROM room WHERE building_id = ?",[result.data.id],(err,rows,fields) => {
                            if(err){
                                console.log(err);
                                result.status="failure"
                                result.message="retrieval of room ids failed"
                                res.send(result); 
                            }
                            else{
                                console.log(rows);
                                Array.prototype.push.apply(result.data.rooms,rows);
                                result.status = "success";
                                result.message = "successfully completed";
                                res.send(result);
                            }
                        });
                    }
                });
            }
        }
    })
});
app.post("/admin/building/add",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.body.id;
    var name = req.body.name;
    mysqlconnection.query("SELECT 1 FROM building WHERE building_id = ? ORDER BY building_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length > 0){
                result.status = "failure";
                result.message = "building id taken";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT 1 FROM building WHERE name = ? ORDER BY name",[name],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="failed building name"
                        res.send(result);
                    }
                    else{
                        if(rows.length > 0){
                            result.status = "failure";
                            result.message = "building name taken";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("INSERT INTO building VALUES(?,?)",[id,name],(err,rows,fields) => {
                                if(err){
                                    console.log(err);
                                    result.status="failure"
                                    result.message="failed insert building"
                                    res.send(result);
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully completed"
                                    res.send(result);
                                }
                            });
                        }
                    }
                })
            }
        }
    });
});
app.post("/admin/department/add",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.body.id;
    var name = req.body.name;
    var room = req.body.room;
    var hod = req.body.hod;
    mysqlconnection.query("SELECT 1 FROM department WHERE dept_id = ? ORDER BY dept_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length > 0){
                result.status = "failure";
                result.message = "department id taken";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT 1 FROM department WHERE name = ? ORDER BY name",[name],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="failed building name"
                        res.send(result);
                    }
                    else{
                        if(rows.length > 0){
                            result.status = "failure";
                            result.message = "department name taken";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("INSERT INTO department VALUES(?,?,?,?)",[id,name,room,hod],(err,rows,fields) => {
                                if(err){
                                    console.log(err);
                                    result.status="failure"
                                    result.message="failed insert department"
                                    res.send(result);
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully completed"
                                    res.send(result);
                                }
                            });
                        }
                    }
                })
            }
        }
    });
});
app.post("/admin/course/add",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.body.id;
    var name = req.body.name;
    var preq = req.body.preq;
    var hod = req.body.hod;
    var dept = req.body.dept;
    mysqlconnection.query("SELECT 1 FROM courses WHERE course_id = ? ORDER BY course_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length > 0){
                result.status = "failure";
                result.message = "course id taken";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT 1 FROM course WHERE name = ? ORDER BY name",[name],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="failed building name"
                        res.send(result);
                    }
                    else{
                        if(rows.length > 0){
                            result.status = "failure";
                            result.message = "course name taken";
                            res.send(result);
                        }
                        else{
                            mysqlconnection.query("INSERT INTO courses VALUES(?,?,?,?,?)",[id,name,preq,hod,dept],(err,rows,fields) => {
                                if(err){
                                    console.log(err);
                                    result.status="failure"
                                    result.message="failed insert course"
                                    res.send(result);
                                }
                                else{
                                    result.status = "success";
                                    result.message = "successfully completed"
                                    res.send(result);
                                }
                            });
                        }
                    }
                })
            }
        }
    });
});
app.post("/admin/department/delete/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM department WHERE dept_id = ? ORDER BY dept_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "department not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("DELETE FROM department WHERE dept_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="delete failed"
                        res.send(result);
                    }
                    else{
                        result.status="success"
                        result.message="successfully completed"
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/admin/building/delete/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM building WHERE building_id = ? ORDER BY building_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "building not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("DELETE FROM building WHERE building_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="delete failed"
                        res.send(result);
                    }
                    else{
                        result.status="success"
                        result.message="successfully completed"
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("/admin/course/delete/:id",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM courses WHERE course_id = ? ORDER BY course_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "course not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("DELETE FROM courses WHERE course_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="delete failed"
                        res.send(result);
                    }
                    else{
                        result.status="success"
                        result.message="successfully completed"
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.get("/admin/programmes",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("SELECT programme.programme_id, programme.name, department.dept_id , department.name as dept_name FROM programme INNER JOIN department ON programme.dept_id = department.dept_id",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/programmes/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id= req.params.id;
    mysqlconnection.query("SELECT programme.programme_id, programme.name, department.dept_id , department.name as dept_name FROM programme INNER JOIN department ON programme.dept_id = department.dept_id WHERE programme.dept_id = ?",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.post("/admin/programme/delete/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT 1 FROM programme WHERE programme_id = ? ORDER BY programme_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "programme not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("DELETE FROM programme WHERE programme_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="delete failed"
                        res.send(result);
                    }
                    else{
                        result.status="success"
                        result.message="successfully completed"
                        res.send(result);
                    }
                });
            }
        }
    });
});
app.post("admin/programme/add",(req,res) => {
    var result = {
        status:"",
        message:"",
    };
    var id = req.body.id;
    var name = req.body.name;
    var dept = req.body.dept;
    mysqlconnection.query("SELECT 1 FROM programme WHERE programme_id = ? ORDER BY programme_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length > 0){
                result.status = "failure";
                result.message = "programme id taken";
                res.send(result);
            }
            else{
                mysqlconnection.query("INSERT INTO programme VALUES(?,?,?)",[id,name,dept],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "insertion failed";
                        res.send(result);
                    }
                    else{
                        result.status="success"
                        result.message="successfully completed"
                        res.send(result);
                    }
                });
            }
        }
    })
})
app.get("/admin/courses",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("select c1.course_id , c1.name, c2.course_id as preq_id, c2.name as preq_name,c1.dept_id,c1.head_fac_id, f.first_name, f.middle_name, f.last_name from (courses c1 left join courses c2 on c1.preq_course_id = c2.course_id) inner join faculty f on c1.head_fac_id = f.fac_id",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/courses/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var id = req.params.id;
    mysqlconnection.query("select c1.course_id , c1.name, c2.course_id as preq_id, c2.name as preq_name,c1.dept_id,c1.head_fac_id, f.first_name, f.middle_name, f.last_name from (courses c1 left join courses c2 on c1.preq_course_id = c2.course_id) inner join faculty f on c1.head_fac_id = f.fac_id WHERE c1.dept_id = ?",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            Array.prototype.push.apply(result.data,rows);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/department",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    mysqlconnection.query("SELECT department.dept_id , department.name, department.room_id, department.hod_id, building.name as building_name, faculty.first_name, faculty.middle_name, faculty.last_name FROM (((department INNER JOIN room ON department.room_id = room.room_id) INNER JOIN building ON building.building_id = room.building_id) INNER JOIN faculty ON department.hod_id = faculty.fac_id)",(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            const dat = JSON.stringify(rows);
            const data = JSON.parse(dat);
            Array.prototype.push.apply(result.data,data);
            result.status = "success";
            result.message = "successfully completed";
            res.send(result);
        }
    });
});
app.get("/admin/department/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:{
            dept_id:"",
            name:"",
            room_id:"",
            hod_id:"",
            building_name:"",
            first_name:"",
            middle_name:"",
            last_name:"",
            courses:[],
            programmes:[]
        }
    }
    var id = req.params.id;
    mysqlconnection.query("SELECT department.dept_id , department.name, department.room_id, department.hod_id, building.name as building_name, faculty.first_name, faculty.middle_name, faculty.last_name FROM (((department INNER JOIN room ON department.room_id = room.room_id) INNER JOIN building ON building.building_id = room.building_id) INNER JOIN faculty ON department.hod_id = faculty.fac_id) WHERE department.dept_id =  ?",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "failed";
            res.send(result);
            console.log(err);
        }
        else{
            result.data.dept_id = rows[0].dept_id;
            result.data.name = rows[0].name;
            result.data.room_id = rows[0].room_id;
            result.data.hod_id = rows[0].hod_id;
            result.data.building_name = rows[0].building_name;
            result.data.first_name = rows[0].first_name;
            result.data.middle_name= rows[0].middle_name;
            result.data.last_name = rows[0].last_name;
            mysqlconnection.query("select c1.course_id , c1.name, c2.course_id as preq_id, c2.name as preq_name, c1.head_fac_id, f.first_name, f.middle_name, f.last_name from (courses c1 left join courses c2 on c1.preq_course_id = c2.course_id) inner join faculty f on c1.head_fac_id = f.fac_id where c1.dept_id = ?",[id],(err,rows,fields) => {
                if(err){
                    result.status = "failure";
                    result.message = "courses failed";
                    res.send(result);
                    console.log(err); 
                }
                else{
                    console.log(rows);
                    Array.prototype.push.apply(result.data.courses,rows);
                    mysqlconnection.query("SELECT * FROM programme WHERE dept_id = ?",[result.data.dept_id],(err,rows,fields) => {
                        if(err){
                            result.status = "failure";
                            result.message = "programme failed";
                            res.send(result);
                            console.log(err); 
                        }
                        else{
                            console.log(rows);
                            Array.prototype.push.apply(result.data.programmes,rows);
                            result.status = "success";
                            result.message = "successfully completed";
                            res.send(result);
                        }
                    });
                }
            });
        }
    });
});
app.get("/faculty/get/:id",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:{}
    }
    var id = req.params.id;
    var name;
    var sex;
    var dob;
    var age;
    var branch_id;
    var department;
    var email;
    var cabin_room;
    var phone;
    var blood_group;
    var start_date;
    var salary;
    var houseno;
    var apt_name;
    var locality;
    var city;
    var state;
    var country;
    var pincode;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            console.log(err);
            result.status="failure"
            result.message="failed"
            res.send(result);
        }
        else{
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT * FROM faculty WHERE fac_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status="failure"
                        result.message="retrieval of faculty data failed"
                        res.send(result); 
                    }
                    else{
                        name = rows[0].first_name + " ";
                        if(rows[0].middle_name !== null){
                            name = name + rows[0].middle_name + " ";
                        }
                        name = name + rows[0].last_name;
                        sex = rows[0].sex;
                        branch_id = rows[0].branch_id;
                        blood_group = rows[0].blood_group;
                        email = rows[0].email_id;
                        cabin_room = rows[0].cabin_room;
                        phone = rows[0].phone_no;
                        salary = rows[0].salary;
                        dob = rows[0].dob;
                        var dob_date = new Date(dob);
                        var date_dob = dob_date.getUTCDate();
                        if(date_dob<10){
                            date_dob = "0" + date_dob.toString();
                        }
                        var dob_month = dob_date.getUTCMonth() + 1;
                        if(dob_month<10){
                            dob_month = "0" + dob_month.toString();
                        }
                        dob = date_dob + "-" + dob_month+ "-" + dob_date.getUTCFullYear() ;
                        var dates = dob.split("-");
                        var year = Number(dates[0]);
                        var month = Number(dates[1]) - 1;
                        var day = Number(dates[2]);
                        var today = new Date();
                        age = today.getFullYear() - year;
                        if (today.getMonth() < month || (today.getMonth() === month && today.getDate() < day)) {
                            age;
                        }
                        start_date = rows[0].start_date;
                        var date = new Date(start_date);
                        var date_start = date.getUTCDate();
                        if(date_start<10){
                            date_start = "0" + date_start.toString(); 
                        }
                        var month = date.getUTCMonth() + 1;
                        if(month<10){
                            month = "0" + month.toString();
                        }
                        start_date = date_start + "-" + month + "-" + date.getUTCFullYear();
                        mysqlconnection.query("SELECT * FROM fac_address WHERE fac_id = ?",[id],(err,rows,fields) => {
                            if(err){
                                console.log(err);
                                result.status="failure"
                                result.message="retrieval of faculty address data failed"
                                res.send(result);
                            }
                            else{
                                houseno = rows[0].house_no;
                                apt_name = rows[0].apt_no;
                                locality = rows[0].locality;
                                city = rows[0].city;
                                pincode = rows[0].pin_code;
                                mysqlconnection.query("SELECT state FROM city_state WHERE city = ?",[city],(err,rows,fields) => {
                                    if(err){
                                        console.log(err);
                                        result.status="failure"
                                        result.message="retrieval of faculty state data failed"
                                        res.send(result);
                                    }
                                    else{
                                        console.log(rows);
                                        state = rows[0].state;
                                        mysqlconnection.query("SELECT country FROM state_country WHERE state = ?",[state],(err,rows,fields) => {
                                            if(err){
                                                console.log(err);
                                                result.status="failure"
                                                result.message="retrieval of faculty country data failed"
                                                res.send(result);
                                            }
                                            else{
                                                console.log(rows);
                                                country = rows[0].country;
                                                if(branch_id !== null){
                                                    mysqlconnection.query("SELECT name FROM department WHERE dept_id = ?",[branch_id],(err,rows,fields) => {
                                                        if(err){
                                                            console.log(err);
                                                            result.status="failure"
                                                            result.message="retrieval of faculty department data failed"
                                                            res.send(result);
                                                        }
                                                        else{
                                                            department = rows[0].name;
                                                            console.log(department);
                                                            result.status = "success";
                                                            result.message = "successfully completed";
                                                            result.data = {
                                                                 id:id,
                                                                 name:name,
                                                                 sex:sex,
                                                                 dob:dob,
                                                                 age:age,
                                                                 branch_id:branch_id,
                                                                 department:department,
                                                                 email:email,
                                                                 cabin_room:cabin_room,
                                                                 phone:phone,
                                                                 blood_group:blood_group,
                                                                 start_date:start_date,
                                                                 salary:salary,
                                                                 houseno:houseno,
                                                                 apt_name:apt_name,
                                                                 locality:locality,
                                                                 city:city,
                                                                 state:state,
                                                                 country:country,
                                                                 pincode:pincode
                                                            };
                                                            res.send(result);
                                                        }
                                                    });
                                                }
                                                
                                            } 
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } 
        }
    });
});


app.post("/faculty/login",(req,res) => {
    res.setHeader('Access-Control-Allow-Origin','*');
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    };
    var id = req.body.id;
    var password = req.body.password;
    mysqlconnection.query("SELECT 1 FROM faculty WHERE fac_id = ? ORDER BY fac_id",[id],(err,rows,fields) => {
        if(err){
            result.status = "failure";
            result.message = "login failed";
            res.send(result);
            console.log(err);
        }
        else{
            console.log(rows);
            if(rows.length <= 0){
                result.status = "failure";
                result.message = "faculty not found";
                res.send(result);
            }
            else{
                mysqlconnection.query("SELECT pass FROM faculty WHERE fac_id = ?",[id],(err,rows,fields) => {
                    if(err){
                        console.log(err);
                        result.status = "failure";
                        result.message = "failed password";
                        res.send(result);
                    }
                    else{
                        console.log(rows);
                        if(password !== rows[0].pass){
                            result.status = "failure";
                            result.message = "incorrect password";
                            res.send(result); 
                        }
                        else{
                            result.status = "success";
                            result.message = "successfully completed";
                            res.send(result);
                        }
                    }
                });
            }
        }
    });
});
app.post("/employee/register",(req,res) => {
    var result = {
        status:"",
        message:"",
        errors:[],
        data:[]
    }
    var Emp_ID = req.body.Emp_ID;
    var Name = req.body.Name;
    var EmpCode = req.body.EmpCode;
    var Salary = req.body.Salary;
    mysqlconnection.beginTransaction((err) => {
        if(err){
            result.status="failure";
            res.send(result);
            console.log(err);
            //throw err;
        } 
        mysqlconnection.query('INSERT INTO Employee VALUES(?,?,?,?)',[Emp_ID,Name,EmpCode,Salary],(err,rows,field)=>{
            if(err){
                return mysqlconnection.rollback((err) => {
                    result.status = "failure";
                    res.send(result);
                    console.log(err);
                    //throw err;
                });
            }
            result.message = "data added"
            mysqlconnection.query('SELECT * FROM Employe',(err,rows,field) => {
                if(err){
                    return mysqlconnection.rollback((err) => {
                        result.status="failure";
                        res.send(result);
                        console.log(err);
                        //throw err;
                    });
                }
                mysqlconnection.commit((err) => {
                    if(err){
                        return mysqlconnection.rollback((err) => {
                            result.status="failure";
                            res.send(result);
                            console.log(err);
                            //throw err;
                        });
                    }
                    console.log(rows);
                Array.prototype.push.apply(result.data,rows);
                result.status = "success";
                res.send(result);
                });
            });
        });
    });
});
app.listen(3000,() => console.log("Server started on port 3000"));