/* eslint-disable comma-dangle */
'use strict';

require('dotenv').config();
const inquirer = require('inquirer');
const io = require('socket.io-client');
const ui = new inquirer.ui.BottomBar();

// const serverChannel = io.connect(
//   'https://command-love-interface.herokuapp.com'
// );
const serverChannel = io.connect('http://localhost:3001');

async function loginOrCreate() {
  let input = await inquirer.prompt([
    {
      type: 'list',
      name: 'loginChoice',
      message: 'Welcome to the Command-Love-Interface!',
      choices: ['Log In', 'Sign Up'],
    },
  ]);

  if (input.loginChoice === 'Log In') {
    login();
  } else createUser();
}

async function login() {
  let input = await inquirer.prompt([
    { name: 'username', message: 'Please enter your username:' },
  ]);

  let pass = await inquirer.prompt([
    {
      type: 'password',
      mask: ['default'],
      name: 'password',
      message: 'Please enter your password:',
    },
  ]);

  const signupObject = {
    username: input.username,
    password: pass.password,
  };

  serverChannel.emit('signin', signupObject);
}

async function createUser() {
  let newUsername = await inquirer.prompt([
    { name: 'username', message: 'Choose a username:' },
  ]);

  let newPass = await inquirer.prompt([
    {
      type: 'password',
      mask: ['default'],
      name: 'password',
      message: 'Please choose a password:',
    },
  ]);

  let newEmail = await inquirer.prompt([
    { name: 'email', message: 'Enter your email:' },
  ]);

  let newFav = await inquirer.prompt([
    {
      name: 'favLanguage',
      message: 'What is your favorite development language?',
    },
  ]);

  let newDesc = await inquirer.prompt([
    {
      name: 'description',
      message: 'Tell us about yourself in one sentence:',
    },
  ]);

  let newOs = await inquirer.prompt([
    { name: 'os', message: 'What operating system do you use?' },
  ]);

  const newUser = {
    username: newUsername.username,
    password: newPass.password,
    email: newEmail.email,
    favLanguage: newFav.favLanguage,
    description: newDesc.description,
    os: newOs.os,
  };

  serverChannel.emit('signup', newUser);

  ui.log.write('NEW USER: ', newUser);
  ui.log.write(
    `Welcome to the Command-Love-Interface, ${newUser.username}! Please log in to get started.`
  );
  login();
}

async function validateMe(username) {
  if (username) {
    serverChannel.emit('connected', username);
  } else {
    ui.log.write('Invalid login. Please try again.');
    loginOrCreate();
  }
}

async function getInput(username) {
  let input;
  while (true) {
    input = null;
    input = await inquirer.prompt([{ name: 'text', message: ' ' }]);

    // let message = `[${username}]: ${input.text}`;

    let messageObj = {
      message: input.text,
      sender: username,
      room: 'lobby',
    };

    await serverChannel.emit('message', messageObj);
  }
}

////////////////////// MENU OPTION FUNCTIONS //////////////////////

async function discover(userPoolArr) {
  ui.log.write('You chose: DISCOVER');
  if (userPoolArr.length) {
    ui.log.write(`USERS ONLINE: ${userPoolArr.length}`);
    userPoolArr.map((user) => {
      ui.log.write(user);
    });
  } else {
    ui.log.write('No users currently online.');
  }

  // let input = await inquirer.prompt([
  //   {
  //     type: 'list',
  //     name: 'choice',
  //     message: 'Options: ',
  //     choices: ['Previous', 'Next', 'Back to Main Menu', 'Logout'],
  //   },
  // ]);
}

async function newChat(username) {
  getInput(username);
}

async function resumeChat(payload) {
  // "messages"
  // Remember: Getting back many/an array of objects (each with sender, message keys)
  payload.messages.forEach((message) => {
    ui.log.write(`[${message.sender}]: ${message.message}`);
  });
  getInput(payload.username); // needs to happen here
}

async function profile(userProfile) {
  ui.log.write('You chose: PROFILE');
  console.log('USER PROFILE:', userProfile);

  // for (const [key, value] of Object.entries(userProfile)) {
  //   console.log(`${key}: ${value}`);

  // let input = await inquirer.prompt([
  //   {
  //     type: 'list',
  //     name: 'choice',
  //     message: 'Options: ',
  //     choices: ['Show My Profile', 'Back to Main Menu', 'Logout'],
  //   },
  // ]);
}

// User needs to manually exit
async function logout(username) {
  ui.log.write('You chose: LOGOUT');
  ui.log.write(
    'Please press "CTRL/CMD + C" on your keyboard at any time to disconnect. You will be logged out.'
  );
}

// MAIN MENU FUNCTION
async function menu(username) {
  let input = await inquirer.prompt([
    {
      type: 'list',
      name: 'menuChoice',
      message:
        'Welcome to Command Love Interface! \n What would you like to do?',
      choices: ['Discover', 'New Chat', 'Resume Chat', 'Profile', 'Logout'],
    },
  ]);
  if (input.menuChoice === 'Discover') {
    serverChannel.emit('discover');
  } else if (input.menuChoice === 'New Chat') {
    return newChat(username);
  } else if (input.menuChoice === 'Resume Chat') {
    serverChannel.emit('resumeChat', username); // username will be a string
  } else if (input.menuChoice === 'Profile') {
    serverChannel.emit('profile', username);
  } else if (input.menuChoice === 'Logout') {
    return logout(username);
  } else {
    ui.log.write(
      'Oops! That didn\t work. Please try again using the methods provided.'
    );
  }
}

module.exports = {
  login,
  createUser,
  loginOrCreate,
  validateMe,
  getInput,
  menu,
  discover,
  chat: newChat,
  profile,
  logout,
  resumeChat,
  // sendMessage,
  serverChannel,
  ui,
};

// well-defined object keys
// users[socket.username] = { username: username, id: socket.id };
//
