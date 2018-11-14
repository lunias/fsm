const Screen = require('./Screen.js');

function UserRequest (handlerInput) {

  this._handlerInput = handlerInput;
  this._screen = extractScreen(handlerInput);

  function extractScreen(handlerInput) {
    return new Screen.Screen(handlerInput.shape, handlerInput.dimensions);
  }

  let that = this;

  this.getScreen = () => {
    return that._screen;
  };

  this.setState = (key, value) => {
    that._handlerInput.addAttribute(key, value);
  };
}

exports.UserRequest = UserRequest;
