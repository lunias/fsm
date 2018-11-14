const Screen = require('./Screen').Screen;

function UserRequest (handlerInput) {

  this._handlerInput = handlerInput;
  this._screen = extractScreen(handlerInput);

  function extractScreen(handlerInput) {
    return new Screen(handlerInput.shape, handlerInput.dimensions);
  }

  let that = this;

  this.getScreen = () => {
    return that._screen;
  };

  this.setState = (key, value) => {
    that._handlerInput.addAttribute(key, value);
  };

  this.respond = (template, data) => {
    
  };
}

module.exports = UserRequest;
