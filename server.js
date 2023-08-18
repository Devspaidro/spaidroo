const express = require('express');
const http = require('http'); // استورد مكتبة http
const app = express();
const port = 3000;
const path = require('path');
const ejs = require('ejs');
const mongoose = require('mongoose');

//ربط ملفات الفرونت اند
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render('index');
});
//تكوين شيما مع انشاء داتا بيس
mongoose.connect('mongodb://localhost:27017/usersArabWest', {
    useUnifiedTopology: true,
    useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
    username: String
});

const User = mongoose.model('User', userSchema);

app.post('/addUser', async (req, res) => {
    const { username } = req.body;
    try {
        if (username) {
            const newUser = new User({ username });
            await newUser.save();
            res.redirect('/home');
        } else {
            res.status(400).send('لم يتم ادخال اسم المستخدم ');
        }
    } catch (error) {
        res.status(500).send('An error occurred while adding the user');
    }
});

app.get('/home', (req, res) => {
    res.render('home'); // تقديم ملف home.ejs
});

//-----------------------------------------------------------------
//-----------------------------------------------------------------
//عمل كاونتر يحسب  الاونلاين
const server = http.createServer(app); // إنشاء مثيل http.Server
// تكوين اتصال Socket.io باستخدام مثيل الخادم
const socketIO = require('socket.io');
const io = socketIO(server);

let count = 0;

io.on('connection', (socket) => {
    console.log("a user connected !");
    count++;
    io.emit('usercnt', count);

    socket.on('disconnect', () => {
        console.log("a user disconnected!")
        count--;
        io.emit('usercnt', count);
    });
});
//-----------------------------------------------------------------
//-----------------------------------------------------------------
//----- save Mambers visit
let visitCount = 0;

io.on('connection', (socket2) => {
    // زيادة عدد زيارات الصفحة
    visitCount++;

    // إرسال عدد زيارات الصفحة للعميل
    io.emit('updateVisitCount', visitCount);

    socket2.on('disconnect', () => {
        // لا يمكن تنقيص عدد الزيارات هنا
    });
});

//---------------- Contact Form Arab West  ----------------------

const userSchema2 = new mongoose.Schema({
    email: String,
    message: String,
  });
  
  const UserModel = mongoose.model('Email-Users', userSchema2);
  
  module.exports = UserModel;
// مسار POST لحفظ بيانات المستخدم
app.post('/users', async (req, res) => {
    const { email, message } = req.body;
    
    try {
      const newUser = new UserModel({ email, message });
      await newUser.save();
      
      // توجيه المستخدم إلى صفحة النجاح بعد حفظ البيانات
      res.redirect('/successfully');
    } catch (error) {
      console.error('Error saving data:', error);
      res.status(500).send('Failed to save data.');
    }
  });
  
  // مسار GET لصفحة النجاح
  app.get('/successfully', (req, res) => {
    res.render('successfully'); // تقديم ملف successfully.ejs
  });
  
//========================================================
server.listen(port, () => {
    console.log('Server is running on port ' + port);
});
