const { Schema, model } = require('mongoose');

// Schema to create User model
const userSchema = new Schema(
  {
    username: String,
    email: String,
    thoughts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'thought',
      },
    ],
    friends: [
      {
        type: Schema.Types.ObjectId,
        ref: 'user',
      },
    ],

  },
  {

    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);


userSchema
  .virtual('friendCount')
  // Getter
  .get(function () {
    return this.friends.length;
  })


const User = model('user', userSchema);

module.exports = User;
