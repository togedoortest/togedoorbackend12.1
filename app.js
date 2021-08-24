const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/error-handler');
const path = require('path');
const indexRouter = require('./routes/vindex');
const http = require('http').Server(app);
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('./config/db')();
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
var cors = require('cors'); //use this
const io = require('socket.io')(http, {
    path: '/socket',
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['my-custom-header'],
        credentials: true,
    },
});
// global error handler
app.use(errorHandler);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);

// // swagger docs route
// app.use('/api-docs', require('./helpers/swagger'));

app.use('/sendemail', require('./routes/sendEmail'));
app.use('/users', require('./routes/users'));
app.use('/services', require('./routes/services'));
app.use('/categories', require('./routes/categories'));

app.use('/payments', require('./routes/payments'));
app.use('/subcategories', require('./routes/subCategories'));
// api routes
app.use('/accounts', require('./accounts/accounts.controller'));

//test messages
//const User = require('./models/User');
const User = require('./accounts/account.model');
const Conversation = require('./models/Conversations');
const updateconnectionstatus = async(bool,id)  =>{
    const newIsdisconnected = {
        isConnected:bool
    }
    await User.findByIdAndUpdate(id, { $set: newIsdisconnected  }, { new: true });
    
  const  testuser = await User.findById(id)
    // console.log(testuser );
}
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.query.token;
        var decoded = await jwt.verify(token, 'secret');
        var decoded = await jwt.verify(token, 'secret');   console.log('decoded');
        // console.log('decoded');
        console.log(decoded);
        socket.id = decoded.id;
       //console.log(decoded.user.id);
        // if(!decoded){ throw  Error('error token')}
        // if(!decoded){ console.log('token not');}
        // throw Error('User Does not exist');
         //socket.tok = decoded.user.id;
        socket.tok = decoded.id;  
       console.log('socket.tok' );    
        console.log( socket.tok);    
        next();
    } catch (err) {
		console.log('error token cath');
        console.log(err);
		throw err;
    }
});
//****************************** */

io.on('connection', (socket) => {
    console.log('connected');
    // const id = socket.handshake.query.id2
    const id = socket.tok;
    // console.log('socket.tok:');
    // console.log(socket.tok);

    socket.join(id);
    updateconnectionstatus(true,id)
    socket.on("disconnect", (reason) => {
        // console.log("disconnect id is:");
     
        // console.log(id);

      //  const MyUserIsdisconnected = await (await User.findById(id)).toObject();
        

updateconnectionstatus(false,id)
      });
    // console.log( id);
    socket.on('send-message', ({ recipients, text }) => {
        // console.log('all res');
        // console.log(recipients[0]);
        recipients.forEach((recipient) => {
            const newRecipients = recipients.filter((r) => r !== recipient);
            newRecipients.push(id);
            // console.log('newRecipients');
            // console.log(newRecipients);
            console.log(text);
            // console.log('id');
            // console.log(id);

            /// function emit

            const emitData = async () => {
                const userEmit = await (await User.findById(recipients[0])).toObject();
                const userEmit2 = await (await User.findById(id)).toObject();

                const data = userEmit.conversations;
                const data2 = userEmit2.conversations;

                io.to(recipient).emit('receive-message', { recipients: newRecipients, sender: id, text: data });

                io.to(id).emit('receive-message', {
                    recipients: newRecipients,
                    sender: id,
                    text: data2,

                    // socket.to(recipient).emit('receive-message', {recipients: newRecipients, sender: id,text:data
                    // recipients: newRecipients, sender: id, text
                    // broadcast
                });
            };

            /// end emit
            const SaveInDataBase = async (text, id, recipients) => {
                // console.log('recipients[0]');
                // console.log(recipients[0]);

                try {
                    const user = await (await User.findById(recipients[0])).toObject();
                    const MyUser = await (await User.findById(id)).toObject();

                    const newConversation = {
                        firstname: MyUser.firstName,
                        isChecked: false,
                        isChatting: false,
                        // chattingWith:'no',
                        notRead: 0,
                        ConnectedUserID: id,
                        Topic: [text],
                    };
                    const MyNewConversation = {
                        firstname: user.firstName,
                        isChecked: false,
                        isChatting: false,
                        //  chattingWith:'no',
                        notRead: 0,
                        ConnectedUserID: recipients[0],
                        Topic: ['@?FX56## ' + text],
                    };
                    //user1

                    let ObjWithCoversation = user.conversations.find(({ ConnectedUserID }) => ConnectedUserID == id);
                    let index = user.conversations.findIndex(({ ConnectedUserID }) => ConnectedUserID == id);

                    if (!ObjWithCoversation) {
                        // console.log(ObjWithCoversation);
                        const userFields = {
                            ...user,
                            conversations: [...user.conversations, newConversation],
                        };

                        await User.findByIdAndUpdate(recipients[0], { $set: userFields }, { new: true });
                    } else {
                        // console.log('Available');
 
                        let tempo = user;
                        tempo.conversations[index].Topic = [...user.conversations[index].Topic, text];




//  let tempo=await User.find({
//     _id:recipients[0]
//   },
//   {
//     conversations: {
//       "$elemMatch": {
//         "ConnectedUserID":  id
//       }
//     }
//   })

      

   



                    //     console.log( 'usetDb');
                    //     // console.log( usetDb);
                    // let tempoee=    usetDb
                    // console.log( tempoee[0] );



                        if(tempo.isConnected==false||tempo.chattingWith!=id){
                            tempo.conversations[index].isChecked = false;
                            tempo.conversations[index].notRead++;
                        // console.log(tempo.conversations);
                        }
                        await User.findByIdAndUpdate(recipients[0], { $set: tempo }, { new: true });
                        
      

    //  await   User.updateOne(
    //     { _id: recipients[0], "conversations.ConnectedUserID":id},
    //     { $push: {"conversations.$.Topic": text }}
    //  )
                    }


                    // db.students.updateOne(
                    //     { _id: 4, "grades.grade": 85 },
                    //     { $set: { "grades.$.std" : 6 } }
                    //  )

                    //MyUser
                    let ObjWithCoversation2 = MyUser.conversations.find(
                        ({ ConnectedUserID }) => ConnectedUserID == recipients[0]
                    );
                    let index2 = MyUser.conversations.findIndex(
                        ({ ConnectedUserID }) => ConnectedUserID == recipients[0]
                    );

                    if (!ObjWithCoversation2) {
                        const userFields2 = {
                            ...MyUser,
                            conversations: [...MyUser.conversations, MyNewConversation],
                        };

                        await User.findByIdAndUpdate(id, { $set: userFields2 }, { new: true });
                    } else {

                        
                 
                        // console.log('Available2');

                        let tempo2 = MyUser;
                       
                        tempo2.conversations[index2].Topic = [
                            ...MyUser.conversations[index2].Topic,
                            '@?FX56## ' + text,
                        ];

                     

                        // await User.findByIdAndUpdate(id, { $set: tempo2 }, { new: true });  //work

                

     await   User.updateOne(
                            { _id: id, "conversations.ConnectedUserID":recipients[0]},
                            { $push: {"conversations.$.Topic":'@?FX56## ' + text }}
                         )


                    }

                    //##################
                } catch (err) {
					console.log('`app.js` 195 error:');
					console.error('`app.js` 195 error:');
					console.error(err);

                }
                emitData();
            }; // end fun

            SaveInDataBase(text, id, recipients);

            //   setTimeout(() => {
            //   emitData()

            // }, 600);
        });
    });

    socket.on('Chatting', ({ id, MyId }) => {
        // console.log('chatting');
        // console.log('id = :' + id);
        // console.log('MyID ' + MyId);
        const UpdateMyuser = async () => {
            const MyUser3 = await (await User.findById(MyId)).toObject();

            let ObjWithCoversation3 = MyUser3.conversations.find(({ ConnectedUserID }) => ConnectedUserID == id);
            let index3 = MyUser3.conversations.findIndex(({ ConnectedUserID }) => ConnectedUserID == id);

            let tempo3 = MyUser3;
            tempo3.conversations[index3].isChecked = true;
            tempo3.conversations[index3].notRead = 0;
  // tempo3.conversations[index3].chattingWith=id
  tempo3.chattingWith=id
            // console.log(tempo3.conversations);

            await User.findByIdAndUpdate(MyId, { $set: tempo3 }, { new: true });
        };
        UpdateMyuser();
    });

    socket.on('Delete', ({ DeleteId}) => {

        const Delete=async()=> {
            
       
        try {
            // console.log('delete');
            
            // console.log(DeleteId);
            
         await User.updateOne(
                {_id:id },
                { $pull: { conversations:{ConnectedUserID:DeleteId.ConnectedUserID}} },
                // { multi: true }
              )
             
   
      


        } catch (error) {
            console.log(error);
        }
    }
    Delete()
    
    });

    socket.on('isminmized', ({ isminmized, MyId }) => {
     
        // console.log(isminmized+"'' " + MyId);
        const FuncIsminmized = async () => {
  
if(isminmized)updateconnectionstatus(false,MyId )
else updateconnectionstatus(true,MyId )


        };
        FuncIsminmized();
    });
});



const Message = require('./models/Messages');

const port = process.env.PORT || 9000;

//app.listen(PORT, () => {
//  Server.listen(port, () => {
http.listen(port, () => {
    console.log('Server started on port ' + port + '...');
    console.log('--------------------------------------------------------');
});
// module.exports = httpServer;
