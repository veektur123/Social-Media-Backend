const router = require('express').Router();
const { User } = require('../../models');
const {
  getUsers,
  getSingleUser,
  createUser,
} = require('../../controllers/userController');

//Get all users 
router.get('/', async (req,res) => {
  try {
    const users = await User.find();
    return res.json(users)
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Get single user by ID
router.get('/:id', async (req,res) => {
  try {
    const {id} = req.params
    if(!id){
      return res.status(400).json({message: 'ID must be defined'})
    }
    if(typeof id !== 'string'){
      return res.status(400).json({message: 'ID must be a string'})
    }
    const user = await User.findById(id).populate('friends').populate('thoughts')
    if(!user){
      return res.status(404).json({message: 'User not found'})
    }
    return res.json(user)
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Post new user
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body
    if(!username || !email) {
      return res.status(400).json({message: "username, email must be defined"})
    }

    if(typeof username !== 'string' || typeof email !== 'string') {
      return res.status(400).json({message: "username, emai must be strings"})
    }


    const createdUser = await User.create({username, email})
    return res.json(createdUser)
  } catch (e) {
    if(e?.keyPattern?.userName){
      return res.status(400).json({message: 'Username must be unique'})
    }
    return res.status(500).json(e)
  }
})


//Delete user by ID
router.delete('/:id', async (req,res) => {
  try {
    const {id} = req.params
    if(!id){
      return res.status(400).json({message: 'ID must be defined'})
    }
    if(typeof id !== 'string'){
      return res.status(400).json({message: 'ID must be a string'})
    }
    const response = await User.deleteOne({_id: id})

    if(response.deletedCount){
      return res.json({message: 'User successfully deleted'})
    } else {
      return res.status(404).json({message: 'User not found'})
    }
    
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Update user by its ID 
router.put('/:id', async (req, res) => {
  try {
    const { username, email } = req.body
    const { id } = req.params

    if(!id){
      return res.status(400).json({message: 'ID must be defined'})
    }
    if(typeof id !== 'string'){
      return res.status(400).json({message: 'ID must be a string'})
    }
    if(!username || !email ) {
      return res.status(400).json({message: "username, email must be defined"})
    }
    if(typeof username !== 'string' || typeof email !== 'string') {
      return res.status(400).json({message: "username, email must be strings"})
    }

    const response = await User.updateOne({_id: id}, {username, email})

    if(response.matchedCount){
      return res.json({message: 'User successfully updated'})
    } else {
      return res.status(404).json({message: 'User not found'})
    }
  } catch (e) {
    if(e?.keyPattern?.userName){
      return res.status(400).json({message: 'Username must be unique'})
    }
    return res.status(500).json(e)
  }
})

router.post('/:userId/friends/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params

    const response = await User.updateOne({_id: userId}, { $addToSet: {friends: friendId}})
    await User.updateOne({_id: friendId}, { $addToSet: {friends: userId}})

    if(response.matchedCount){
      return res.json({message: 'User successfully updated'})
    } else {
      return res.status(404).json({message: 'User not found'})
    }
  } catch (e) {
    if(e?.keyPattern?.userName){
      return res.status(400).json({message: 'Username must be unique'})
    }
    return res.status(500).json(e)
  }
})

router.delete('/:userId/friends/:friendId', async (req, res) => {
  try {
    const { userId, friendId } = req.params

    const response = await User.updateOne({_id: userId}, { $pull: {friends: friendId}})
    await User.updateOne({_id: friendId}, { $pull: {friends: userId}})

    if(response.matchedCount){
      return res.json({message: 'User successfully updated'})
    } else {
      return res.status(404).json({message: 'User not found'})
    }
  } catch (e) {
    if(e?.keyPattern?.userName){
      return res.status(400).json({message: 'Username must be unique'})
    }
    return res.status(500).json(e)
  }
})

module.exports = router;
