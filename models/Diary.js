'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

var diarySchema = Schema( {
  title: String,
  weather: String,
  content: String,
  createdAt: Date,
} );

module.exports = mongoose.model( 'Diary', diarySchema );
