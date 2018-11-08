const machina = require('machina');
const readline = require('readline');

const app = new machina.Fsm({
    initialize: function(options) {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    },
    namespace: "fsm",
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
                            console.log("Could not login with provided credentials");
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
                this.emit("login", {
                    user: this.user,
                });
                console.log("Welcome back '" + this.user.username + "'");
                this.handle("query");
            },
            query: function() {
                this.rl.question('What are you looking for today? ', (query) => {
                    if (query === 'logout') {
                        this.transition("anonymous");
                    } else {
                        this.emit("query", {
                            query: query,
                            user: this.user
                        });
                        this.handle("query");
                    }
                });
            },
            _onExit: function() {
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

app.on("query", function(data) {
    console.log("dispatching query", data.query);
});

app.start();
app.reset();
