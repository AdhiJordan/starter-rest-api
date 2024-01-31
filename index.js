const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const { JWT_EXPIRES_IN, JWT_SECRET } = require("./config.js");
const jwt = require("jsonwebtoken");
const path = require("path");
const nodemailer = require("nodemailer");
const { jsPDF } = require("jspdf");
const { applyPlugin } = require("jspdf-autotable");

applyPlugin(jsPDF);

const app = express();
const port = process.env.PORT || 3000;
//const port = process.env.PORT || 3000;
app.use(cors());

app.use(
  cors({
    origin: "https://fine-tan-agouti-wear.cyclic.app",
    headers: ["Content-Type"],
    credentials: true,
  })
);
app.use(express.json());

const db = mysql.createConnection({
  //host: "localhost",
  host: "bom1plzcpnl503503.prod.bom1.secureserver.net",
  //database: "RojapooUserDetails",
  database: "RojapooUsers",
  user: "adhi",
  password: "home@94AVT2023",
});

db.connect(function (err) {
  if (err) {
    console.error("Error connecting to MySQL: " + err.stack);
    return;
  }
  console.log("connected as id " + db.threadId);
});

app.get("/get-users", (req, res) => {
  const sql = "SELECT * from users";
  db.query(sql, (err, result) => {
    if (err) throw err;
    return res.json(result);
  });
});

// app.get("/get-logged-users", (req, res) => {
//   const sql = "SELECT * from loginUsers";
//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     return res.json(result);
//   });
// });

app.get("/get-registered-users", (req, res) => {
  const sql = "SELECT * from registerNewUsers";
  db.query(sql, (err, result) => {
    if (err) throw err;
    //res.setHeader("Content-Type", "application/json");
    //let obj = { result };
    //console.log("result", result);
    //console.log("length", result.length);
    //return res.json(result.length);
    //res.end(result.length);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result.length));
    res.end();
  });
});

app.get("/get-registered-users/:id", (req, res) => {
  const sql = "SELECT * from registerNewUsers WHERE Id = ?";
  const id = req.params.id;
  console.log("id", id);
  db.query(sql, [id], (err, result) => {
    if (err) throw err;
    //res.setHeader("Content-Type", "application/json");
    //let obj = { result };
    //console.log("result", result);
    console.log("length", result);
    // return res.json(result);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
  });
});

// app.post("/login", (req, res) => {
//   const sql = "INSERT INTO loginUsers (`Id`, `Email`, `Password`) VALUES (?)";
//   const values = [req.body.id, req.body.email, req.body.password];
//   console.log("$$$$$$$", values);
//   db.query(sql, [values], (err, result) => {
//     if (err) throw err;
//     return res.json(result);
//   });
// });
app.post("/register-user", (req, res) => {
  const sql =
    "INSERT INTO registerNewUsers (`Id`, `Name`, `Email`, `Password`, `PhoneNumber`, `Address`, `Pincode`) VALUES (?)";
  const values = [
    req.body.id,
    req.body.name,
    req.body.email,
    req.body.password,
    req.body.phoneNumber,
    req.body.address,
    req.body.pincode,
  ];
  console.log("$$$$$$$", values);
  db.query(sql, [values], (err, result) => {
    if (err) throw err;
    res.setHeader("Content-Type", "application/json");
    let obj = { result };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(obj));
    res.end();
    //return res.json(obj);
  });
});

app.put("/edit-registered-user-details/:id", (req, res) => {
  const sql =
    "UPDATE registerNewUsers SET `Name`=?, `Email`=?, `PhoneNumber`=?, `Address`=?, `Pincode`=? WHERE Id=?";
  const values = [
    req.body.name,
    req.body.email,
    req.body.phoneNumber,
    req.body.address,
    req.body.pincode,
    req.body.id,
  ];
  db.query(sql, values, (err, result) => {
    if (err) throw err;
    res.setHeader("Content-Type", "application/json");
    console.log("result", result);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
    //return res.json(result);
  });
});

app.put("/change-password", (req, res) => {
  const getSqlRegisteredUsers = req.body.phoneNumber
    ? "SELECT * from `registerNewUsers` WHERE PhoneNumber=?"
    : "SELECT * from `registerNewUsers` WHERE Email=?";

  db.query(
    getSqlRegisteredUsers,
    [req.body.phoneNumber ? req.body.phoneNumber : req.body.email],
    (err, result) => {
      if (err) throw err;
      res.setHeader("Content-Type", "application/json");
      //console.log("result", result);
      var getUserid = result && result[0].id;
      //return res.json(result);
      const sql = "UPDATE registerNewUsers SET `Password`=? WHERE Id=?";
      const values = [req.body.password, getUserid];
      db.query(sql, values, (err, result) => {
        if (err) throw err;
        res.setHeader("Content-Type", "application/json");
        console.log("result", result);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(result));
        res.end();
        // return res.json({
        //   message: "Success",
        //   status: 200,
        // });
      });
    }
  );

  console.log("$$$$$", req.body);

  // var email, phoneNumber;

  // if (req.body.email) {
  //   if (validator.isEmail(req.body.email) === true) {
  //     email = req.body.email;
  //   } else {
  //     phoneNumber = req.body.email;
  //   }
  // }

  // console.log("@@@@@", email, phoneNumber);

  // const values = [req.body.password];
  // db.query(sql, values, (err, result) => {
  //   if (err) throw err;
  //   res.setHeader("Content-Type", "application/json");
  //   console.log("result", result);
  //   return res.json(result);
  // });

  // res.setHeader("Content-Type", "application/json");
  // return res.json({
  //   message: "Success",
  //   status: 200,
  // });
});

app.post("/forgot-password", (req, res) => {
  var transporter = nodemailer.createTransport({
    // service: "gmail",
    // host: "smtp.gmail.com",
    // port: 465,
    // secure: true,
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    // auth: {
    //   user: "shopcrackers29@gmail.com",
    //   pass: "uzme jzwh qoea peko",
    // },
    auth: {
      user: "enquiry@rojapoocrackerssivakasi.com",
      pass: "home@94AVT2023",
    },
  });

  var mailOptions = {
    from: "enquiry@rojapoocrackerssivakasi.com",
    to: req.body.email,
    subject: "Forgot Password Link",
    text: req.body.subject,
    attachments: [
      {
        filename: "home-banner.png",
        path: "./assets/home-banner.png",
        cid: "home-banner",
      },
    ],
    html:
      `<body style="text-align: center;">` +
      `<img src="cid:home-banner" style="width: 100%;"> 
      <a href="http://localhost:5173/change-password">
      <button style="background: #fada7e;
      padding: 30px;
      border: none;
      border-radius: 30px;
      cursor: pointer;
      font-size: 22px;
      font-weight: 600;">Click here to change password</button></a>` +
      `</body>`,
    function(err, info) {
      if (err) {
        console.error(err);
      } else {
        console.log(info);
      }
    },
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(
    JSON.stringify({
      message: "Success",
      status: 200,
    })
  );
  res.end();
  // res.setHeader("Content-Type", "application/json");
  // return res.json({
  //   message: "Success",
  //   status: 200,
  // });

  // var email, phoneNumber;

  // if (req.body.email_or_number) {
  //   if (validator.isEmail(req.body.email_or_number) === true) {
  //     email = req.body.email_or_number;
  //   } else {
  //     phoneNumber = req.body.email_or_number;
  //   }
  // }

  //console.log("@@@@@", email, phoneNumber);

  // const values = [req.body.email];
  // db.query(sql, values, (err, result) => {
  //   if (err) throw err;
  //   res.setHeader("Content-Type", "application/json");
  //   console.log("result", result);
  //   return res.json(result);
  // });
});

app.post("/create-users", (req, res) => {
  const sql =
    "INSERT INTO users (`Id`, `Name`, `PhoneNumber`, `Subject`, `Email`, `Delivery`, `Pincode`) VALUES (?)";
  const values = [
    req.body.id,
    req.body.name,
    req.body.phoneNumber,
    req.body.subject,
    req.body.email,
    req.body.delivery,
    req.body.pincode,
  ];
  console.log("$$$$$$$", values);
  db.query(sql, [values], (err, result) => {
    res.setHeader("Content-Type", "application/json");
    if (err) throw err;
    //return res.json(result);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
  });
});

const signToken = (id) => {
  return jwt.sign({ id: id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

app.post("/login", function (request, response, next) {
  const token = signToken(request.body.id);
  console.log("token login", request.body.name);
  var user_id = request.body.id;
  var user_email_address = request.body.email;
  var user_phone_number = request.body.email;
  var user_password = request.body.password;

  if (user_email_address && user_password) {
    const sql = `
      SELECT * FROM registerNewUsers
      WHERE email = "${user_email_address}"
      OR phoneNumber = "${user_phone_number}"
      `;
    console.log("sql", sql);
    db.query(sql, function (error, data) {
      console.log("&&&&&", data);
      if (data.length > 0) {
        for (var count = 0; count < data.length; count++) {
          if (data[count].password == user_password) {
            let name = data[count].name;
            //response.setHeader("Content-Type", "application/json");
            //response.redirect("/");
            //response.send("correct email & Password");
            //response.setHeader("Content-Type", "application/json");
            // return response.json({
            //   message: "Success",
            //   token,
            //   user_email_address,
            //   phoneNumber: data[count].phoneNumber,
            //   address: data[count].address,
            //   pincode: data[count].pincode,
            //   name,
            //   status: 200,
            //   user_id: data[count].id,
            // });
            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(
              JSON.stringify({
                message: "Success",
                token,
                user_email_address,
                phoneNumber: data[count].phoneNumber,
                address: data[count].address,
                pincode: data[count].pincode,
                name,
                status: 200,
                user_id: data[count].id,
              })
            );
            response.end();
          } else {
            //response.send("Incorrect Password");
            // response.setHeader("Content-Type", "application/json");
            // response.json({ status: 401, message: "Incorrect Password" });

            response.writeHead(200, { "Content-Type": "application/json" });
            response.write(
              JSON.stringify({ status: 401, message: "Incorrect Password" })
            );
            response.end();
          }
        }
      } else {
        //response.send("Incorrect Email Address");
        // response.setHeader("Content-Type", "application/json");
        // response.json({ status: 404, message: "Email Address not found" });

        response.writeHead(200, { "Content-Type": "application/json" });
        response.write(
          JSON.stringify({ status: 404, message: "Email Address not found" })
        );
        response.end();
      }
      response.end();
    });
  } else {
    response.send("Please Enter Email Address and Password Details");
    response.end();
  }
});

app.post("/create_product_list_user", (req, res) => {
  const sql =
    "INSERT INTO UserProductList (`Id`, `UserId`, `ProductList`, `TotalAmount`, `TotalProducts`, `Discount`) VALUES (?)";
  const values = [
    req.body.id,
    req.body.userId,
    req.body.productList,
    req.body.totalAmount,
    req.body.totalProduct,
    req.body.discount,
  ];
  console.log("$$$$$$$", JSON.parse(req.body.totalAmount));
  const sql1 = `
  SELECT * FROM registerNewUsers
  WHERE id = 1
  `;

  console.log("^^^^^^", sql1);
  let getUserInforamtion;
  db.query(sql1, function (error, data) {
    console.log("^^", data);
    getUserInforamtion = data;
    //response.end();
  });

  db.query(sql, [values], (err, result) => {
    if (err) throw err;
    var doc = new jsPDF("p", "pt", "a4");
    var col = ["Product name", "Product Quantity", "Product Prize"];
    var rows = [];
    var col1 = [
      "User Name",
      "Email",
      "Phone Number",
      "Address",
      "Pincode",
      "Total Amount",
    ];
    var rows1 = [];
    var col2 = ["Total Amount"];
    var rows2 = [];
    console.log("*******", getUserInforamtion);
    // doc.text("Customer & Cart Details");
    let getTotalAmount = JSON.parse(req.body.totalAmount);

    doc.text(230, 30, "Customer Details");
    getUserInforamtion.forEach((element) => {
      var temp1 = [
        element.name,
        element.email,
        element.phoneNumber,
        element.address,
        element.pincode,
        getTotalAmount,
      ];
      rows1.push(temp1);
    });

    doc.setFontSize(18);
    doc.setTextColor(40);

    doc.autoTable(col1, rows1, { startY: 40 });
    doc.text(230, 130, "Product Details");
    JSON.parse(req.body.productList).forEach((element) => {
      var temp = [element.productName, element.quantity, element.productPrice];
      rows.push(temp);
    });
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.autoTable(col, rows, { startY: 140 });
    doc.save("BillingDetails.pdf");

    var transporter = nodemailer.createTransport({
      // service: "gmail",
      // host: "smtp.gmail.com",
      // port: 465,
      // secure: true,
      // auth: {
      //   user: "shopcrackers29@gmail.com",
      //   pass: "uzme jzwh qoea peko",
      // },
      host: "smtpout.secureserver.net",
      secure: true,
      secureConnection: false, // TLS requires secureConnection to be false
      tls: {
        ciphers: "SSLv3",
      },
      requireTLS: true,
      port: 465,
      debug: true,
      auth: {
        user: "enquiry@rojapoocrackerssivakasi.com",
        pass: "home@94AVT2023",
      },
    });

    var mailOptions = {
      // from: "shopcrackers29@gmail.com",
      // to: "adhithebaby@gmail.com",
      // subject: "Price List & Customer Details",
      from: getUserInforamtion[0].email,
      to: "enquiry@rojapoocrackerssivakasi.com",
      subject:
        "Hey Sudharsan,  You got an Order !!! Price List & Customer Details",
      attachments: [
        {
          filename: "BillingDetails.pdf",
          path: path.resolve("BillingDetails.pdf"),
          contentType: "application/pdf",
        },
      ],
      function(err, info) {
        if (err) {
          console.error(err);
        } else {
          console.log(info);
        }
      },
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });
    // res.setHeader("Content-Type", "application/json");
    // return res.json({
    //   message: "Success",
    //   status: 200,
    //   result,
    // });

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(
      JSON.stringify({
        message: "Success",
        status: 200,
        result,
      })
    );
    res.end();
  });
});

app.get("/get-users-product-list", (req, res) => {
  const sql = "SELECT * from UserProductList";
  db.query(sql, (err, result) => {
    if (err) throw err;
    // res.setHeader("Content-Type", "application/json");
    // return res.json(result);

    res.writeHead(200, { "Content-Type": "application/json" });
    res.write(JSON.stringify(result));
    res.end();
  });
});

app.post("/create-enquiry", (req, res) => {
  var transporter = nodemailer.createTransport({
    host: "smtpout.secureserver.net",
    secure: true,
    secureConnection: false, // TLS requires secureConnection to be false
    tls: {
      ciphers: "SSLv3",
    },
    requireTLS: true,
    port: 465,
    debug: true,
    auth: {
      user: "enquiry@rojapoocrackerssivakasi.com",
      pass: "home@94AVT2023",
    },
  });

  var mailOptions = {
    from: req.body.email,
    to: "enquiry@rojapoocrackerssivakasi.com",
    subject: "Hey Sudharsan,  You got an Enquiry !!!",
    text: req.body.subject,
    html:
      `<body>` +
      `<table style="border: 1px solid black;
      border-collapse: collapse;">
      <tr>
        <th style="border: 1px solid black;
      border-collapse: collapse;">User Name</th>
        <th style="border: 1px solid black;
      border-collapse: collapse;">User Email</th>
      <th style="border: 1px solid black;
      border-collapse: collapse;">User Phone Number</th>
        <th style="border: 1px solid black;
      border-collapse: collapse;">User Address</th>
        <th style="border: 1px solid black;
      border-collapse: collapse;">Enquiry</th>
      </tr>
      <tr>
        <td style="border: 1px solid black;
      border-collapse: collapse; padding: 20px;">${req.body.name}</td>
        <td style="border: 1px solid black;
      border-collapse: collapse; padding: 20px;">${req.body.email}</td>
      <td style="border: 1px solid black;
      border-collapse: collapse; padding: 20px;">${req.body.phoneNumber}</td>
        <td style="border: 1px solid black;
      border-collapse: collapse; padding: 20px;">${req.body.delivery} ${req.body.pincode}</td>
        <td style="border: 1px solid black;
      border-collapse: collapse; padding: 20px;">${req.body.subject}</td>
      </tr>
    </table>` +
      `</body>`,
    function(err, info) {
      if (err) {
        console.error(err);
      } else {
        console.log(info);
      }
    },
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
  // res.setHeader("Content-Type", "application/json");
  // return res.json({
  //   message: "Success",
  //   status: 200,
  // });

  res.writeHead(200, { "Content-Type": "application/json" });
  res.write(
    JSON.stringify({
      message: "Success",
      status: 200,
    })
  );
  res.end();
});

// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "./client/build/index.html"));
// });

app.listen(port, () => console.log(`Listening on port ${port}`));


// const express = require('express')
// const app = express()
// const db = require('@cyclic.sh/dynamodb')

// app.use(express.json())
// app.use(express.urlencoded({ extended: true }))

// // #############################################################################
// // This configures static hosting for files in /public that have the extensions
// // listed in the array.
// // var options = {
// //   dotfiles: 'ignore',
// //   etag: false,
// //   extensions: ['htm', 'html','css','js','ico','jpg','jpeg','png','svg'],
// //   index: ['index.html'],
// //   maxAge: '1m',
// //   redirect: false
// // }
// // app.use(express.static('public', options))
// // #############################################################################

// // Create or Update an item
// app.post('/:col/:key', async (req, res) => {
//   console.log(req.body)

//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).set(key, req.body)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// // Delete an item
// app.delete('/:col/:key', async (req, res) => {
//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} delete key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).delete(key)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// // Get a single item
// app.get('/:col/:key', async (req, res) => {
//   const col = req.params.col
//   const key = req.params.key
//   console.log(`from collection: ${col} get key: ${key} with params ${JSON.stringify(req.params)}`)
//   const item = await db.collection(col).get(key)
//   console.log(JSON.stringify(item, null, 2))
//   res.json(item).end()
// })

// // Get a full listing
// app.get('/:col', async (req, res) => {
//   const col = req.params.col
//   console.log(`list collection: ${col} with params: ${JSON.stringify(req.params)}`)
//   const items = await db.collection(col).list()
//   console.log(JSON.stringify(items, null, 2))
//   res.json(items).end()
// })

// // Catch all handler for all other request.
// app.use('*', (req, res) => {
//   res.json({ msg: 'no route handler found' }).end()
// })

// // Start the server
// const port = process.env.PORT || 3000
// app.listen(port, () => {
//   console.log(`index.js listening on ${port}`)
// })
