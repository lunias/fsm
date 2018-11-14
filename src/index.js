const machina = require('machina');
const readline = require('readline');

const UserRequest = require('./UserRequest');
const Screen = require('./Screen');

let request = new UserRequest({'shape': 'round', 'dimensions': '1920x1080'});

let screen = request.getScreen();

console.log(`screen ${JSON.stringify(screen)}`);
console.log(`size ${screen.getSize()} type ${screen.getType()}`);
if (Screen.Type.round === screen.getType()) {
  console.log(`round screen`);
}


const hoursFsm = function(app) {
    let fsm = new machina.Fsm({
        initialState: "prompt",
        states: {
            "prompt": {
                "prompt": function() {
                    let user = app.user;
                    if (user.zip) {
                        console.log("hours are 08:00 to 18:00 at your nearest location");
                        app.prompt('prompt');
                    } else {
                        app.getFsm(locationFsm.name).prompt(this);
                    }
                }
            }
        },
        prompt: function() {
            this.handle('prompt');
        }
    });
    return fsm;
};

const zipCodeQuestion = function(app, fsm) {
    app.rl.question('what is your zip code? ', (zip) => {
        app.user.zip = zip;
        app.emit('zipUpdated', {
            user: app.user
        });
        fsm.prompt();
    });
};

const locationFsm = function(app) {
    let fsm = new machina.Fsm({
        initialState: "prompt",
        states: {
            "prompt": {
                "prompt": function(invokingFsm) {
                    let user = app.user;
                    if (user.zip) {
                        console.log("nearest location found for zip:", user.zip);
                        app.prompt('prompt');
                    } else {
                        if (!invokingFsm) {
                            invokingFsm = this;
                        }
                        zipCodeQuestion(app, invokingFsm);
                    }
                }
            }
        },
        prompt: function(invokingFsm) {
            this.handle('prompt', invokingFsm);
        }
    });
    return fsm;
};

const isFunction = function(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
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
        this.getFsm = function(functionName) {
            let fsm = this.fsms[functionName];
            if (isFunction(fsm)) {
                this.fsms[functionName] = fsm(app);
            }
            return this.fsms[functionName];
        };
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
                this.login();
            },
            login: function() {
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
                            this.login();
                        }
                    });
                });
            }
        },
        authenticated: {
            _onEnter: function() {
                this.emit('login', {
                    user: this.user
                });
                console.log("Welcome back '" + this.user.username + "'.");
                this.prompt();
            },
            prompt: function() {
                this.rl.question('hours, location, or logout? ', (hoursOrLocation) => {
                    if (hoursOrLocation === 'logout') {
                        this.transition('anonymous');
                    } else if (hoursOrLocation == 'hours') {
                        this.getFsm(hoursFsm.name).prompt();
                    } else if (hoursOrLocation == 'location') {
                        this.getFsm(locationFsm.name).prompt();
                    } else {
                        console.log('I didn\'t understand.');
                        this.prompt();
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
    start: function() {
        this.handle("start");
    },
    login: function() {
        this.handle("login");
    },
    prompt: function() {
        this.handle("prompt");
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

app.on("zipUpdated", function(data) {
    console.log("updated user zip code to", data.user.zip);
});

app.start();
