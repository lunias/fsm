const machina = require('machina');
const readline = require('readline');

const hoursFsm = function() {
    let fsm = new machina.Fsm({
        initialState: "prompt",
        states: {
            "prompt": {
                _onEnter: function() {

                },
                "*": function() {
                    console.log('hours');
                }
            }
        }
    });
    return fsm;
};

const locationFsm = function() {
    let fsm = new machina.Fsm({
        initialState: "prompt",
        states: {
            "prompt": {
                _onEnter: function() {

                },
                "*": function() {
                    console.log('location');
                }
            }
        }
    });
    return fsm;
};

const app = new machina.Fsm({
    initialize: function(options) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.fsms = [hoursFsm, locationFsm].reduce((map, fsm) => {
            map[fsm.name] = fsm;
            return map;
        }, {});
    },
    namespace: "app",
    initialState: "uninitialized",
    states: {
        uninitialized: {
            "*": function() {
                this.deferUntilTransition();
                this.transition("anonymous");
            }
        },
        anonymous: {
            _onEnter: function() {
                console.log("Welcome anonymous user.");
                this.handle("loginPrompt");
            },
            loginPrompt: function() {
                this.rl.question('Username: ', (username) => {
                    this.rl.question('Password: ', (password) => {
                        if (password === 'asdf') {
                            this.user = {
                                'username': username,
                                'password': password
                            };
                            this.transition("authenticated");
                        } else {
                            console.log("Could not login with provided credentials.");
                            this.handle("loginPrompt");
                        }
                    });
                });
            },
            _onExit: function() {

            }
        },
        authenticated: {
            _onEnter: function() {
                this.emit('login', {
                    user: this.user
                });
                console.log("Welcome back '" + this.user.username + "'.");
                this.handle('prompt');
            },
            prompt: function() {
                this.rl.question('hours, location, or logout? ', (hoursOrLocation) => {
                    if (hoursOrLocation === 'logout') {
                        this.transition('anonymous');
                    } else if (hoursOrLocation == 'hours') {
                        this.fsms['hoursFsm']().handle('');
                    } else if (hoursOrLocation == 'location') {
                        this.fsms['locationFsm']().handle('');
                    } else {
                        console.log('I didn\'t understand.');
                        this.handle('prompt');
                    }
                });
            },
            _onExit: function() {
              this.emit('logout', {
                user: this.user
              });
              this.user = undefined;
            }
        }
    },
    reset: function() {
        this.handle("_reset");
    },
    start: function() {
        this.handle("start");
    }
});

app.on("transition", function(data) {
    console.log("transitioned from " + data.fromState + " to " + data.toState);
});

app.on("login", function(data) {
    console.log("got login event", data);
});

app.on("logout", function(data) {
  console.log("got logout event", data);
});

app.start();
app.reset();
