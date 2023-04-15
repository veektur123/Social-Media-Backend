const router = require('express').Router();
const { Thought, User } = require('../../models');

//Get all thoughts 
router.get('/', async (req,res) => {
  try {
    const thoughts = await Thought.find();
    return res.json(thoughts)
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Get single thought by ID
router.get('/:id', async (req,res) => {
  try {
    const {id} = req.params
    if(!id){
      return res.status(400).json({message: 'ID must be defined'})
    }
    if(typeof id !== 'string'){
      return res.status(400).json({message: 'ID must be a string'})
    }
    const thoughts = await Thought.findById(id)
    if(!thoughts){
      return res.status(404).json({message: 'Thought not found'})
    }
    return res.json(thoughts)
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Post new thought
router.post('/', async (req, res) => {
  try {
    const { thoughtText, username } = req.body

    if(!thoughtText || !username ) {
      return res.status(400).json({message: "thoughtText and username must be defined"})
    }

    if(typeof username !== 'string' || typeof thoughtText !== 'string') {
      return res.status(400).json({message: "username and thoughtText must be strings"})
    }


    const createdThought = await Thought.create({ thoughtText, username })
    await User.updateOne({username}, { $addToSet: {thoughts: createdThought._id}})
    return res.json(createdThought)
  } catch (e) {
    if(e?.keyPattern?.userName){
      return res.status(400).json({message: 'Username must be unique'})
    }
    return res.status(500).json(e)
  }
})

//Update thought
router.put('/:thoughtId', async (req, res) => {
  try {
    const { thoughtText } = req.body
    const { thoughtId } = req.params

    if(!thoughtText) {
      return res.status(400).json({message: "thoughtText must be defined"})
    }

    if(typeof thoughtText !== 'string') {
      return res.status(400).json({message: "thoughtText must be strings"})
    }


    await Thought.updateOne({_id: thoughtId}, {thoughtText})
    return res.json({message: 'Thought successfully updated!'})
  } catch (e) {
    return res.status(500).json(e)
  }
})


//Delete thought by ID
router.delete('/:id', async (req,res) => {
  try {
    const {id} = req.params
    if(!id){
      return res.status(400).json({message: 'ID must be defined'})
    }
    if(typeof id !== 'string'){
      return res.status(400).json({message: 'ID must be a string'})
    }
    const thoughtToDelete = await Thought.findById(id)
    const response = await Thought.deleteOne({where: {_id: thoughtToDelete._id}})
    await User.updateOne({username: thoughtToDelete.username}, { $pull: {thoughts: thoughtToDelete._id}})

    if(response.deletedCount){
      return res.json({message: 'Thought successfully deleted'})
    } else {
      return res.status(404).json({message: 'Thought not found'})
    }
    
  } catch (e) {
    return res.status(500).json(e)
  }
})


//Post new thoughtId Reactions
router.post('/:thoughtId/reactions', async (req, res) => {
  try {
    const { reactionBody, username } = req.body
    const { thoughtId } = req.params

    if( !reactionBody || !username ) {
      return res.status(400).json({message: "reactionBody, and username must be defined"})
    }

    if( typeof reactionBody !== 'string' || typeof username !== 'string') {
      return res.status(400).json({message: "username and reactionBody must be strings"})
    }


    const updatedThought = await Thought.updateOne({_id: thoughtId}, { $addToSet: {reactions: {reactionBody, username}}})
    return res.json(updatedThought)
  } catch (e) {
    return res.status(500).json(e)
  }
})

//Delete reaction by ID
router.delete('/:thoughtId/reactions/:reactionId', async (req,res) => {
  try {
    const {thoughtId, reactionId} = req.params

    const response = await Thought.updateOne({_id: thoughtId}, { $pull: {reactions: { reactionId }}})
    console.log(response)
    if(response.matchedCount){
      return res.json({message: 'Reaction successfully deleted'})
    } else {
      return res.status(404).json({message: 'Reaction not found'})
    }
    
  } catch (e) {
    return res.status(500).json(e)
  }
})

module.exports = router;
